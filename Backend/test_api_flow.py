import os
import unittest
from app import app
from db import init_db, get_connection

class TestApiReportsEndpoint(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = app.test_client()

    def test_unique_and_duplicate_flow(self):
        # Prepare sample image path
        img_path = os.path.join(os.path.dirname(__file__), '..', 'image.jpg')
        if not os.path.exists(img_path):
            img_path = os.path.join(os.path.dirname(__file__), 'uploads', 'test.jpg')

        with open(img_path, 'rb') as f:
            data = {
                'user_id': 'test_user_99',
                'latitude': '18.5204',
                'longitude': '73.8567',
                'location_name': 'Shivajinagar, Pune',
                'user_description': 'Deep road pothole endangering motorists near signal',
                'issue_category': 'Road Pothole',
                'image': (f, 'pothole_test.jpg')
            }

            resp = self.client.post('/api/reports', data=data, content_type='multipart/form-data')
            print("Response status:", resp.status_code)
            res_json = resp.get_json()
            print("Response duplicate flag:", res_json.get('duplicate'))
            print("Response report ID:", res_json.get('report_id'))

            self.assertIn(resp.status_code, [200, 201])
            self.assertIn('duplicate', res_json)
            self.assertIn('report_id', res_json)

if __name__ == '__main__':
    unittest.main()
