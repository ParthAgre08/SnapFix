import mysql.connector
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

def get_connection():
    port_env = os.getenv("MYSQL_PORT", "3306")
    try:
        port_num = int(port_env)
    except (ValueError, TypeError):
        port_num = 3306

    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "snapfix_ver2"),
        port=port_num
    )

def init_db():
    """Ensure database, departments, authority_users, reports, supports, and resolved_reports tables exist."""
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    db_name = os.getenv("MYSQL_DATABASE", "snapfix_ver2")
    port_env = os.getenv("MYSQL_PORT", "3306")
    try:
        port_num = int(port_env)
    except (ValueError, TypeError):
        port_num = 3306

    # 1. Ensure Database exists
    conn = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        port=port_num
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    conn.close()

    # Connect to the database
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # 2. Create `departments` table
    create_departments_sql = """
    CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT NULL,
        keywords TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_departments_sql)

    # Seed Initial Departments if empty
    initial_departments = [
        (
            1,
            "Road Department",
            "road_dept",
            "Responsible for municipal road repair, potholes, asphalt resurfacing, pavement cracks, and curb damage.",
            json.dumps(["pothole", "road damage", "broken road", "road crack", "damaged pavement", "pothole", "road surface", "asphalt", "crater", "sinkhole", "road"])
        ),
        (
            2,
            "Waste Management Department",
            "waste_mgmt_dept",
            "Handles municipal garbage collection, litter disposal, overflowing trash bins, and unauthorized solid waste dumping.",
            json.dumps(["garbage", "waste", "litter", "overflowing bin", "garbage pile", "solid waste", "trash", "dumping", "refuse", "debris"])
        ),
        (
            3,
            "Electrical Department",
            "electrical_dept",
            "Manages public street lighting, street lamps, electric poles, exposed wiring hazards, and municipal electrical fixtures.",
            json.dumps(["streetlight", "broken streetlight", "electric pole", "damaged electrical pole", "exposed wire", "electrical issue", "lamp post", "street light", "lighting", "wire"])
        ),
        (
            4,
            "Drainage Department",
            "drainage_dept",
            "Maintains stormwater drains, open/clogged manholes, sewage blockages, drainage overflow, and waterlogging mitigation.",
            json.dumps(["open drain", "blocked drain", "drainage", "sewage", "waterlogging", "clogged drain", "damaged drainage", "open manhole", "manhole cover", "manhole", "drain", "gutter"])
        )
    ]

    for dept_id, name, code, desc, kw in initial_departments:
        cursor.execute(
            """
            INSERT INTO departments (id, name, code, description, keywords, is_active)
            VALUES (%s, %s, %s, %s, %s, 1)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                description = VALUES(description),
                keywords = VALUES(keywords);
            """,
            (dept_id, name, code, desc, kw)
        )

    # 3. Create `authority_users` table
    create_authority_users_sql = """
    CREATE TABLE IF NOT EXISTS authority_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department_id INT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_authority_users_sql)

    # Seed demo authority accounts
    initial_authority_users = [
        (
            "auth_head_parth_01",
            "Parth (Head Authority)",
            "parth@gmail.com",
            "head_authority",
            None
        ),
        (
            "auth_contractor_01",
            "Road Contractor",
            "contractor@gmail.com",
            "department_contractor",
            1
        ),
        (
            "auth_head_admin_01",
            "Municipal Administrator",
            "admin@snapfix.gov",
            "head_authority",
            None
        ),
        (
            "auth_road_contractor_01",
            "Road Department Supervisor",
            "road@snapfix.gov",
            "department_contractor",
            1
        ),
        (
            "auth_waste_contractor_01",
            "Waste Management Supervisor",
            "waste@snapfix.gov",
            "department_contractor",
            2
        ),
        (
            "auth_electrical_contractor_01",
            "Electrical Dept Supervisor",
            "electrical@snapfix.gov",
            "department_contractor",
            3
        ),
        (
            "auth_drainage_contractor_01",
            "Drainage Dept Supervisor",
            "drainage@snapfix.gov",
            "department_contractor",
            4
        )
    ]

    for uid, name, email, role, dept_id in initial_authority_users:
        cursor.execute(
            """
            INSERT INTO authority_users (firebase_uid, name, email, role, department_id, is_active)
            VALUES (%s, %s, %s, %s, %s, 1)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                email = VALUES(email),
                role = VALUES(role),
                department_id = VALUES(department_id);
            """,
            (uid, name, email, role, dept_id)
        )

    # 4. Ensure `reports` table exists
    create_reports_table_sql = """
    CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(100) NULL DEFAULT NULL,
        image_url TEXT NOT NULL,
        annotated_image_url TEXT NULL,
        issue_category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NULL,
        ai_description TEXT NULL,
        severity VARCHAR(50) NULL DEFAULT 'Medium',
        priority VARCHAR(50) NULL DEFAULT 'Medium',
        recommended_action TEXT NULL,
        social_caption TEXT NULL,
        road_damage_percentage VARCHAR(50) NULL,
        ai_confidence FLOAT NULL,
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        location_name VARCHAR(255) NULL,
        user_description TEXT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Reported',
        community_support_count INT NOT NULL DEFAULT 1,
        department_id INT NULL,
        assigned_department_id INT NULL,
        assigned_contractor_id VARCHAR(255) NULL,
        assigned_by VARCHAR(255) NULL,
        assigned_at DATETIME NULL,
        authority_note TEXT NULL,
        started_at DATETIME NULL,
        resolved_at DATETIME NULL,
        reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_reports_table_sql)

    # Ensure all required columns exist on reports table
    try:
        cursor.execute("ALTER TABLE reports MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Reported';")
    except Exception as e:
        print(f"Note on ALTER TABLE status: {e}")

    try:
        cursor.execute("ALTER TABLE reports MODIFY COLUMN email VARCHAR(100) NULL DEFAULT NULL;")
    except Exception as e:
        print(f"Note on ALTER TABLE email: {e}")

    new_report_cols = [
        ("title", "VARCHAR(255) NULL"),
        ("severity", "VARCHAR(50) NULL DEFAULT 'Medium'"),
        ("priority", "VARCHAR(50) NULL DEFAULT 'Medium'"),
        ("recommended_action", "TEXT NULL"),
        ("social_caption", "TEXT NULL"),
        ("road_damage_percentage", "VARCHAR(50) NULL"),
        ("assigned_department_id", "INT NULL"),
        ("assigned_contractor_id", "VARCHAR(255) NULL"),
        ("assigned_by", "VARCHAR(255) NULL"),
        ("assigned_at", "DATETIME NULL"),
        ("authority_note", "TEXT NULL"),
        ("started_at", "DATETIME NULL"),
        ("resolved_at", "DATETIME NULL")
    ]
    for col_name, col_def in new_report_cols:
        try:
            cursor.execute(f"ALTER TABLE reports ADD COLUMN {col_name} {col_def};")
        except Exception:
            pass

    # 5. Create `report_supports` tracking table
    create_supports_table_sql = """
    CREATE TABLE IF NOT EXISTS report_supports (
        report_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (report_id, user_id),
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_supports_table_sql)

    # 6. Create `resolved_reports` table for resolution-specific evidence and AI resolution report
    create_resolved_reports_sql = """
    CREATE TABLE IF NOT EXISTS resolved_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL UNIQUE,
        resolution_image_url TEXT NOT NULL,
        resolution_description TEXT NOT NULL,
        resolution_title VARCHAR(255) NULL,
        resolution_ai_description TEXT NULL,
        work_completed TEXT NULL,
        before_condition TEXT NULL,
        after_condition TEXT NULL,
        verification_notes TEXT NULL,
        community_caption TEXT NULL,
        resolved_by VARCHAR(255) NOT NULL,
        resolved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    cursor.execute(create_resolved_reports_sql)

    # Ensure uniform collation across all tables to avoid collation mismatch
    tables = ['departments', 'authority_users', 'reports', 'report_supports', 'resolved_reports']
    for tbl in tables:
        try:
            cursor.execute(f"ALTER TABLE `{tbl}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        except Exception as e:
            print(f"Collation conversion notice for {tbl}: {e}")

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        init_db()
        print("Database initialized successfully with departments, authority_users, reports, and resolved_reports.")
    except Exception as e:
        print(f"Database initialization error: {e}")
