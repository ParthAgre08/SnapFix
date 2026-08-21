import requests
import json
import time
from db import get_connection

BASE_URL = "http://localhost:5000/api"

def reset_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SET FOREIGN_KEY_CHECKS=0")
    cur.execute("TRUNCATE TABLE report_supports")
    cur.execute("TRUNCATE TABLE reports")
    cur.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    conn.close()

def test_api():
    reset_db()
    time.sleep(0.5)

    print("--- 1. Testing GET /api/community/reports?page=1&limit=5 ---")
    r1 = requests.get(f"{BASE_URL}/community/reports?page=1&limit=5")
    print(f"Status: {r1.status_code}, Response: {r1.json()}")
    assert r1.status_code == 200

    print("\n--- 2. Submitting Unique Report A ---")
    payload1 = {
        "user_id": "usr_citizen_01",
        "latitude": 18.5074,
        "longitude": 73.8077,
        "location_name": "Kothrud, Pune",
        "issue_category": "Pothole",
        "user_description": "Large deep road pothole on main avenue causing traffic delays"
    }
    r2 = requests.post(f"{BASE_URL}/reports", json=payload1)
    res2 = r2.json()
    print(f"Status: {r2.status_code}, Response: {res2}")
    assert r2.status_code in (200, 201)
    report1_id = res2["report_id"]
    assert res2["duplicate"] is False

    print("\n--- 3. Submitting Duplicate Report B (Within ~600m, Same Category, Cosine Similarity >= 0.80) ---")
    payload2 = {
        "user_id": "usr_citizen_02",
        "latitude": 18.5076,
        "longitude": 73.8079,
        "location_name": "Kothrud, Pune",
        "issue_category": "Pothole",
        "user_description": "Large deep road pothole on main avenue causing traffic delays"
    }
    r3 = requests.post(f"{BASE_URL}/reports", json=payload2)
    res3 = r3.json()
    print(f"Status: {r3.status_code}, Duplicate Detection Response: {res3}")
    assert r3.status_code == 200
    assert res3["duplicate"] is True
    assert res3["report_id"] == report1_id
    assert res3["community_support_count"] == 2

    print("\n--- 4. Testing GET /api/community/reports after insertions ---")
    r4 = requests.get(f"{BASE_URL}/community/reports?page=1&limit=5")
    res4 = r4.json()
    print(f"Total reports in community feed: {res4['total']}, Page: {res4['page']}, Limit: {res4['limit']}, Has More: {res4['has_more']}")
    assert len(res4["reports"]) == 1

    print("\n--- 5. Testing GET /api/reports/my?user_id=usr_citizen_01 ---")
    r5 = requests.get(f"{BASE_URL}/reports/my?user_id=usr_citizen_01", headers={"X-User-Id": "usr_citizen_01"})
    res5 = r5.json()
    print(f"User reports count: {len(res5['reports'])}, Dynamic Stats: {res5['stats']}")
    assert r5.status_code == 200

    print("\n--- 6. Testing Support Anti-Spam Protection ---")
    r6 = requests.post(f"{BASE_URL}/reports/{report1_id}/support", json={"user_id": "usr_citizen_01"})
    print(f"First support response: {r6.json()}")
    r7 = requests.post(f"{BASE_URL}/reports/{report1_id}/support", json={"user_id": "usr_citizen_01"})
    print(f"Second (duplicate support) response: {r7.json()}")
    assert r7.json()["already_supported"] is True

    print("\n[SUCCESS] ALL BACKEND API & DATABASE INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
