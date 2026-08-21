"""
Department Auto-Classification Service for SnapFix Authority Portal.
Provides configurable keyword and category-based departmental suggestion engine.
"""

DEPARTMENT_DEFINITIONS = [
    {
        "id": 1,
        "name": "Road Department",
        "code": "road_dept",
        "keywords": [
            "pothole", "road damage", "broken road", "road crack", "damaged pavement",
            "road surface", "asphalt", "crater", "sinkhole", "road", "highway",
            "pavement", "tar", "curb", "speed breaker", "street damage"
        ],
        "default_priority": "High"
    },
    {
        "id": 2,
        "name": "Waste Management Department",
        "code": "waste_mgmt_dept",
        "keywords": [
            "garbage", "waste", "litter", "overflowing bin", "garbage pile",
            "solid waste", "trash", "dumping", "refuse", "debris", "plastic waste",
            "dustbin", "rubbish", "compost", "landfill"
        ],
        "default_priority": "Medium"
    },
    {
        "id": 3,
        "name": "Electrical Department",
        "code": "electrical_dept",
        "keywords": [
            "streetlight", "broken streetlight", "electric pole", "damaged electrical pole",
            "exposed wire", "electrical issue", "lamp post", "street light", "lighting",
            "wire", "transformer", "power line", "cable", "dark road", "street lamp"
        ],
        "default_priority": "High"
    },
    {
        "id": 4,
        "name": "Drainage Department",
        "code": "drainage_dept",
        "keywords": [
            "open drain", "blocked drain", "drainage", "sewage", "waterlogging",
            "clogged drain", "damaged drainage", "open manhole", "manhole cover",
            "manhole", "drain", "gutter", "sewer", "flood", "stagnant water", "culvert"
        ],
        "default_priority": "Urgent"
    }
]

def classify_department_for_issue(
    issue_category=None,
    raw_class=None,
    title=None,
    ai_description=None,
    user_description=None
):
    """
    Classifies a civic issue and returns the suggested department details.
    
    Returns:
    {
        "suggested_department_id": int,
        "suggested_department_name": str,
        "confidence_score": float,
        "matched_keywords": list[str],
        "reasoning": str
    }
    """
    corpus_parts = [
        str(issue_category or ""),
        str(raw_class or ""),
        str(title or ""),
        str(ai_description or ""),
        str(user_description or "")
    ]
    full_text = " ".join(corpus_parts).lower()

    best_match = None
    max_score = 0
    best_keywords = []

    for dept in DEPARTMENT_DEFINITIONS:
        score = 0
        matched = []
        for kw in dept["keywords"]:
            kw_lower = kw.lower()
            # Direct category/raw_class match has highest weight
            if kw_lower in (issue_category or "").lower() or kw_lower in (raw_class or "").lower():
                score += 5
                matched.append(kw)
            elif kw_lower in full_text:
                score += 2
                matched.append(kw)
        
        if score > max_score:
            max_score = score
            best_match = dept
            best_keywords = list(set(matched))

    if not best_match or max_score == 0:
        # Default fallback to Road Department
        return {
            "suggested_department_id": 1,
            "suggested_department_name": "Road Department",
            "confidence_score": 0.50,
            "matched_keywords": [],
            "reasoning": "Default assignment for general public works infrastructure."
        }

    confidence = min(0.98, max(0.60, 0.50 + (max_score * 0.08)))
    return {
        "suggested_department_id": best_match["id"],
        "suggested_department_name": best_match["name"],
        "confidence_score": round(confidence, 2),
        "matched_keywords": best_keywords[:5],
        "reasoning": f"Matched department keywords: {', '.join(best_keywords[:4])}"
    }
