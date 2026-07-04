"""
NLP Extractor - regex-based extraction of structured data from resume text.

Extracts:
  - Email, phone, name
  - Skills (matched against 100+ curated taxonomy)
  - Education (degree keywords)
  - Work experience (duration patterns)
  - Resume sections
"""
import re
from typing import Any

# ---------------------------------------------------------------------------
# Skill Taxonomy - 100+ curated skills across tech categories
# ---------------------------------------------------------------------------
SKILL_TAXONOMY: list[str] = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Haskell",
    "Elixir", "Dart", "Lua", "Groovy", "Objective-C", "Assembly", "COBOL", "Fortran",
    # Web Frontend
    "React", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Svelte",
    "HTML", "CSS", "SASS", "SCSS", "Less", "Tailwind CSS", "Bootstrap",
    "jQuery", "Redux", "MobX", "Webpack", "Vite", "Babel",
    # Web Backend
    "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "Spring",
    "Laravel", "Rails", "Ruby on Rails", "ASP.NET", "NestJS", "Koa", "Hapi",
    "GraphQL", "REST", "gRPC", "WebSocket", "Microservices",
    # Databases
    "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle", "Microsoft SQL Server",
    "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch", "Neo4j",
    "CouchDB", "InfluxDB", "Firestore", "Supabase", "PlanetScale",
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
    "Helm", "Prometheus", "Grafana", "Nginx", "Apache", "Linux", "Bash", "Shell",
    # Data Science & ML
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "scikit-learn", "NumPy", "Pandas", "Matplotlib", "Seaborn", "Jupyter",
    "Spark", "Hadoop", "Kafka", "Airflow", "dbt", "Data Pipeline",
    "NLP", "Computer Vision", "OpenCV", "Hugging Face", "LangChain",
    # Mobile
    "Android", "iOS", "React Native", "Flutter", "Xamarin", "Ionic",
    # Testing
    "Unit Testing", "Integration Testing", "Pytest", "Jest", "Mocha", "Cypress",
    "Selenium", "Playwright", "JUnit", "TestNG", "TDD", "BDD",
    # Tools & Practices
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Agile",
    "Scrum", "Kanban", "CI/CD", "DevOps", "Microservices", "SOA",
    # Design & Architecture
    "System Design", "Design Patterns", "OOP", "Functional Programming",
    "Clean Architecture", "DDD", "Event-Driven Architecture", "SOLID",
    # Soft Skills
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Analytical",
    "Project Management", "Mentoring",
]

# Build a lowercase lookup for fast matching
_SKILL_LOWER: dict[str, str] = {s.lower(): s for s in SKILL_TAXONOMY}

# ---------------------------------------------------------------------------
# Section keywords
# ---------------------------------------------------------------------------
SECTION_KEYWORDS: list[str] = [
    "education", "experience", "work experience", "employment",
    "skills", "technical skills", "projects", "certifications",
    "achievements", "awards", "publications", "languages", "summary",
    "objective", "profile", "contact", "references", "interests", "hobbies",
]

DEGREE_KEYWORDS: list[str] = [
    "bachelor", "b.sc", "b.tech", "b.e", "b.a", "b.com",
    "master", "m.sc", "m.tech", "m.e", "m.a", "m.com", "mba",
    "phd", "ph.d", "doctorate", "associate", "diploma", "hnd", "hsc", "ssc",
    "b.s.", "m.s.", "b.eng", "m.eng", "postgraduate",
]


# ---------------------------------------------------------------------------
# Email extraction
# ---------------------------------------------------------------------------
def extract_email(text: str) -> str | None:
    """Extract the first email address found in the text."""
    pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)
    return match.group(0).lower() if match else None


# ---------------------------------------------------------------------------
# Phone extraction
# ---------------------------------------------------------------------------
def extract_phone(text: str) -> str | None:
    """
    Extract the first plausible phone number.
    Handles formats like: +91-9876543210, (123) 456-7890, 9876543210, etc.
    """
    pattern = r"""
        (?:                         # optional country code
            \+?\d{1,3}[\s\-\.]?
        )?
        (?:                         # optional area code with parens
            \(?\d{2,4}\)?[\s\-\.]?
        )
        \d{3,5}                     # main number prefix
        [\s\-\.]?
        \d{4,6}                     # main number suffix
    """
    match = re.search(pattern, text, re.VERBOSE)
    if match:
        raw = match.group(0).strip()
        # Filter out strings that look like years (e.g. 2020)
        digits_only = re.sub(r"\D", "", raw)
        if len(digits_only) >= 7:
            return raw
    return None


# ---------------------------------------------------------------------------
# Name extraction
# ---------------------------------------------------------------------------
def extract_name(text: str) -> str | None:
    """
    Heuristic: the candidate's name is usually on the first non-empty line.
    Filters out lines that look like email addresses, phone numbers, or URLs.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:5]:  # Check first 5 lines
        # Skip if line contains email, URL, or too many words (a title/header)
        if re.search(r"[@://]", line):
            continue
        if re.search(r"\d{5,}", line):  # skip lines with long digit sequences
            continue
        words = line.split()
        if 1 < len(words) <= 5:  # reasonable name length
            # Must be Title Case or ALL CAPS
            if line.istitle() or line.isupper() or all(w[0].isupper() for w in words if w.isalpha()):
                return line
    return lines[0] if lines else None


# ---------------------------------------------------------------------------
# Skills extraction
# ---------------------------------------------------------------------------
def extract_skills(text: str, custom_skill_list: list[str] | None = None) -> list[str]:
    """
    Match text against the curated skill taxonomy using case-insensitive search.
    Optionally accepts an additional custom_skill_list to match against.

    Returns a deduplicated list of matched canonical skill names.
    """
    text_lower = text.lower()
    found_skills: set[str] = set()

    # Build combined lookup
    lookup = dict(_SKILL_LOWER)
    if custom_skill_list:
        for s in custom_skill_list:
            lookup[s.lower()] = s

    for skill_lower, canonical in lookup.items():
        # Use word-boundary or comma/space delimited match to avoid false positives
        pattern = r"(?<![a-zA-Z])" + re.escape(skill_lower) + r"(?![a-zA-Z])"
        if re.search(pattern, text_lower):
            found_skills.add(canonical)

    return sorted(found_skills)


# ---------------------------------------------------------------------------
# Education extraction
# ---------------------------------------------------------------------------
def extract_education(text: str) -> list[dict[str, Any]]:
    """
    Find degree mentions and return a list of education entries.
    Each entry: {"degree": str, "context": str (surrounding text snippet)}
    """
    results: list[dict] = []
    lines = text.split("\n")
    seen: set[str] = set()

    for i, line in enumerate(lines):
        line_lower = line.lower()
        for degree_kw in DEGREE_KEYWORDS:
            if degree_kw in line_lower and degree_kw not in seen:
                # Grab context (up to 2 surrounding lines)
                start = max(0, i - 1)
                end = min(len(lines), i + 2)
                context = " | ".join(l.strip() for l in lines[start:end] if l.strip())
                results.append({"degree": degree_kw.upper(), "context": context[:300]})
                seen.add(degree_kw)
                break  # one match per line

    return results


# ---------------------------------------------------------------------------
# Experience extraction
# ---------------------------------------------------------------------------
def extract_experience(text: str) -> list[dict[str, Any]]:
    """
    Find work experience entries by detecting date ranges or 'X years' patterns.
    Returns a list of experience entries with context.
    """
    results: list[dict] = []

    # Pattern 1: Date ranges like "Jan 2020 - Mar 2023" or "2019 - Present"
    date_range_pattern = re.compile(
        r"(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?"
        r"(?:19|20)\d{2}"
        r"\s*[-–—to]+\s*"
        r"(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?"
        r"(?:(?:19|20)\d{2}|present|current|now)",
        re.IGNORECASE,
    )

    lines = text.split("\n")
    for i, line in enumerate(lines):
        if date_range_pattern.search(line):
            # Grab surrounding context
            start = max(0, i - 1)
            end = min(len(lines), i + 3)
            context = " | ".join(l.strip() for l in lines[start:end] if l.strip())
            date_match = date_range_pattern.search(line)
            results.append({
                "date_range": date_match.group(0) if date_match else "",
                "context": context[:300],
            })

    # Pattern 2: "X years of experience"
    years_pattern = re.compile(
        r"(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?\s+(?:of\s+)?(?:experience|exp)",
        re.IGNORECASE,
    )
    for match in years_pattern.finditer(text):
        results.append({
            "years_mentioned": match.group(1),
            "context": text[max(0, match.start() - 50):match.end() + 50].strip(),
        })

    return results


# ---------------------------------------------------------------------------
# Section splitting
# ---------------------------------------------------------------------------
def extract_sections(text: str) -> dict[str, str]:
    """
    Split resume text into labelled sections.
    Returns a dict mapping section_name -> section_text.
    """
    sections: dict[str, str] = {}
    current_section = "header"
    current_lines: list[str] = []

    section_pattern = re.compile(
        r"^(" + "|".join(re.escape(k) for k in SECTION_KEYWORDS) + r")\s*:?\s*$",
        re.IGNORECASE,
    )

    for line in text.split("\n"):
        match = section_pattern.match(line.strip())
        if match:
            # Save previous section
            if current_lines:
                sections[current_section] = "\n".join(current_lines).strip()
            current_section = match.group(1).lower()
            current_lines = []
        else:
            current_lines.append(line)

    # Save last section
    if current_lines:
        sections[current_section] = "\n".join(current_lines).strip()

    return sections
