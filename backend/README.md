# RecruitAI Backend

AI-powered recruitment platform backend built with FastAPI + SQLAlchemy + SQLite.

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment file
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# 4. Seed the database with sample data
python seed.py

# 5. Run the server
uvicorn main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## Sample Credentials (after seeding)

| Role      | Email                         | Password        |
|-----------|-------------------------------|-----------------|
| Admin     | admin@recruitai.com           | Admin@123456    |
| Recruiter | recruiter1@technova.com       | Recruiter@123   |
| Recruiter | recruiter2@datasphere.com     | Recruiter@456   |
| Candidate | alice.chen@gmail.com          | Candidate@123   |
| Candidate | bob.kumar@gmail.com           | Candidate@456   |

## Running Tests

```bash
pip install pytest pytest-asyncio
pytest tests/ -v
```

## Database Migrations (Alembic)

```bash
# Create a new migration
alembic revision --autogenerate -m "describe change"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Project Structure

```
backend/
├── main.py                   # FastAPI app entry point
├── seed.py                   # Database seeder
├── requirements.txt
├── pytest.ini
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
├── app/
│   ├── api/                  # Route handlers
│   │   ├── auth.py
│   │   ├── jobs.py
│   │   ├── applications.py
│   │   ├── resumes.py
│   │   ├── candidates.py
│   │   ├── interviews.py
│   │   ├── notifications.py
│   │   ├── analytics.py
│   │   ├── matching.py
│   │   ├── admin.py
│   │   └── router.py
│   ├── core/
│   │   ├── config.py         # Settings (pydantic-settings)
│   │   └── security.py       # JWT + bcrypt
│   ├── db/
│   │   └── database.py       # SQLAlchemy engine + session
│   ├── models/               # SQLAlchemy ORM models
│   ├── schemas/              # Pydantic request/response schemas
│   └── services/             # Business logic layer
└── ai_module/
    ├── parser.py             # PDF/DOCX text extraction
    ├── extractor.py          # Regex NLP (name, email, skills, etc.)
    ├── matcher.py            # TF-IDF + Jaccard scoring
    └── ranker.py             # Candidate ranking + recommendations
```

## AI Matching

The matching system uses:
- **Skills** (40%): Jaccard similarity + partial substring matching
- **Experience** (25%): Years-based comparison vs job requirements
- **Education** (15%): Degree level detection
- **Keywords** (20%): TF-IDF cosine similarity between resume and job description

Score thresholds:
- 85+ → Excellent Match
- 70–84 → Good Match
- 50–69 → Average Match
- <50 → Not Recommended
