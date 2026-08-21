import math
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

EARTH_RADIUS_METERS = 6371000.0
CANDIDATE_MAX_DISTANCE_METERS = 600.0
SIMILARITY_THRESHOLD = 0.80

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points on earth in meters.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_METERS * c

def compute_semantic_cosine_similarity(text1, text2):
    """
    Compute semantic text embedding vector similarity (cosine similarity) between two text descriptions.
    Uses multi-granularity (word + character boundary n-gram) TF-IDF text embedding vector space model.
    Returns float between 0.0 and 1.0.
    """
    if not text1 or not text2:
        return 0.0

    s1 = text1.strip().lower()
    s2 = text2.strip().lower()

    if s1 == s2:
        return 1.0

    try:
        # Word-level TF-IDF embedding vector cosine similarity
        v_word = TfidfVectorizer(ngram_range=(1, 2), min_df=1, analyzer='word')
        m_word = v_word.fit_transform([s1, s2])
        sim_word = float(cosine_similarity(m_word[0:1], m_word[1:2])[0][0])

        # Character n-gram TF-IDF embedding vector cosine similarity
        v_char = TfidfVectorizer(ngram_range=(2, 4), min_df=1, analyzer='char_wb')
        m_char = v_char.fit_transform([s1, s2])
        sim_char = float(cosine_similarity(m_char[0:1], m_char[1:2])[0][0])

        # Maximum vector embedding similarity score
        sim_score = max(sim_word, sim_char)
        return round(sim_score, 4)
    except Exception:
        # Fallback Jaccard word set similarity
        words1 = set(s1.split())
        words2 = set(s2.split())
        if not words1 or not words2:
            return 0.0
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return float(len(intersection) / len(union))

def is_category_match(cat1, cat2):
    """Check if issue categories match (case-insensitive comparison)."""
    if not cat1 or not cat2:
        return True
    c1 = cat1.strip().lower()
    c2 = cat2.strip().lower()
    return c1 in c2 or c2 in c1

def detect_duplicate_report(new_lat, new_lon, new_category, new_desc, candidate_reports):
    """
    Detect if incoming report is a duplicate of any existing report in candidate_reports.
    
    Logic:
    1. Filter existing reports within ~500-600 meters (distance <= 600m).
    2. Check if issue categories match.
    3. Calculate semantic cosine similarity between descriptions.
    4. If similarity >= 0.80 (80%), consider it a duplicate.
    
    Returns:
    (is_duplicate, matching_report_id, similarity_score, distance_meters)
    """
    if not candidate_reports:
        return False, None, 0.0, 0.0

    new_full_desc = f"{new_category or ''} {new_desc or ''}".strip()

    for report in candidate_reports:
        r_id = report.get('id')
        r_lat = float(report.get('latitude', 0.0))
        r_lon = float(report.get('longitude', 0.0))
        r_cat = report.get('issue_category', '')
        r_user_desc = report.get('user_description', '') or ''
        r_ai_desc = report.get('ai_description', '') or ''

        # 1. Check distance (candidate search radius 500-600m)
        dist_m = calculate_haversine_distance(new_lat, new_lon, r_lat, r_lon)
        if dist_m > CANDIDATE_MAX_DISTANCE_METERS:
            continue

        # 2. Compare issue category
        if not is_category_match(new_category, r_cat):
            continue

        # 3. Calculate semantic cosine similarity (comparing user & AI descriptions)
        sim_user = compute_semantic_cosine_similarity(new_full_desc, f"{r_cat} {r_user_desc}".strip())
        sim_ai = compute_semantic_cosine_similarity(new_full_desc, f"{r_cat} {r_ai_desc}".strip())
        sim_score = max(sim_user, sim_ai)

        # 4. If similarity >= 80% (0.80), classify as DUPLICATE
        if sim_score >= SIMILARITY_THRESHOLD:
            return True, r_id, sim_score, dist_m

    return False, None, 0.0, 0.0
