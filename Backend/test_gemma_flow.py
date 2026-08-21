import os
import json
import unittest
from db import init_db, get_connection
from gemma_service import parse_gemma_json, generate_gemma_report

class TestGemmaReportFlow(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_json_parsing(self):
        sample_gemma_raw = """```json
{
    "title": "Severe Road Pothole Near Kothrud Junction",
    "description": "A large pothole is visible on the road surface causing traffic slowdowns.",
    "severity": "High",
    "priority": "Urgent",
    "recommended_action": "Inspect and repair damaged road section.",
    "social_caption": "Road safety issue reported near Kothrud.",
    "road_damage_percentage": "38%"
}
```"""
        parsed = parse_gemma_json(sample_gemma_raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["title"], "Severe Road Pothole Near Kothrud Junction")
        self.assertEqual(parsed["severity"], "High")
        self.assertEqual(parsed["priority"], "Urgent")
        self.assertEqual(parsed["road_damage_percentage"], "38%")

    def test_db_schema_columns(self):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("DESCRIBE reports;")
        cols = [row['Field'] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        expected_cols = ['title', 'severity', 'priority', 'recommended_action', 'social_caption', 'road_damage_percentage']
        for col in expected_cols:
            self.assertIn(col, cols, f"Column {col} missing from reports table!")

if __name__ == '__main__':
    unittest.main()
