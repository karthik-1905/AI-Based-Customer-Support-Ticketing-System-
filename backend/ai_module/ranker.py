"""
AI Ranker - Sort candidates by AI score and generate recommendation labels.
"""
from typing import Any


# ---------------------------------------------------------------------------
# Recommendation thresholds
# ---------------------------------------------------------------------------
def get_recommendation(score: float | None) -> str:
    """
    Map a numeric score to a recommendation label.

    Thresholds:
        >= 85  → Excellent Match
        >= 70  → Good Match
        >= 50  → Average Match
        < 50   → Not Recommended
    """
    if score is None:
        return "Not Scored"
    if score >= 85:
        return "Excellent Match"
    if score >= 70:
        return "Good Match"
    if score >= 50:
        return "Average Match"
    return "Not Recommended"


# ---------------------------------------------------------------------------
# Candidate ranking
# ---------------------------------------------------------------------------
def rank_candidates(candidates: list[Any]) -> list[Any]:
    """
    Sort a list of CandidateRank objects (or dicts) by ai_score descending.
    Candidates without a score are placed at the bottom.

    Args:
        candidates: List of objects with .ai_score attribute (or dict with key).

    Returns:
        Same list with .rank fields filled in, sorted by score descending.
    """
    def _score(c: Any) -> float:
        score = getattr(c, "ai_score", None) or (c.get("ai_score") if isinstance(c, dict) else None)
        return float(score) if score is not None else -1.0

    sorted_candidates = sorted(candidates, key=_score, reverse=True)

    for i, candidate in enumerate(sorted_candidates):
        if hasattr(candidate, "rank"):
            candidate.rank = i + 1
        elif isinstance(candidate, dict):
            candidate["rank"] = i + 1

    return sorted_candidates


# ---------------------------------------------------------------------------
# Insights generator
# ---------------------------------------------------------------------------
def generate_insights(
    parsed_resume: dict[str, Any],
    job_data: dict[str, Any],
    score: float,
) -> dict[str, Any]:
    """
    Generate human-readable insights for a candidate-job match.

    Args:
        parsed_resume: dict with skills, education, experience, years_experience
        job_data: dict with skills_required, experience_min, experience_max, title
        score: overall match score (0-100)

    Returns:
        dict with strengths, weaknesses, missing_skills, summary
    """
    candidate_skills_lower = {s.lower() for s in parsed_resume.get("skills", [])}
    job_skills = job_data.get("skills_required", [])
    job_title = job_data.get("title", "this position")

    matching = [s for s in job_skills if s.lower() in candidate_skills_lower]
    missing = [s for s in job_skills if s.lower() not in candidate_skills_lower]

    strengths: list[str] = []
    weaknesses: list[str] = []

    # Strengths
    if matching:
        strengths.append(f"Matches {len(matching)} of {len(job_skills)} required skills.")
    if parsed_resume.get("education"):
        strengths.append("Has relevant educational background.")
    candidate_years = float(parsed_resume.get("years_experience", 0) or 0)
    exp_min = job_data.get("experience_min", 0) or 0
    if candidate_years >= exp_min:
        strengths.append(f"Has {candidate_years:.0f}+ years of experience (minimum required: {exp_min}).")
    if score >= 85:
        strengths.append("High overall match score indicates strong fit.")

    # Weaknesses
    if missing:
        weaknesses.append(f"Missing {len(missing)} required skills: {', '.join(missing[:5])}.")
    if candidate_years < exp_min:
        weaknesses.append(
            f"Only {candidate_years:.0f} year(s) of experience; position requires {exp_min}+."
        )
    if not parsed_resume.get("education"):
        weaknesses.append("Education details not found in resume.")
    if score < 50:
        weaknesses.append("Low overall match score suggests poor fit.")

    # Summary
    recommendation = get_recommendation(score)
    summary = (
        f"The candidate scored {score:.1f}/100 for {job_title}. "
        f"Recommendation: {recommendation}. "
    )
    if strengths:
        summary += f"Strengths: {strengths[0]} "
    if weaknesses:
        summary += f"Areas to note: {weaknesses[0]}"

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "matching_skills": matching,
        "missing_skills": missing,
        "summary": summary.strip(),
        "recommendation": recommendation,
    }
