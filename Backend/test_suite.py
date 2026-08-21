import os
import sys
import unittest
from db import init_db, get_connection
from duplicate_detector import detect_duplicate_report, calculate_haversine_distance, compute_semantic_cosine_similarity

class TestSnapFixBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_haversine_distance(self):
        # Coordinates ~69m apart in Pune
        lat1, lon1 = 18.5074, 73.8077
        lat2, lon2 = 18.5078, 73.8082
        dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)
        print(f"Calculated distance: {dist:.2f} meters")
        self.assertLess(dist, 600.0)

    def test_02_semantic_cosine_similarity(self):
        text1 = "Pothole Deep road pothole causing traffic jam"
        text2 = "Pothole Deep road pothole causing traffic jam"
        sim = compute_semantic_cosine_similarity(text1, text2)
        print(f"Calculated Cosine Similarity (Identical): {sim:.4f}")
        self.assertEqual(sim, 1.0)

        text3 = "Pothole deep pothole on road causing traffic"
        sim2 = compute_semantic_cosine_similarity(text1, text3)
        print(f"Calculated Cosine Similarity (Similar): {sim2:.4f}")
        self.assertGreaterEqual(sim2, 0.80)

    def test_03_duplicate_detection(self):
        candidate_reports = [{
            'id': 101,
            'latitude': 18.5074,
            'longitude': 73.8077,
            'issue_category': 'Pothole',
            'user_description': 'Deep road pothole causing traffic jam',
            'ai_description': 'Large pothole detected on the road'
        }]

        # Same location, category, and similar description -> Duplicate (True)
        is_dup, report_id, sim_score, dist_m = detect_duplicate_report(
            18.5075, 73.8078, 'Pothole', 'Deep road pothole causing traffic jam', candidate_reports
        )
        print(f"Duplicate result: is_dup={is_dup}, report_id={report_id}, sim_score={sim_score:.4f}, dist_m={dist_m:.1f}m")
        self.assertTrue(is_dup)
        self.assertEqual(report_id, 101)

        # Different location (> 600m away) -> Not Duplicate (False)
        is_dup_far, _, _, _ = detect_duplicate_report(
            18.5200, 73.8300, 'Pothole', 'Deep road pothole causing traffic jam', candidate_reports
        )
        self.assertFalse(is_dup_far)

if __name__ == '__main__':
    unittest.main()
