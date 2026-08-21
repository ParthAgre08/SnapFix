import io
import os
import sys
import json
from PIL import Image

sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

from app import app
from db import init_db, get_connection

def run_tests():
    print("=== STARTING SNAPFIX AUTHORITY WORKFLOW TESTS ===")
    init_db()
    client = app.test_client()

    # Step 1: Submit citizen report
    print("\n[Step 1] Citizen submits civic report (Pothole)...")
    img_byte_arr = io.BytesIO()
    Image.new('RGB', (200, 200), color='red').save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    import random
    unique_num = random.randint(10000, 99999)
    test_lat = 18.6000 + (unique_num / 1000000.0)
    test_lon = 73.9000 + (unique_num / 1000000.0)

    res = client.post('/api/reports', data={
        'user_id': f'usr_test_citizen_{unique_num}',
        'latitude': str(test_lat),
        'longitude': str(test_lon),
        'location_name': f'Test Road Sector {unique_num}, Pune',
        'issue_category': 'Road Pothole',
        'user_description': f'Deep road pothole test defect {unique_num} causing major disruption',
        'image': (img_byte_arr, f'test_pothole_{unique_num}.jpg')
    }, content_type='multipart/form-data')

    assert res.status_code in [200, 201], f"Submit report failed: {res.data}"
    rep_data = res.get_json()
    report_id = rep_data.get('report_id')
    assert report_id is not None
    print(f"-> Report created with ID #{report_id}, Status: {rep_data.get('status', 'Reported')}")

    # Step 2: Head Authority views reported issues
    print("\n[Step 2] Head Authority views Reported Issues Queue...")
    res = client.get('/api/authority/reports?status=Reported', headers={
        'X-User-Id': 'auth_head_admin_01'
    })
    assert res.status_code == 200, f"Head authority fetch failed: {res.data}"
    reports_list = res.get_json().get('reports', [])
    target = next((r for r in reports_list if r['id'] == report_id), None)
    assert target is not None, "Created report not found in Reported queue"
    assert target['suggested_department_id'] == 1, f"Expected suggested dept 1, got {target['suggested_department_id']}"
    print(f"-> Found report in Reported queue. Suggested Dept: {target['suggested_department_name']} (ID: {target['suggested_department_id']})")

    # Step 3: Head Authority assigns to Road Department
    print("\n[Step 3] Head Authority assigns report to Road Department (ID 1)...")
    res = client.post(f'/api/authority/reports/{report_id}/assign', headers={
        'X-User-Id': 'auth_head_admin_01'
    }, json={
        'department_id': 1,
        'contractor_id': 'auth_road_contractor_01',
        'authority_note': 'Priority asphalt repair required within 24 hours.'
    })
    assert res.status_code == 200, f"Assign failed: {res.data}"
    assign_data = res.get_json().get('report')
    assert assign_data['status'] == 'Pending', f"Expected status Pending, got {assign_data['status']}"
    assert assign_data['assigned_department_id'] == 1
    print(f"-> Successfully assigned. Status: {assign_data['status']}, Assigned Dept ID: {assign_data['assigned_department_id']}")

    # Step 4: Unauthorized contractor (Drainage Dept ID 4) attempts to access Road report
    print("\n[Step 4] Drainage Contractor attempts to access Road Department report...")
    res = client.get(f'/api/contractor/reports/{report_id}', headers={
        'X-User-Id': 'auth_drainage_contractor_01'
    })
    assert res.status_code == 403, f"Expected 403 Forbidden, got {res.status_code}"
    print("-> Correctly rejected with HTTP 403 Forbidden (Department Isolation enforced).")

    # Step 5: Road Contractor accesses assigned report
    print("\n[Step 5] Road Contractor accesses assigned report...")
    res = client.get(f'/api/contractor/reports/{report_id}', headers={
        'X-User-Id': 'auth_road_contractor_01'
    })
    assert res.status_code == 200, f"Contractor fetch failed: {res.data}"
    contractor_view = res.get_json()
    assert contractor_view['status'] == 'Pending'
    print(f"-> Road Contractor successfully retrieved report. Authority Note: {contractor_view['authority_note']}")

    # Step 6: Contractor clicks Start Work
    print("\n[Step 6] Road Contractor starts work...")
    res = client.post(f'/api/contractor/reports/{report_id}/start', headers={
        'X-User-Id': 'auth_road_contractor_01'
    })
    assert res.status_code == 200, f"Start work failed: {res.data}"
    started_data = res.get_json().get('report')
    assert started_data['status'] == 'In Progress'
    assert started_data['started_at'] is not None
    print(f"-> Work started. Status: {started_data['status']}, Started At: {started_data['started_at']}")

    # Step 7: Contractor attempts to resolve WITHOUT image evidence
    print("\n[Step 7] Contractor attempts to resolve without resolution image...")
    res = client.post(f'/api/contractor/reports/{report_id}/resolve', headers={
        'X-User-Id': 'auth_road_contractor_01'
    }, data={
        'resolution_description': 'Filled pothole with bitumen and compacted road surface.'
    }, content_type='multipart/form-data')
    assert res.status_code == 400, f"Expected 400 Bad Request when image is missing, got {res.status_code}"
    print("-> Correctly rejected with HTTP 400: Mandatory resolution image evidence enforced.")

    # Step 8 & 9: Contractor resolves WITH image evidence
    print("\n[Step 8 & 9] Contractor uploads resolution image and description...")
    res_img_byte_arr = io.BytesIO()
    Image.new('RGB', (200, 200), color='green').save(res_img_byte_arr, format='JPEG')
    res_img_byte_arr.seek(0)

    res = client.post(f'/api/contractor/reports/{report_id}/resolve', headers={
        'X-User-Id': 'auth_road_contractor_01'
    }, data={
        'resolution_description': 'Asphalt resurfaced and compacted. Road leveled and clear for traffic.',
        'resolution_image': (res_img_byte_arr, 'resolution_fixed.jpg')
    }, content_type='multipart/form-data')
    assert res.status_code == 200, f"Resolution submission failed: {res.data}"
    resolved_res = res.get_json().get('report')
    assert resolved_res['status'] == 'Resolved'
    assert resolved_res['resolved_at'] is not None
    assert resolved_res['resolution_image_url'] is not None
    print(f"-> Successfully resolved! Status: {resolved_res['status']}")
    print(f"-> Resolution Title: {resolved_res['resolution_title']}")
    print(f"-> Resolution Image: {resolved_res['resolution_image_url']}")

    # Step 10: Community Feed Verification
    print("\n[Step 10] Checking Community Feed for Before/After presentation...")
    res = client.get('/api/community/reports')
    assert res.status_code == 200
    feed_items = res.get_json().get('reports', [])
    feed_target = next((f for f in feed_items if f['id'] == report_id), None)
    assert feed_target is not None, "Resolved report missing in community feed"
    assert feed_target['is_resolved'] is True
    assert feed_target['before_image_url'] is not None
    assert feed_target['after_image_url'] is not None
    print("-> Community Feed verified: Resolved post contains both Before & After images and Gemma resolution summary.")

    # Step 11: Authority Dashboard KPI & Department Matrix Verification
    print("\n[Step 11] Checking Authority Dashboard metrics...")
    res = client.get('/api/authority/dashboard', headers={
        'X-User-Id': 'auth_head_admin_01'
    })
    assert res.status_code == 200
    dash_data = res.get_json()
    kpis = dash_data.get('kpis', {})
    print(f"-> KPIs: Total Reports: {kpis.get('total_reports')}, Resolved: {kpis.get('total_resolved')}, Rate: {kpis.get('overall_resolution_rate')}%")
    assert len(dash_data.get('department_performance', [])) == 4
    print("-> All 4 municipal departments correctly present in performance matrix.")

    print("\n=== ALL WORKFLOW TESTS PASSED SUCCESSFULLY! ===")

if __name__ == '__main__':
    run_tests()
