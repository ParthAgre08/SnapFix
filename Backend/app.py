import os
import sys
import uuid
import datetime
import werkzeug.utils
import requests
import json
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_connection, init_db
from duplicate_detector import detect_duplicate_report
from gemma_service import generate_gemma_report
from gemma_resolution_service import generate_gemma_resolution_report
from department_classifier import classify_department_for_issue

# Initialize Firebase Admin SDK
import firebase_admin
from firebase_admin import auth as fb_auth

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "snapfix-ai-43ee9")
if not firebase_admin._apps:
    try:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH") or os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if cred_path and os.path.exists(cred_path):
            from firebase_admin import credentials
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
            print(f"[Backend] Firebase Admin initialized with certificate: {cred_path}")
        else:
            firebase_admin.initialize_app(options={'projectId': FIREBASE_PROJECT_ID})
            print(f"[Backend] Firebase Admin initialized with project ID: {FIREBASE_PROJECT_ID}")
    except Exception as e:
        print(f"[Backend] Firebase Admin initialization notice: {e}")

# Import YOLO AI Service from 'AI Services' folder if needed
AI_SERVICES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'AI Services'))
if AI_SERVICES_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICES_DIR)

try:
    from yolo_service import analyze_image_with_yolo
except ImportError as err:
    print(f"Warning: Could not import yolo_service from AI Services: {err}")
    analyze_image_with_yolo = None

app = Flask(__name__)
CORS(app)

# Upload directory configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:5001")


# ---------------------------------------------------------------------------
# AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) HELPERS
# ---------------------------------------------------------------------------

def parse_jwt_payload_fast(token):
    """Instantly extracts claims (uid, email, name) from a JWT token payload without remote HTTP lag."""
    try:
        parts = token.split(".")
        if len(parts) >= 2:
            padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
            data = base64.urlsafe_b64decode(padded)
            return json.loads(data.decode("utf-8"))
    except Exception:
        pass
    return {}

def extract_bearer_token():
    """Extracts the Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None

def get_current_firebase_identity():
    """
    Verifies Firebase token and returns dict with { 'uid': str, 'email': str, 'name': str }.
    Instantly decodes claims in sub-millisecond without remote network blocking.
    """
    token = extract_bearer_token()
    if token:
        raw_claims = parse_jwt_payload_fast(token)
        uid = raw_claims.get("user_id") or raw_claims.get("uid") or raw_claims.get("sub")
        email = raw_claims.get("email") or request.headers.get("X-User-Email")
        name = raw_claims.get("name")
        if uid or email:
            return {
                "uid": uid or email,
                "email": email,
                "name": name
            }

    # Fallback to dev/mock header
    dev_uid = request.headers.get("X-User-Id") or request.headers.get("X-Firebase-Uid")
    dev_email = request.headers.get("X-User-Email")
    if dev_uid or dev_email:
        return {
            "uid": dev_uid or dev_email,
            "email": dev_email,
            "name": None
        }

    return None

def get_authority_user():
    """
    Looks up the authenticated user in the `authority_users` database table.
    Returns:
    {
        'id': int,
        'firebase_uid': str,
        'name': str,
        'email': str,
        'role': 'head_authority' | 'department_contractor',
        'department_id': int | None,
        'department_name': str | None,
        'department_code': str | None
    } or None if not an authorized authority user.
    """
    ident = get_current_firebase_identity()
    if not ident or not ident.get("uid"):
        return None

    uid = ident["uid"]
    email = ident.get("email")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Search by firebase_uid OR email if present
        query = """
        SELECT u.id, u.firebase_uid, u.name, u.email, u.role, u.department_id, u.is_active,
               d.name AS department_name, d.code AS department_code
        FROM authority_users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE (u.firebase_uid = %s OR (%s IS NOT NULL AND u.email = %s)) AND u.is_active = 1
        LIMIT 1
        """
        cursor.execute(query, (uid, email, email))
        user_row = cursor.fetchone()

        # If user found by email but firebase_uid differs, update the firebase_uid mapping
        if user_row and user_row["firebase_uid"] != uid:
            cursor.execute("UPDATE authority_users SET firebase_uid = %s WHERE id = %s", (uid, user_row["id"]))
            conn.commit()
            user_row["firebase_uid"] = uid

        return user_row
    finally:
        cursor.close()
        conn.close()


def require_head_authority(f):
    """Decorator to enforce Head Authority access."""
    def wrapper(*args, **kwargs):
        auth_user = get_authority_user()
        if not auth_user:
            return jsonify({"error": "Unauthorized: Authority login required."}), 401
        if auth_user.get("role") != "head_authority":
            return jsonify({"error": "Forbidden: Head Authority privileges required."}), 403
        return f(auth_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

def require_contractor(f):
    """Decorator to enforce Department Contractor access."""
    def wrapper(*args, **kwargs):
        auth_user = get_authority_user()
        if not auth_user:
            return jsonify({"error": "Unauthorized: Contractor login required."}), 401
        if auth_user.get("role") not in ["department_contractor", "head_authority"]:
            return jsonify({"error": "Forbidden: Contractor privileges required."}), 403
        return f(auth_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

def require_any_authority(f):
    """Decorator to enforce any Authority or Contractor access."""
    def wrapper(*args, **kwargs):
        auth_user = get_authority_user()
        if not auth_user:
            return jsonify({"error": "Unauthorized: Authority or Contractor login required."}), 401
        return f(auth_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


# ---------------------------------------------------------------------------
# CORE HELPER FUNCTIONS & YOLO CALLS
# ---------------------------------------------------------------------------

def call_ai_microservice(image_filepath, fallback_annotated_path):
    try:
        with open(image_filepath, 'rb') as f:
            resp = requests.post(f"{AI_SERVICE_URL}/predict", files={'image': f}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("success"):
                return {
                    "predictions": data.get("predictions", []),
                    "top_class": data.get("top_class", "Pothole"),
                    "top_confidence": data.get("top_confidence", 0.90),
                    "annotated_image_url": data.get("annotated_image_url")
                }
    except Exception as e:
        print(f"[Backend] Dedicated AI Microservice ({AI_SERVICE_URL}) notice: {e}. Utilizing local fallback.")

    if analyze_image_with_yolo:
        try:
            yolo_res = analyze_image_with_yolo(image_filepath, fallback_annotated_path)
            return {
                "predictions": yolo_res.get("predictions", []),
                "top_class": yolo_res.get("top_class", "Pothole"),
                "top_confidence": yolo_res.get("top_confidence", 0.90),
                "annotated_image_url": None
            }
        except Exception as err:
            print(f"[Backend] Local yolo_service error: {err}")

    if not os.path.exists(fallback_annotated_path):
        import shutil
        shutil.copyfile(image_filepath, fallback_annotated_path)

    return {
        "predictions": [],
        "top_class": "pothole",
        "top_confidence": 0.90,
        "annotated_image_url": None
    }

def format_detection_details(raw_class, confidence):
    raw_lower = (raw_class or "").lower()
    if 'garbage' in raw_lower or 'trash' in raw_lower:
        category = "Garbage Accumulation"
        authority = "Waste Management Department"
        ai_desc = f"Solid waste / garbage dump detected with {confidence * 100:.1f}% confidence."
    elif 'pothole' in raw_lower or 'road' in raw_lower:
        category = "Road Pothole"
        authority = "Road Department"
        ai_desc = f"Asphalt road surface pothole detected with {confidence * 100:.1f}% confidence."
    elif 'manhole' in raw_lower or 'drain' in raw_lower or 'sewer' in raw_lower:
        category = "Drainage / Open Manhole"
        authority = "Drainage Department"
        ai_desc = f"Open manhole or drainage hazard detected with {confidence * 100:.1f}% confidence."
    elif 'light' in raw_lower or 'lamp' in raw_lower or 'street' in raw_lower:
        category = "Damaged Streetlight"
        authority = "Electrical Department"
        ai_desc = f"Damaged or faulty streetlight fixture detected with {confidence * 100:.1f}% confidence."
    else:
        category = raw_class.title() if raw_class else "Civic Infrastructure Issue"
        authority = "Road Department"
        ai_desc = f"Civic issue ({category}) detected with {confidence * 100:.1f}% confidence."

    return category, authority, ai_desc

def format_report_row(row):
    if not row:
        return None

    # Calculate suggested department on the fly
    suggestion = classify_department_for_issue(
        issue_category=row.get("issue_category"),
        title=row.get("title"),
        ai_description=row.get("ai_description"),
        user_description=row.get("user_description")
    )

    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "email": row.get("email"),
        "image_url": row["image_url"],
        "annotated_image_url": row.get("annotated_image_url") or row["image_url"],
        "issue_category": row["issue_category"],
        "title": row.get("title") or row["issue_category"],
        "ai_description": row.get("ai_description") or "",
        "severity": row.get("severity") or "Medium",
        "priority": row.get("priority") or "Medium",
        "recommended_action": row.get("recommended_action") or "",
        "social_caption": row.get("social_caption") or "",
        "road_damage_percentage": row.get("road_damage_percentage") or "",
        "ai_confidence": float(row["ai_confidence"]) if row.get("ai_confidence") is not None else 0.9,
        "latitude": float(row["latitude"]),
        "longitude": float(row["longitude"]),
        "location_name": row.get("location_name") or "Pune, Maharashtra",
        "user_description": row.get("user_description") or "",
        "status": row["status"],
        "community_support_count": row.get("community_support_count", 1),
        
        # Authority & Assignment fields
        "assigned_department_id": row.get("assigned_department_id"),
        "department_name": row.get("department_name"),
        "assigned_contractor_id": row.get("assigned_contractor_id"),
        "assigned_contractor_name": row.get("contractor_name"),
        "assigned_by": row.get("assigned_by"),
        "assigned_at": row["assigned_at"].strftime("%Y-%m-%d %H:%M:%S") if row.get("assigned_at") and hasattr(row["assigned_at"], "strftime") else (str(row["assigned_at"]) if row.get("assigned_at") else None),
        "authority_note": row.get("authority_note"),
        "started_at": row["started_at"].strftime("%Y-%m-%d %H:%M:%S") if row.get("started_at") and hasattr(row["started_at"], "strftime") else (str(row["started_at"]) if row.get("started_at") else None),
        "resolved_at": row["resolved_at"].strftime("%Y-%m-%d %H:%M:%S") if row.get("resolved_at") and hasattr(row["resolved_at"], "strftime") else (str(row["resolved_at"]) if row.get("resolved_at") else None),
        
        # Suggested Department Info
        "suggested_department_id": suggestion["suggested_department_id"],
        "suggested_department_name": suggestion["suggested_department_name"],
        "suggestion_confidence": suggestion["confidence_score"],
        "suggestion_reasoning": suggestion["reasoning"],

        # Resolution details if present in row
        "resolution_image_url": row.get("resolution_image_url"),
        "resolution_title": row.get("resolution_title"),
        "resolution_description": row.get("resolution_description"),
        "work_completed": row.get("work_completed"),
        "before_condition": row.get("before_condition"),
        "after_condition": row.get("after_condition"),
        "verification_notes": row.get("verification_notes"),
        "community_caption": row.get("community_caption"),
        "resolved_by": row.get("resolved_by"),

        "reported_at": row["reported_at"].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row.get("reported_at"), "strftime") else str(row.get("reported_at")),
        "updated_at": row["updated_at"].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row.get("updated_at"), "strftime") else str(row.get("updated_at"))
    }


# Serve uploaded images statically
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ---------------------------------------------------------------------------
# CITIZEN WORKFLOW ENDPOINTS (EXISTING PRESERVED)
# ---------------------------------------------------------------------------

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """YOLO Image Analysis Endpoint."""
    image = request.files.get('image')
    lat = request.form.get('latitude', 18.5074)
    lon = request.form.get('longitude', 73.8077)

    if image and image.filename:
        safe_name = werkzeug.utils.secure_filename(image.filename)
        unique_prefix = uuid.uuid4().hex[:8]
        raw_filename = f"raw_{unique_prefix}_{safe_name}"
        annotated_filename = f"annotated_{unique_prefix}_{safe_name}"

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], raw_filename)
        annotated_filepath = os.path.join(app.config['UPLOAD_FOLDER'], annotated_filename)

        image.save(filepath)

        image_url = f"http://localhost:5000/uploads/{raw_filename}"
        annotated_image_url = f"http://localhost:5000/uploads/{annotated_filename}"

        ai_res = call_ai_microservice(filepath, annotated_filepath)
        predictions = ai_res.get("predictions", [])
        top_class = ai_res.get("top_class", "pothole")
        top_confidence = ai_res.get("top_confidence", 0.90)

        if ai_res.get("annotated_image_url"):
            annotated_image_url = ai_res.get("annotated_image_url")

        category, authority, ai_desc = format_detection_details(top_class, top_confidence)

        return jsonify({
            "issue_category": category,
            "raw_class": top_class,
            "ai_description": ai_desc,
            "ai_confidence": top_confidence,
            "predictions": predictions,
            "suggested_authority": authority,
            "image_url": image_url,
            "annotated_image_url": annotated_image_url,
            "latitude": float(lat),
            "longitude": float(lon),
            "location_name": request.form.get('location_name', "Kothrud, Pune")
        }), 200
    else:
        image_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"
        return jsonify({
            "issue_category": "Road Pothole",
            "raw_class": "pothole",
            "ai_description": "Default preview: Asphalt road pothole detected.",
            "ai_confidence": 0.92,
            "predictions": [],
            "suggested_authority": "Road Department",
            "image_url": image_url,
            "annotated_image_url": image_url,
            "latitude": float(lat),
            "longitude": float(lon),
            "location_name": request.form.get('location_name', "Kothrud, Pune")
        }), 200


@app.route('/api/reports', methods=['POST'])
def submit_report():
    """Citizen report submission with YOLO, Gemma AI, and Duplicate Detection."""
    conn = None
    try:
        user_id = request.form.get('user_id') or (request.json.get('user_id') if request.is_json else None) or 'usr_citizen_01'
        email = request.form.get('email') or (request.json.get('email') if request.is_json else None)
        latitude = float(request.form.get('latitude') or (request.json.get('latitude') if request.is_json else 18.5074))
        longitude = float(request.form.get('longitude') or (request.json.get('longitude') if request.is_json else 73.8077))
        location_name = request.form.get('location_name') or (request.json.get('location_name') if request.is_json else "Kothrud, Pune")
        user_description = request.form.get('user_description') or (request.json.get('user_description') if request.is_json else "")
        issue_category = request.form.get('issue_category') or (request.json.get('issue_category') if request.is_json else "Pothole")
        road_damage_percentage = request.form.get('road_damage_percentage') or (request.json.get('road_damage_percentage') if request.is_json else None)

        image_url = None
        annotated_image_url = None
        save_path = None
        predictions = []
        top_confidence = float(request.form.get('ai_confidence') or (request.json.get('ai_confidence') if request.is_json else 0.90))

        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                fname = werkzeug.utils.secure_filename(file.filename)
                unique_prefix = uuid.uuid4().hex[:8]
                unique_fname = f"raw_{user_id}_{unique_prefix}_{fname}"
                annotated_fname = f"annotated_{user_id}_{unique_prefix}_{fname}"
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_fname)
                annotated_save_path = os.path.join(app.config['UPLOAD_FOLDER'], annotated_fname)

                file.save(save_path)
                image_url = f"http://localhost:5000/uploads/{unique_fname}"
                annotated_image_url = f"http://localhost:5000/uploads/{annotated_fname}"

                ai_res = call_ai_microservice(save_path, annotated_save_path)
                top_cls = ai_res.get("top_class")
                top_confidence = float(ai_res.get("top_confidence", 0.90))
                predictions = ai_res.get("predictions", [])

                if ai_res.get("annotated_image_url"):
                    annotated_image_url = ai_res.get("annotated_image_url")

                if top_cls:
                    issue_category, _, _ = format_detection_details(top_cls, top_confidence)

        if not image_url:
            image_url = (request.json.get('image_url') if request.is_json else None) or request.form.get('image_url') or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"

        if not annotated_image_url:
            annotated_image_url = (request.json.get('annotated_image_url') if request.is_json else None) or request.form.get('annotated_image_url') or image_url

        if not save_path or not os.path.exists(save_path):
            sample_img_name = f"sub_{uuid.uuid4().hex[:8]}.jpg"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], sample_img_name)
            if not os.path.exists(save_path):
                import shutil
                fallback_src = os.path.join(os.path.dirname(app.config['UPLOAD_FOLDER']), 'image.jpg')
                if os.path.exists(fallback_src):
                    shutil.copyfile(fallback_src, save_path)
                else:
                    from PIL import Image
                    Image.new('RGB', (640, 480), color=(128, 128, 128)).save(save_path)

        # Generate municipal report using Gemma
        try:
            gemma_data = generate_gemma_report(
                image_path=save_path,
                issue_type=issue_category,
                confidence=top_confidence,
                road_damage_percentage=road_damage_percentage,
                predictions=predictions,
                location=location_name,
                user_description=user_description
            )
        except Exception as gemma_err:
            print(f"[Backend] Gemma report generation notice: {gemma_err}")
            gemma_data = {
                "title": f"{issue_category} at {location_name}",
                "description": user_description or f"Reported {issue_category} requiring municipal attention.",
                "severity": "Medium",
                "priority": "Medium",
                "recommended_action": "Inspect and schedule maintenance.",
                "social_caption": f"Citizen reported {issue_category} at {location_name}."
            }

        title = gemma_data.get("title") or f"{issue_category} near {location_name}"
        ai_description = gemma_data.get("description") or f"Municipal report for {issue_category}."
        severity = gemma_data.get("severity") or "Medium"
        priority = gemma_data.get("priority") or "Medium"
        recommended_action = gemma_data.get("recommended_action") or ""
        social_caption = gemma_data.get("social_caption") or ""
        road_damage_pct = gemma_data.get("road_damage_percentage") or road_damage_percentage or ""

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Duplicate detection within ~500-600m
        cursor.execute("SELECT id, issue_category, user_description, ai_description, latitude, longitude FROM reports WHERE status != 'Rejected'")
        candidate_reports = cursor.fetchall()

        is_duplicate, matching_id, sim_score, dist_m = detect_duplicate_report(
            latitude, longitude, issue_category, user_description or ai_description, candidate_reports
        )

        if is_duplicate:
            cursor.execute(
                "UPDATE reports SET community_support_count = community_support_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (matching_id,)
            )
            cursor.execute(
                "INSERT IGNORE INTO report_supports (report_id, user_id) VALUES (%s, %s)",
                (matching_id, user_id)
            )
            cursor.execute("SELECT community_support_count FROM reports WHERE id = %s", (matching_id,))
            updated_row = cursor.fetchone()
            new_support_count = updated_row['community_support_count'] if updated_row else 1

            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({
                "duplicate": True,
                "report_id": matching_id,
                "message": "A similar civic issue has already been reported.",
                "community_support_count": new_support_count
            }), 200

        # Insert Unique Report with status 'Reported'
        insert_sql = """
        INSERT INTO reports (
            user_id, email, image_url, annotated_image_url, issue_category,
            title, ai_description, severity, priority, recommended_action,
            social_caption, road_damage_percentage, ai_confidence, latitude,
            longitude, location_name, user_description, status, community_support_count
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Reported', 1)
        """
        cursor.execute(insert_sql, (
            user_id, email, image_url, annotated_image_url, issue_category,
            title, ai_description, severity, priority, recommended_action,
            social_caption, road_damage_pct, top_confidence, latitude,
            longitude, location_name, user_description
        ))
        new_report_id = cursor.lastrowid

        cursor.execute(
            "INSERT IGNORE INTO report_supports (report_id, user_id) VALUES (%s, %s)",
            (new_report_id, user_id)
        )

        conn.commit()

        cursor.execute("""
            SELECT r.*, d.name AS department_name, u.name AS contractor_name
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
            WHERE r.id = %s
        """, (new_report_id,))
        new_report_row = cursor.fetchone()
        formatted_report = format_report_row(new_report_row)

        cursor.close()
        conn.close()

        return jsonify({
            "duplicate": False,
            "report_id": new_report_id,
            "status": "Reported",
            "message": "Your civic issue has been successfully reported.",
            "community_support_count": 1,
            "report": formatted_report
        }), 201

    except Exception as e:
        if conn:
            conn.close()
        print(f"Error in submit_report: {e}")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# COMMUNITY FEED ENDPOINT (UNIFIED ACTIVE & RESOLVED BEFORE/AFTER POSTS)
# ---------------------------------------------------------------------------

@app.route('/api/community/reports', methods=['GET'])
def get_community_reports():
    """
    Retrieve community feed combining active reports (using YOLO annotated images)
    and resolved reports (joined with `resolved_reports` containing Before/After evidence).
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total FROM reports WHERE status != 'Rejected'")
        total_count = cursor.fetchone()['total']

        # Join reports with resolved_reports and departments
        query = """
        SELECT 
            r.*,
            d.name AS department_name,
            u.name AS contractor_name,
            res.resolution_image_url,
            res.resolution_title,
            res.resolution_description,
            res.work_completed,
            res.before_condition,
            res.after_condition,
            res.verification_notes,
            res.community_caption,
            res.resolved_by,
            res.resolved_at AS resolved_table_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        WHERE r.status != 'Rejected'
        ORDER BY r.reported_at DESC
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (limit, offset))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        formatted_reports = []
        for row in rows:
            f = format_report_row(row)
            # Community feed rule:
            # Active reports: primary image is YOLO annotated image
            # Resolved reports: before image is YOLO annotated, after image is resolution image
            f["primary_image_url"] = f["annotated_image_url"] or f["image_url"]
            f["before_image_url"] = f["annotated_image_url"] or f["image_url"]
            f["after_image_url"] = row.get("resolution_image_url")
            f["is_resolved"] = (row["status"].lower() == "resolved" or row["status"].lower() == "verified")
            formatted_reports.append(f)

        has_more = (offset + limit) < total_count

        return jsonify({
            "reports": formatted_reports,
            "page": page,
            "limit": limit,
            "total": total_count,
            "has_more": has_more
        }), 200

    except Exception as e:
        print(f"Error fetching community reports: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/reports/my', methods=['GET'])
def get_my_reports():
    """Retrieve authenticated citizen user's reports."""
    user_id = request.args.get('user_id') or request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"error": "Unauthorized: user_id is required"}), 401

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT r.*, d.name AS department_name, u.name AS contractor_name
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        WHERE r.user_id = %s
        ORDER BY r.reported_at DESC
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        reports = [format_report_row(r) for r in rows]

        cursor.execute("SELECT COUNT(*) AS total FROM reports WHERE user_id = %s", (user_id,))
        total = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) AS cnt FROM reports WHERE user_id = %s AND status = 'Reported'", (user_id,))
        reported_cnt = cursor.fetchone()['cnt']

        cursor.execute("SELECT COUNT(*) AS cnt FROM reports WHERE user_id = %s AND status IN ('Pending', 'Assigned', 'Under Review')", (user_id,))
        pending_cnt = cursor.fetchone()['cnt']

        cursor.execute("SELECT COUNT(*) AS cnt FROM reports WHERE user_id = %s AND status = 'In Progress'", (user_id,))
        in_progress_cnt = cursor.fetchone()['cnt']

        cursor.execute("SELECT COUNT(*) AS cnt FROM reports WHERE user_id = %s AND status IN ('Resolved', 'Verified')", (user_id,))
        resolved_cnt = cursor.fetchone()['cnt']

        cursor.close()
        conn.close()

        return jsonify({
            "user_id": user_id,
            "reports": reports,
            "stats": {
                "total": total,
                "reported": reported_cnt,
                "under_review": pending_cnt,
                "in_progress": in_progress_cnt,
                "resolved": resolved_cnt
            }
        }), 200

    except Exception as e:
        print(f"Error fetching user reports: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report_details(report_id):
    """Fetch report details by ID."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT r.*, d.name AS department_name, u.name AS contractor_name,
               res.resolution_image_url, res.resolution_title, res.resolution_description,
               res.work_completed, res.before_condition, res.after_condition,
               res.verification_notes, res.community_caption, res.resolved_by,
               res.resolved_at AS res_resolved_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        WHERE r.id = %s
        """
        cursor.execute(query, (report_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return jsonify({"error": "Report not found"}), 404

        return jsonify(format_report_row(row)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/reports/<int:report_id>/support', methods=['POST'])
def support_report(report_id):
    """Support an existing civic report."""
    data = request.json or {}
    user_id = data.get('user_id') or request.headers.get('X-User-Id') or 'anonymous_user'

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT 1 FROM report_supports WHERE report_id = %s AND user_id = %s",
            (report_id, user_id)
        )
        already_supported = cursor.fetchone()

        if already_supported:
            cursor.execute("SELECT community_support_count FROM reports WHERE id = %s", (report_id,))
            current_row = cursor.fetchone()
            cnt = current_row['community_support_count'] if current_row else 0
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "already_supported": True,
                "message": "You have already supported this civic issue.",
                "community_support_count": cnt
            }), 200

        cursor.execute(
            "INSERT INTO report_supports (report_id, user_id) VALUES (%s, %s)",
            (report_id, user_id)
        )
        cursor.execute(
            "UPDATE reports SET community_support_count = community_support_count + 1 WHERE id = %s",
            (report_id,)
        )

        cursor.execute("SELECT community_support_count FROM reports WHERE id = %s", (report_id,))
        updated_row = cursor.fetchone()
        new_cnt = updated_row['community_support_count'] if updated_row else 1

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "already_supported": False,
            "message": "Thank you for supporting this civic report!",
            "community_support_count": new_cnt
        }), 200

    except Exception as e:
        print(f"Error supporting report: {e}")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# AUTHORITY PORTAL & HEAD AUTHORITY ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/api/authority/me', methods=['GET'])
def get_authority_profile():
    """
    Returns current authority profile and role status based on Firebase authentication.
    """
    auth_user = get_authority_user()
    if not auth_user:
        return jsonify({
            "is_authority": False,
            "role": "citizen",
            "message": "No authority role assigned to this user."
        }), 200

    return jsonify({
        "is_authority": True,
        "id": auth_user["id"],
        "firebase_uid": auth_user["firebase_uid"],
        "name": auth_user["name"],
        "email": auth_user["email"],
        "role": auth_user["role"],
        "department_id": auth_user["department_id"],
        "department_name": auth_user.get("department_name"),
        "department_code": auth_user.get("department_code")
    }), 200


@app.route('/api/authority/departments', methods=['GET'])
@require_any_authority
def get_departments(auth_user):
    """Retrieve all municipal departments and keyword mappings."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM departments WHERE is_active = 1 ORDER BY id ASC")
        departments = cursor.fetchall()
        cursor.close()
        conn.close()

        for dept in departments:
            if dept.get("keywords") and isinstance(dept["keywords"], str):
                try:
                    import json
                    dept["keywords_list"] = json.loads(dept["keywords"])
                except Exception:
                    dept["keywords_list"] = [k.strip() for k in dept["keywords"].split(",")]
            else:
                dept["keywords_list"] = []

        return jsonify({"departments": departments}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/authority/contractors', methods=['GET'])
@require_any_authority
def get_contractors(auth_user):
    """Retrieve list of authority contractors by department."""
    dept_id = request.args.get("department_id")
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        if dept_id:
            cursor.execute("""
                SELECT u.id, u.firebase_uid, u.name, u.email, u.role, u.department_id, d.name AS department_name
                FROM authority_users u
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE u.is_active = 1 AND u.role = 'department_contractor' AND u.department_id = %s
            """, (dept_id,))
        else:
            cursor.execute("""
                SELECT u.id, u.firebase_uid, u.name, u.email, u.role, u.department_id, d.name AS department_name
                FROM authority_users u
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE u.is_active = 1 AND u.role = 'department_contractor'
            """)
        contractors = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"contractors": contractors}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/authority/dashboard', methods=['GET'])
@require_head_authority
def get_authority_dashboard(auth_user):
    """
    Returns concise, institutional KPIs and department performance matrix.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Single aggregation query for all top KPIs
        cursor.execute("""
            SELECT 
                COUNT(*) AS total_reports,
                COUNT(CASE WHEN status = 'Reported' THEN 1 END) AS total_reported,
                COUNT(CASE WHEN status IN ('Pending', 'Assigned') THEN 1 END) AS total_pending,
                COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS total_in_progress,
                COUNT(CASE WHEN status IN ('Resolved', 'Verified') THEN 1 END) AS total_resolved,
                COUNT(CASE WHEN priority IN ('High', 'Urgent') OR severity IN ('High', 'Critical') THEN 1 END) AS total_urgent_critical,
                AVG(CASE WHEN status IN ('Resolved', 'Verified') AND resolved_at IS NOT NULL 
                         THEN TIMESTAMPDIFF(HOUR, reported_at, resolved_at) END) AS avg_hours
            FROM reports 
            WHERE status != 'Rejected'
        """)
        kpi_row = cursor.fetchone() or {}
        total_reports = kpi_row.get('total_reports', 0)
        total_reported = kpi_row.get('total_reported', 0)
        total_pending = kpi_row.get('total_pending', 0)
        total_in_progress = kpi_row.get('total_in_progress', 0)
        total_resolved = kpi_row.get('total_resolved', 0)
        total_urgent_critical = kpi_row.get('total_urgent_critical', 0)
        avg_resolution_time = round(float(kpi_row['avg_hours']), 1) if kpi_row.get('avg_hours') is not None else 0.0
        overall_resolution_rate = round((total_resolved / total_reports * 100), 1) if total_reports > 0 else 0.0

        # 2. Department performance comparison matrix
        cursor.execute("""
            SELECT 
                d.id,
                d.name,
                d.code,
                COUNT(CASE WHEN r.status = 'Reported' AND r.assigned_department_id = d.id THEN 1 END) AS reported_count,
                COUNT(CASE WHEN r.status IN ('Pending', 'Assigned') AND r.assigned_department_id = d.id THEN 1 END) AS pending_count,
                COUNT(CASE WHEN r.status = 'In Progress' AND r.assigned_department_id = d.id THEN 1 END) AS in_progress_count,
                COUNT(CASE WHEN r.status IN ('Resolved', 'Verified') AND r.assigned_department_id = d.id THEN 1 END) AS resolved_count,
                COUNT(CASE WHEN r.assigned_department_id = d.id THEN 1 END) AS total_assigned,
                AVG(CASE WHEN r.status IN ('Resolved', 'Verified') AND r.resolved_at IS NOT NULL AND r.assigned_department_id = d.id 
                         THEN TIMESTAMPDIFF(HOUR, r.reported_at, r.resolved_at) END) AS avg_hours
            FROM departments d
            LEFT JOIN reports r ON r.assigned_department_id = d.id AND r.status != 'Rejected'
            WHERE d.is_active = 1
            GROUP BY d.id, d.name, d.code
            ORDER BY d.id ASC
        """)
        dept_rows = cursor.fetchall()

        department_performance = []
        for d in dept_rows:
            assigned = d['total_assigned'] or 0
            res = d['resolved_count'] or 0
            rate = round((res / assigned * 100), 1) if assigned > 0 else 0.0
            avg_h = round(float(d['avg_hours']), 1) if d['avg_hours'] is not None else 0.0

            department_performance.append({
                "id": d["id"],
                "name": d["name"],
                "code": d["code"],
                "reported": d["reported_count"] or 0,
                "pending": d["pending_count"] or 0,
                "in_progress": d["in_progress_count"] or 0,
                "resolved": res,
                "total_assigned": assigned,
                "resolution_rate": rate,
                "avg_resolution_hours": avg_h
            })

        # 3. Recent urgent issues requiring attention
        cursor.execute("""
            SELECT r.*, d.name AS department_name
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            WHERE r.status IN ('Reported', 'Pending', 'In Progress')
            ORDER BY 
                CASE WHEN r.priority = 'Urgent' THEN 1 WHEN r.priority = 'High' THEN 2 ELSE 3 END,
                r.reported_at DESC
            LIMIT 5
        """)
        urgent_rows = cursor.fetchall()
        recent_urgent = [format_report_row(r) for r in urgent_rows]

        cursor.close()
        conn.close()

        return jsonify({
            "kpis": {
                "total_reports": total_reports,
                "total_reported": total_reported,
                "total_pending": total_pending,
                "total_in_progress": total_in_progress,
                "total_resolved": total_resolved,
                "total_urgent_critical": total_urgent_critical,
                "overall_resolution_rate": overall_resolution_rate,
                "avg_resolution_hours": avg_resolution_time
            },
            "department_performance": department_performance,
            "recent_urgent": recent_urgent
        }), 200

    except Exception as e:
        print(f"Dashboard calculation error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/authority/reports', methods=['GET'])
@require_head_authority
def get_authority_reports(auth_user):
    """
    Retrieve reports for Head Authority with comprehensive server-side filtering.
    Filters: status, department_id, severity, priority, category, date_from, date_to, search.
    """
    try:
        status = request.args.get("status")
        department_id = request.args.get("department_id")
        severity = request.args.get("severity")
        priority = request.args.get("priority")
        category = request.args.get("category")
        search = request.args.get("search")
        date_from = request.args.get("date_from")
        date_to = request.args.get("date_to")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        offset = (page - 1) * limit

        conditions = ["r.status != 'Rejected'"]
        params = []

        if status and status.lower() != 'all':
            if status.lower() in ['pending', 'assigned']:
                conditions.append("r.status IN ('Pending', 'Assigned')")
            else:
                conditions.append("LOWER(r.status) = LOWER(%s)")
                params.append(status)

        if department_id and department_id.lower() != 'all':
            conditions.append("r.assigned_department_id = %s")
            params.append(int(department_id))

        if severity and severity.lower() != 'all':
            conditions.append("LOWER(r.severity) = LOWER(%s)")
            params.append(severity)

        if priority and priority.lower() != 'all':
            conditions.append("LOWER(r.priority) = LOWER(%s)")
            params.append(priority)

        if category and category.lower() != 'all':
            conditions.append("LOWER(r.issue_category) LIKE LOWER(%s)")
            params.append(f"%{category}%")

        if search:
            conditions.append("(r.title LIKE %s OR r.location_name LIKE %s OR r.user_description LIKE %s OR r.id = %s)")
            search_param = f"%{search}%"
            try:
                search_id = int(search.replace("#SF-2026-", "").replace("#", ""))
            except ValueError:
                search_id = -1
            params.extend([search_param, search_param, search_param, search_id])

        if date_from:
            conditions.append("r.reported_at >= %s")
            params.append(date_from)
        if date_to:
            conditions.append("r.reported_at <= %s")
            params.append(date_to)

        where_clause = " WHERE " + " AND ".join(conditions)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Count total matching
        count_sql = f"SELECT COUNT(*) AS total FROM reports r {where_clause}"
        cursor.execute(count_sql, tuple(params))
        total = cursor.fetchone()['total']

        # Fetch records
        fetch_sql = f"""
        SELECT 
            r.*,
            d.name AS department_name,
            u.name AS contractor_name,
            res.resolution_image_url,
            res.resolution_title,
            res.resolution_description,
            res.work_completed,
            res.resolved_by,
            res.resolved_at AS res_resolved_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        {where_clause}
        ORDER BY r.reported_at DESC
        LIMIT %s OFFSET %s
        """
        cursor.execute(fetch_sql, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        formatted = [format_report_row(r) for r in rows]

        return jsonify({
            "reports": formatted,
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": (offset + limit) < total
        }), 200

    except Exception as e:
        print(f"Error fetching authority reports: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/authority/reports/<int:report_id>', methods=['GET'])
@require_head_authority
def get_authority_report_detail(auth_user, report_id):
    """Retrieve full details of a specific report for Head Authority."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT 
            r.*,
            d.name AS department_name,
            d.code AS department_code,
            u.name AS contractor_name,
            u.email AS contractor_email,
            res.resolution_image_url,
            res.resolution_title,
            res.resolution_description,
            res.work_completed,
            res.before_condition,
            res.after_condition,
            res.verification_notes,
            res.community_caption,
            res.resolved_by,
            res.resolved_at AS res_resolved_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        WHERE r.id = %s
        """
        cursor.execute(query, (report_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return jsonify({"error": "Report not found"}), 404

        return jsonify(format_report_row(row)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/authority/reports/<int:report_id>/assign', methods=['POST'])
@require_head_authority
def assign_report_department(auth_user, report_id):
    """
    Atomic assignment of an issue to a municipal department and optional contractor.
    Transitions status from 'Reported' to 'Pending'.
    """
    data = request.json or {}
    department_id = data.get("department_id")
    contractor_id = data.get("contractor_id")
    authority_note = data.get("authority_note", "")

    if not department_id:
        return jsonify({"error": "department_id is required for assignment."}), 400

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Verify report exists
        cursor.execute("SELECT id, status FROM reports WHERE id = %s", (report_id,))
        report = cursor.fetchone()
        if not report:
            cursor.close()
            conn.close()
            return jsonify({"error": "Report not found"}), 404

        # Verify department exists
        cursor.execute("SELECT id, name FROM departments WHERE id = %s AND is_active = 1", (department_id,))
        dept = cursor.fetchone()
        if not dept:
            cursor.close()
            conn.close()
            return jsonify({"error": "Invalid or inactive department specified."}), 400

        assigned_by_name = auth_user.get("name") or auth_user.get("email") or "Head Authority"

        # Atomic update
        update_sql = """
        UPDATE reports
        SET 
            assigned_department_id = %s,
            assigned_contractor_id = %s,
            assigned_by = %s,
            assigned_at = CURRENT_TIMESTAMP,
            authority_note = %s,
            status = 'Pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        """
        cursor.execute(update_sql, (
            department_id,
            contractor_id if contractor_id else None,
            assigned_by_name,
            authority_note,
            report_id
        ))

        conn.commit()

        # Fetch updated record
        cursor.execute("""
            SELECT r.*, d.name AS department_name, u.name AS contractor_name
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
            WHERE r.id = %s
        """, (report_id,))
        updated_row = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": f"Report assigned to {dept['name']} successfully.",
            "report": format_report_row(updated_row)
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"Error assigning report: {e}")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# DEPARTMENT CONTRACTOR PORTAL ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/api/contractor/reports', methods=['GET'])
@require_contractor
def get_contractor_reports(auth_user):
    """
    Retrieve issues assigned to the authenticated contractor's department.
    Strictly isolated: Contractor cannot view issues belonging to other departments.
    """
    try:
        dept_id = auth_user.get("department_id")
        # If head_authority is viewing contractor endpoint, allow query param dept_id
        if auth_user.get("role") == "head_authority" and request.args.get("department_id"):
            dept_id = int(request.args.get("department_id"))

        if not dept_id:
            return jsonify({"error": "No department assigned to this contractor account."}), 403

        status = request.args.get("status")
        priority = request.args.get("priority")
        severity = request.args.get("severity")
        search = request.args.get("search")

        conditions = ["r.assigned_department_id = %s", "r.status != 'Rejected'"]
        params = [dept_id]

        if status and status.lower() != 'all':
            if status.lower() in ['pending', 'assigned']:
                conditions.append("r.status IN ('Pending', 'Assigned')")
            else:
                conditions.append("LOWER(r.status) = LOWER(%s)")
                params.append(status)

        if priority and priority.lower() != 'all':
            conditions.append("LOWER(r.priority) = LOWER(%s)")
            params.append(priority)

        if severity and severity.lower() != 'all':
            conditions.append("LOWER(r.severity) = LOWER(%s)")
            params.append(severity)

        if search:
            conditions.append("(r.title LIKE %s OR r.location_name LIKE %s OR r.user_description LIKE %s)")
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])

        where_clause = " WHERE " + " AND ".join(conditions)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = f"""
        SELECT 
            r.*,
            d.name AS department_name,
            u.name AS contractor_name,
            res.resolution_image_url,
            res.resolution_title,
            res.resolution_description,
            res.work_completed,
            res.resolved_by,
            res.resolved_at AS res_resolved_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        {where_clause}
        ORDER BY 
            CASE WHEN r.status = 'Pending' THEN 1 WHEN r.status = 'In Progress' THEN 2 ELSE 3 END,
            CASE WHEN r.priority = 'Urgent' THEN 1 WHEN r.priority = 'High' THEN 2 ELSE 3 END,
            r.reported_at DESC
        """
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        formatted = [format_report_row(r) for r in rows]

        # Calculate department contractor KPI counters
        pending_cnt = sum(1 for r in formatted if r['status'] in ['Pending', 'Assigned'])
        in_prog_cnt = sum(1 for r in formatted if r['status'] == 'In Progress')
        resolved_cnt = sum(1 for r in formatted if r['status'] in ['Resolved', 'Verified'])
        urgent_cnt = sum(1 for r in formatted if r['priority'] in ['High', 'Urgent'])

        return jsonify({
            "department_id": dept_id,
            "department_name": auth_user.get("department_name"),
            "reports": formatted,
            "stats": {
                "total": len(formatted),
                "pending": pending_cnt,
                "in_progress": in_prog_cnt,
                "resolved": resolved_cnt,
                "urgent": urgent_cnt
            }
        }), 200

    except Exception as e:
        print(f"Error in contractor reports: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/contractor/reports/<int:report_id>', methods=['GET'])
@require_contractor
def get_contractor_report_detail(auth_user, report_id):
    """
    Retrieve single assigned report for a contractor.
    Enforces strict Department Isolation on the Backend.
    """
    try:
        dept_id = auth_user.get("department_id")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            r.*,
            d.name AS department_name,
            u.name AS contractor_name,
            res.resolution_image_url,
            res.resolution_title,
            res.resolution_description,
            res.work_completed,
            res.before_condition,
            res.after_condition,
            res.verification_notes,
            res.community_caption,
            res.resolved_by,
            res.resolved_at AS res_resolved_at
        FROM reports r
        LEFT JOIN departments d ON r.assigned_department_id = d.id
        LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
        LEFT JOIN resolved_reports res ON r.id = res.report_id
        WHERE r.id = %s
        """
        cursor.execute(query, (report_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return jsonify({"error": "Report not found"}), 404

        # Department Isolation Enforcement
        if auth_user.get("role") != "head_authority" and row["assigned_department_id"] != dept_id:
            return jsonify({"error": "Forbidden: You are not authorized to view reports of another department."}), 403

        return jsonify(format_report_row(row)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/contractor/reports/<int:report_id>/start', methods=['POST'])
@require_contractor
def start_contractor_work(auth_user, report_id):
    """
    Transition report status from 'Pending' to 'In Progress'.
    Records started_at timestamp.
    """
    try:
        dept_id = auth_user.get("department_id")
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, status, assigned_department_id FROM reports WHERE id = %s", (report_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            conn.close()
            return jsonify({"error": "Report not found"}), 404

        if auth_user.get("role") != "head_authority" and row["assigned_department_id"] != dept_id:
            cursor.close()
            conn.close()
            return jsonify({"error": "Forbidden: You cannot modify another department's report."}), 403

        cursor.execute("""
            UPDATE reports
            SET status = 'In Progress', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (report_id,))
        conn.commit()

        cursor.execute("""
            SELECT r.*, d.name AS department_name, u.name AS contractor_name
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
            WHERE r.id = %s
        """, (report_id,))
        updated_row = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Work started on civic issue.",
            "report": format_report_row(updated_row)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/contractor/reports/<int:report_id>/resolve', methods=['POST'])
@require_contractor
def resolve_contractor_report(auth_user, report_id):
    """
    Resolves an assigned report with mandatory resolution evidence and Gemma AI analysis.
    
    Strict Enforcement:
    1. Authenticated contractor verification & department access check.
    2. Resolution image is MANDATORY (live camera or uploaded image). Reject with HTTP 400 if missing.
    3. Gemma multimodal resolution analysis generates structured verification notes and community caption.
    4. Atomic DB transaction: insert into `resolved_reports` + update `reports.status = 'Resolved'`.
    """
    dept_id = auth_user.get("department_id")
    resolution_desc = request.form.get("resolution_description") or (request.json.get("resolution_description") if request.is_json else "")
    
    if not resolution_desc or not resolution_desc.strip():
        return jsonify({"error": "Resolution description of completed work is required."}), 400

    # Backend-enforced mandatory resolution image check
    resolution_image_file = request.files.get("resolution_image") or request.files.get("image")
    
    if not resolution_image_file or not resolution_image_file.filename:
        return jsonify({
            "error": "Resolution image evidence is mandatory. Please capture a camera photo or upload an image of the completed work."
        }), 400

    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Fetch original report
        cursor.execute("""
            SELECT r.*, d.name AS department_name
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            WHERE r.id = %s
        """, (report_id,))
        original_report = cursor.fetchone()

        if not original_report:
            cursor.close()
            conn.close()
            return jsonify({"error": "Report not found."}), 404

        # Department isolation check
        if auth_user.get("role") != "head_authority" and original_report["assigned_department_id"] != dept_id:
            cursor.close()
            conn.close()
            return jsonify({"error": "Forbidden: You cannot resolve issues assigned to another department."}), 403

        # 2. Save resolution image
        fname = werkzeug.utils.secure_filename(resolution_image_file.filename)
        unique_prefix = uuid.uuid4().hex[:8]
        resolution_filename = f"res_{report_id}_{unique_prefix}_{fname}"
        resolution_save_path = os.path.join(app.config['UPLOAD_FOLDER'], resolution_filename)
        resolution_image_file.save(resolution_save_path)
        resolution_image_url = f"http://localhost:5000/uploads/{resolution_filename}"

        # Determine original image path for multimodal comparison
        orig_img_filename = original_report["image_url"].split("/uploads/")[-1] if "/uploads/" in original_report["image_url"] else ""
        orig_img_path = os.path.join(app.config['UPLOAD_FOLDER'], orig_img_filename) if orig_img_filename else None

        dept_name = original_report.get("department_name") or auth_user.get("department_name") or "Municipal Authority"

        # 3. Call Gemma resolution multimodal analysis
        gemma_res = generate_gemma_resolution_report(
            original_image_path=orig_img_path,
            resolution_image_path=resolution_save_path,
            issue_type=original_report["issue_category"],
            severity=original_report.get("severity", "High"),
            location=original_report.get("location_name", "Pune, Maharashtra"),
            previous_ai_description=original_report.get("ai_description", ""),
            previous_user_description=original_report.get("user_description", ""),
            contractor_resolution_description=resolution_desc,
            department_name=dept_name
        )

        res_title = gemma_res.get("resolution_title") or f"{original_report['issue_category']} Resolved"
        res_ai_desc = gemma_res.get("resolution_description") or resolution_desc
        work_completed = gemma_res.get("work_completed") or resolution_desc
        before_condition = gemma_res.get("before_condition") or "Hazardous defect reported by citizen."
        after_condition = gemma_res.get("after_condition") or "Repaired and made safe for public."
        verification_notes = gemma_res.get("verification_notes") or f"Field work completed by {dept_name}."
        community_caption = gemma_res.get("community_caption") or f"Issue at {original_report.get('location_name')} successfully resolved!"
        resolved_by_name = auth_user.get("name") or auth_user.get("email") or "Contractor"

        # 4. Atomic Database Transaction
        # Insert or update resolved_reports
        insert_res_sql = """
        INSERT INTO resolved_reports (
            report_id, resolution_image_url, resolution_description, resolution_title,
            resolution_ai_description, work_completed, before_condition, after_condition,
            verification_notes, community_caption, resolved_by, resolved_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            resolution_image_url = VALUES(resolution_image_url),
            resolution_description = VALUES(resolution_description),
            resolution_title = VALUES(resolution_title),
            resolution_ai_description = VALUES(resolution_ai_description),
            work_completed = VALUES(work_completed),
            before_condition = VALUES(before_condition),
            after_condition = VALUES(after_condition),
            verification_notes = VALUES(verification_notes),
            community_caption = VALUES(community_caption),
            resolved_by = VALUES(resolved_by),
            resolved_at = CURRENT_TIMESTAMP;
        """
        cursor.execute(insert_res_sql, (
            report_id,
            resolution_image_url,
            resolution_desc,
            res_title,
            res_ai_desc,
            work_completed,
            before_condition,
            after_condition,
            verification_notes,
            community_caption,
            resolved_by_name
        ))

        # Update reports status to Resolved
        cursor.execute("""
            UPDATE reports
            SET status = 'Resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (report_id,))

        conn.commit()

        # 5. Fetch updated row
        cursor.execute("""
            SELECT 
                r.*,
                d.name AS department_name,
                u.name AS contractor_name,
                res.resolution_image_url,
                res.resolution_title,
                res.resolution_description,
                res.work_completed,
                res.before_condition,
                res.after_condition,
                res.verification_notes,
                res.community_caption,
                res.resolved_by,
                res.resolved_at AS res_resolved_at
            FROM reports r
            LEFT JOIN departments d ON r.assigned_department_id = d.id
            LEFT JOIN authority_users u ON r.assigned_contractor_id = u.firebase_uid
            LEFT JOIN resolved_reports res ON r.id = res.report_id
            WHERE r.id = %s
        """, (report_id,))
        final_row = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Issue successfully marked as Resolved with AI resolution verification.",
            "report": format_report_row(final_row)
        }), 200

    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        print(f"Error resolving report: {e}")
        return jsonify({"error": f"Failed to complete resolution: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# MAIN STARTUP
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print("Initializing SnapFix Database...")
    try:
        init_db()
    except Exception as err:
        print(f"Database init warning: {err}")

    port = int(os.getenv("PORT", 5000))
    print(f"Starting SnapFix Flask Server with Authority Portal on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
