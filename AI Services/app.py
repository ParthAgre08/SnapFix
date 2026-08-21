import os
import uuid
import werkzeug.utils
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from yolo_service import analyze_image_with_yolo

app = Flask(__name__)
CORS(app)

# Upload directory configuration for AI Microservice
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

PORT = int(os.getenv("AI_SERVICE_PORT", 5001))

# Serve uploaded/annotated image files from AI Services
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Health Check Endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "service": "SnapFix Dedicated AI Microservice",
        "model_id": "snapfixai/2",
        "port": PORT
    }), 200

# Primary AI Prediction Endpoint
@app.route('/predict', methods=['POST'])
def predict_issue():
    """
    Dedicated AI Microservice Endpoint.
    Receives image file, executes Roboflow YOLO model detection,
    generates annotated image with bounding boxes, and returns predictions payload.
    """
    try:
        image = request.files.get('image')
        if not image or not image.filename:
            return jsonify({
                "success": False,
                "error": "No image file provided in request"
            }), 400

        safe_name = werkzeug.utils.secure_filename(image.filename)
        unique_prefix = uuid.uuid4().hex[:8]
        raw_filename = f"raw_{unique_prefix}_{safe_name}"
        annotated_filename = f"annotated_{unique_prefix}_{safe_name}"

        raw_filepath = os.path.join(app.config['UPLOAD_FOLDER'], raw_filename)
        annotated_filepath = os.path.join(app.config['UPLOAD_FOLDER'], annotated_filename)

        # Save incoming image file
        image.save(raw_filepath)

        # Execute YOLO Inference and image annotation
        yolo_result = analyze_image_with_yolo(raw_filepath, annotated_filepath)

        raw_url = f"http://localhost:{PORT}/uploads/{raw_filename}"
        annotated_url = f"http://localhost:{PORT}/uploads/{annotated_filename}"

        return jsonify({
            "success": True,
            "top_class": yolo_result.get("top_class", "Pothole"),
            "top_confidence": yolo_result.get("top_confidence", 0.90),
            "predictions": yolo_result.get("predictions", []),
            "raw_image_url": raw_url,
            "annotated_image_url": annotated_url,
            "raw_result": yolo_result.get("raw_result")
        }), 200

    except Exception as e:
        print(f"[AI Microservice Error] {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    print(f"🚀 Starting Dedicated SnapFix AI Microservice Server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
