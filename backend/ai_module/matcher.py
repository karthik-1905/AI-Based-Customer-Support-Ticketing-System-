"""
AI Matcher - TF-IDF cosine similarity + Jaccard skill matching.

Scoring weights:
  - Skills match:      40%
  - Experience match:  25%
  - Education match:   15%
  - Keyword match:     20%

No model downloads required - uses sklearn TF-IDF only.
"""
import re
from typing import Any
import math
from collections import Counter


# ---------------------------------------------------------------------------
# Skill matching
# ---------------------------------------------------------------------------
def compute_skill_match(
    candidate_skills: list[str],
    job_skills: list[str],
) -> dict[str, Any]:
    """
    Compute skill match score using Jaccard similarity + partial substring matching.

    Returns:
        dict with:
            score (0-100): weighted skill match score
            matching_skills: list of skills in both
            missing_skills: list of job skills not found in candidate
            partial_matches: skills matched via substring (lower weight)
    """
    if not job_skills:
        return {
            "score": 100.0,
            "matching_skills": [],
            "missing_skills": [],
            "partial_matches": [],
        }

    candidate_lower = {s.lower(): s for s in candidate_skills}
    job_lower = {s.lower(): s for s in job_skills}

    exact_matches: list[str] = []
    partial_matches: list[str] = []
    missing: list[str] = []

    for jskill_lower, jskill_original in job_lower.items():
        if jskill_lower in candidate_lower:
            exact_matches.append(jskill_original)
        else:
            # Partial / substring match
            found_partial = False
            for cskill_lower in candidate_lower:
                if jskill_lower in cskill_lower or cskill_lower in jskill_lower:
                    partial_matches.append(jskill_original)
                    found_partial = True
                    break
            if not found_partial:
                missing.append(jskill_original)

    # Scoring: exact match = 1.0 point per skill, partial = 0.5 point
    total_points = len(job_skills)
    earned = len(exact_matches) * 1.0 + len(partial_matches) * 0.5
    score = min(100.0, (earned / total_points) * 100) if total_points > 0 else 100.0

    all_matching = exact_matches + partial_matches

    return {
        "score": round(score, 2),
        "matching_skills": all_matching,
        "missing_skills": missing,
        "partial_matches": partial_matches,
    }


# ---------------------------------------------------------------------------
# Text similarity
# ---------------------------------------------------------------------------
def compute_text_similarity(text_a: str, text_b: str) -> float:
    """
    Compute cosine similarity between two text strings using pure Python.

    Returns:
        Float in [0, 1] representing similarity.
    """
    if not text_a.strip() or not text_b.strip():
        return 0.0

    try:
        # Tokenize and lowercase
        words_a = re.findall(r'\w+', text_a.lower())
        words_b = re.findall(r'\w+', text_b.lower())

        if not words_a or not words_b:
            return 0.0

        # Calculate word frequency vectors
        vec_a = Counter(words_a)
        vec_b = Counter(words_b)

        intersection = set(vec_a.keys()) & set(vec_b.keys())
        
        # Calculate dot product
        dot_product = sum(vec_a[w] * vec_b[w] for w in intersection)

        # Calculate magnitudes
        mag_a = math.sqrt(sum(val ** 2 for val in vec_a.values()))
        mag_b = math.sqrt(sum(val ** 2 for val in vec_b.values()))

        if mag_a == 0.0 or mag_b == 0.0:
            return 0.0

        return float(dot_product / (mag_a * mag_b))
    except Exception:
        return 0.0


# ---------------------------------------------------------------------------
# Experience match
# ---------------------------------------------------------------------------
def compute_experience_match(
    candidate_years: float,
    job_min_years: int,
    job_max_years: int,
) -> float:
    """
    Score how well the candidate's years of experience matches the job range.

    Returns 0-100.
    """
    if job_min_years <= 0 and job_max_years <= 0:
        return 75.0  # No requirement specified - partial credit

    if candidate_years >= job_min_years:
        if job_max_years <= 0 or candidate_years <= job_max_years:
            return 100.0
        else:
            # Slightly over-qualified
            excess = candidate_years - job_max_years
            penalty = min(excess * 5, 20)  # max 20 point penalty
            return max(80.0, 100.0 - penalty)
    else:
        # Under-qualified
        shortfall = job_min_years - candidate_years
        penalty = min(shortfall * 15, 80)
        return max(0.0, 100.0 - penalty)


# ---------------------------------------------------------------------------
# Education match
# ---------------------------------------------------------------------------
def compute_education_match(
    candidate_education: list[dict],
    education_keywords: list[str],
) -> float:
    """
    Simple scoring: does the candidate have any recognisable degree?

    Returns 0-100.
    """
    if not education_keywords:
        return 75.0  # No requirement specified

    if not candidate_education:
        return 30.0  # Candidate has no education entries

    # Check if any advanced degree is present
    education_text = " ".join(
        str(e.get("degree", "")) + " " + str(e.get("context", ""))
        for e in candidate_education
    ).lower()

    if any(kw in education_text for kw in ["phd", "ph.d", "doctorate"]):
        return 100.0
    if any(kw in education_text for kw in ["master", "m.tech", "m.sc", "mba", "m.s"]):
        return 90.0
    if any(kw in education_text for kw in ["bachelor", "b.tech", "b.sc", "b.e", "b.s"]):
        return 80.0
    if any(kw in education_text for kw in ["diploma", "associate", "hnd"]):
        return 60.0

    return 50.0  # Has some education but unrecognised level


# ---------------------------------------------------------------------------
# Master scoring function
# ---------------------------------------------------------------------------
def compute_match_score(
    parsed_resume: dict[str, Any],
    job_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Compute overall match score between a parsed resume and a job.

    Args:
        parsed_resume: dict with keys: skills, education, experience,
                       raw_text, years_experience
        job_data: dict with keys: skills_required, description,
                  experience_min, experience_max, education_keywords

    Returns:
        dict:
            overall_score: float (0-100)
            breakdown: dict of category -> score
            matching_skills: list[str]
            missing_skills: list[str]
    """
    # ---- Skills (40%) ----
    candidate_skills: list[str] = parsed_resume.get("skills", [])
    job_skills: list[str] = job_data.get("skills_required", [])
    skill_result = compute_skill_match(candidate_skills, job_skills)
    skill_score = skill_result["score"]

    # ---- Experience (25%) ----
    candidate_years = float(parsed_resume.get("years_experience", 0) or 0)
    exp_score = compute_experience_match(
        candidate_years,
        int(job_data.get("experience_min", 0) or 0),
        int(job_data.get("experience_max", 0) or 0),
    )

    # ---- Education (15%) ----
    candidate_education: list[dict] = parsed_resume.get("education", [])
    education_keywords: list[str] = job_data.get(
        "education_keywords", ["bachelor", "master", "phd"]
    )
    edu_score = compute_education_match(candidate_education, education_keywords)

    # ---- Keyword / Text Similarity (20%) ----
    resume_text: str = parsed_resume.get("raw_text", "")
    job_text: str = job_data.get("description", "")
    text_sim = compute_text_similarity(resume_text, job_text)
    keyword_score = text_sim * 100  # convert [0,1] -> [0,100]

    # ---- Weighted Total ----
    overall = (
        skill_score * 0.40
        + exp_score * 0.25
        + edu_score * 0.15
        + keyword_score * 0.20
    )
    overall = round(min(100.0, max(0.0, overall)), 2)

    return {
        "overall_score": overall,
        "breakdown": {
            "skills": round(skill_score, 2),
            "experience": round(exp_score, 2),
            "education": round(edu_score, 2),
            "keywords": round(keyword_score, 2),
        },
        "matching_skills": skill_result["matching_skills"],
        "missing_skills": skill_result["missing_skills"],
    }
