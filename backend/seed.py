"""
Seed script - populate the RecruitAI database with sample data.

Creates:
  - 2 companies
  - 1 admin user
  - 2 recruiters (one per company)
  - 5 candidates
  - 8 jobs (various types and statuses)
  - 15 applications with AI scores and pipeline stages

Usage:
    python seed.py
"""
import asyncio
import json
import random
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.security import hash_password
from app.db.database import Base
from app.models.application import Application, ApplicationStage
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.job import EmploymentType, Job, JobStatus
from app.models.notification import Notification
from app.models.recruiter import Recruiter
from app.models.user import User, UserRole

# ---------------------------------------------------------------------------
# Engine setup
# ---------------------------------------------------------------------------
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------
COMPANIES = [
    {
        "name": "TechNova Solutions",
        "industry": "Software & Technology",
        "size": "200-500",
        "website": "https://technova.example.com",
        "description": "A leading software company specialising in cloud-native applications.",
    },
    {
        "name": "DataSphere Analytics",
        "industry": "Data & Analytics",
        "size": "50-200",
        "website": "https://datasphere.example.com",
        "description": "Turning raw data into actionable insights for Fortune 500 clients.",
    },
]

ADMIN_USER = {
    "email": "admin@recruitai.com",
    "password": "Admin@123456",
    "full_name": "RecruitAI Admin",
    "role": "admin",
}

RECRUITER_USERS = [
    {
        "email": "recruiter1@technova.com",
        "password": "Recruiter@123",
        "full_name": "Sarah Mitchell",
        "role": "recruiter",
        "designation": "Senior Talent Acquisition Specialist",
        "phone": "+1-555-0101",
    },
    {
        "email": "recruiter2@datasphere.com",
        "password": "Recruiter@456",
        "full_name": "James Rodriguez",
        "role": "recruiter",
        "designation": "HR Manager",
        "phone": "+1-555-0202",
    },
]

CANDIDATE_USERS = [
    {
        "email": "alice.chen@gmail.com",
        "password": "Candidate@123",
        "full_name": "Alice Chen",
        "role": "candidate",
        "phone": "+1-555-1001",
        "location": "San Francisco, CA",
        "years_experience": 4.5,
        "summary": "Full-stack developer with 4+ years experience in React and Node.js.",
    },
    {
        "email": "bob.kumar@gmail.com",
        "password": "Candidate@456",
        "full_name": "Bob Kumar",
        "role": "candidate",
        "phone": "+1-555-1002",
        "location": "Austin, TX",
        "years_experience": 7.0,
        "summary": "Senior backend engineer specialising in Python and microservices.",
    },
    {
        "email": "carol.white@gmail.com",
        "password": "Candidate@789",
        "full_name": "Carol White",
        "role": "candidate",
        "phone": "+1-555-1003",
        "location": "New York, NY",
        "years_experience": 2.0,
        "summary": "Junior data scientist with a passion for machine learning.",
    },
    {
        "email": "david.park@gmail.com",
        "password": "Candidate@101",
        "full_name": "David Park",
        "role": "candidate",
        "phone": "+1-555-1004",
        "location": "Seattle, WA",
        "years_experience": 5.5,
        "summary": "DevOps engineer with deep expertise in Kubernetes and AWS.",
    },
    {
        "email": "emma.jones@gmail.com",
        "password": "Candidate@202",
        "full_name": "Emma Jones",
        "role": "candidate",
        "phone": "+1-555-1005",
        "location": "Chicago, IL",
        "years_experience": 3.0,
        "summary": "Frontend developer focused on React and TypeScript performance.",
    },
]


def _jobs_data(company1_id: int, company2_id: int, recruiter1_id: int, recruiter2_id: int) -> list[dict]:
    base_date = datetime.utcnow()
    return [
        {
            "recruiter_id": recruiter1_id,
            "company_id": company1_id,
            "title": "Senior Backend Engineer",
            "department": "Engineering",
            "location": "San Francisco, CA",
            "employment_type": EmploymentType.full_time,
            "salary_min": 120000,
            "salary_max": 160000,
            "experience_min": 4,
            "experience_max": 8,
            "skills_required": json.dumps(["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Redis"]),
            "description": "We are looking for a Senior Backend Engineer to join our platform team.",
            "responsibilities": "Design and implement scalable APIs. Lead code reviews.",
            "benefits": "Health insurance, 401k, Remote-friendly",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=30),
        },
        {
            "recruiter_id": recruiter1_id,
            "company_id": company1_id,
            "title": "React Frontend Developer",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": EmploymentType.full_time,
            "salary_min": 90000,
            "salary_max": 130000,
            "experience_min": 2,
            "experience_max": 6,
            "skills_required": json.dumps(["React", "TypeScript", "CSS", "Redux", "Jest"]),
            "description": "Build beautiful, performant frontend experiences for our SaaS platform.",
            "responsibilities": "Develop React components. Collaborate with designers.",
            "benefits": "Flexible hours, stock options",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=21),
        },
        {
            "recruiter_id": recruiter1_id,
            "company_id": company1_id,
            "title": "DevOps Engineer",
            "department": "Infrastructure",
            "location": "Seattle, WA",
            "employment_type": EmploymentType.full_time,
            "salary_min": 110000,
            "salary_max": 150000,
            "experience_min": 3,
            "experience_max": 7,
            "skills_required": json.dumps(["Kubernetes", "Docker", "Terraform", "AWS", "Linux", "CI/CD"]),
            "description": "Manage and improve our cloud infrastructure and deployment pipelines.",
            "responsibilities": "Maintain K8s clusters. Implement CI/CD pipelines.",
            "benefits": "Remote work, 401k, performance bonus",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=45),
        },
        {
            "recruiter_id": recruiter1_id,
            "company_id": company1_id,
            "title": "Mobile Developer (React Native)",
            "department": "Engineering",
            "location": "Austin, TX",
            "employment_type": EmploymentType.full_time,
            "salary_min": 95000,
            "salary_max": 125000,
            "experience_min": 2,
            "experience_max": 5,
            "skills_required": json.dumps(["React Native", "JavaScript", "iOS", "Android", "Redux"]),
            "description": "Develop cross-platform mobile apps for iOS and Android.",
            "responsibilities": "Build and maintain mobile apps. Work with product team.",
            "benefits": "Gym allowance, health insurance",
            "status": JobStatus.draft,
            "deadline": base_date + timedelta(days=60),
        },
        {
            "recruiter_id": recruiter2_id,
            "company_id": company2_id,
            "title": "Data Scientist",
            "department": "Data Science",
            "location": "New York, NY",
            "employment_type": EmploymentType.full_time,
            "salary_min": 105000,
            "salary_max": 145000,
            "experience_min": 2,
            "experience_max": 6,
            "skills_required": json.dumps(["Python", "Machine Learning", "scikit-learn", "NumPy", "Pandas", "SQL"]),
            "description": "Develop ML models to power our analytics platform.",
            "responsibilities": "Build, train, and deploy ML models. Analyse large datasets.",
            "benefits": "Remote option, professional development budget",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=35),
        },
        {
            "recruiter_id": recruiter2_id,
            "company_id": company2_id,
            "title": "Data Engineer",
            "department": "Data Engineering",
            "location": "Remote",
            "employment_type": EmploymentType.full_time,
            "salary_min": 100000,
            "salary_max": 140000,
            "experience_min": 3,
            "experience_max": 7,
            "skills_required": json.dumps(["Python", "SQL", "Spark", "Kafka", "Airflow", "AWS", "dbt"]),
            "description": "Build and maintain scalable data pipelines.",
            "responsibilities": "Design ETL pipelines. Ensure data quality.",
            "benefits": "Stock options, health & dental",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=25),
        },
        {
            "recruiter_id": recruiter2_id,
            "company_id": company2_id,
            "title": "Machine Learning Engineer",
            "department": "AI/ML",
            "location": "Chicago, IL",
            "employment_type": EmploymentType.full_time,
            "salary_min": 115000,
            "salary_max": 160000,
            "experience_min": 3,
            "experience_max": 8,
            "skills_required": json.dumps(["Python", "TensorFlow", "PyTorch", "Deep Learning", "Kubernetes", "AWS"]),
            "description": "Design and deploy production ML systems.",
            "responsibilities": "Train models, build MLOps pipelines, collaborate with data scientists.",
            "benefits": "Top-tier salary, flexible hours, learning budget",
            "status": JobStatus.active,
            "deadline": base_date + timedelta(days=40),
        },
        {
            "recruiter_id": recruiter2_id,
            "company_id": company2_id,
            "title": "Business Analyst (Closed)",
            "department": "Strategy",
            "location": "New York, NY",
            "employment_type": EmploymentType.full_time,
            "salary_min": 75000,
            "salary_max": 100000,
            "experience_min": 1,
            "experience_max": 4,
            "skills_required": json.dumps(["SQL", "Excel", "Tableau", "Communication", "Problem Solving"]),
            "description": "Analyse business data and produce insight reports.",
            "responsibilities": "Create dashboards, liaise with stakeholders.",
            "benefits": "Standard package",
            "status": JobStatus.closed,
            "deadline": base_date - timedelta(days=10),
        },
    ]


# Candidate x Job application plan with pre-defined AI scores and stages
APPLICATION_PLAN = [
    # (candidate_idx, job_idx, ai_score, stage)
    (0, 0, 88.5, ApplicationStage.shortlisted),
    (0, 1, 92.0, ApplicationStage.offer),
    (1, 0, 95.2, ApplicationStage.hired),
    (1, 2, 78.4, ApplicationStage.interview),
    (1, 4, 65.0, ApplicationStage.screening),
    (2, 4, 82.1, ApplicationStage.shortlisted),
    (2, 5, 70.3, ApplicationStage.applied),
    (2, 6, 55.0, ApplicationStage.rejected),
    (3, 2, 91.7, ApplicationStage.technical),
    (3, 3, 74.5, ApplicationStage.shortlisted),
    (3, 5, 60.2, ApplicationStage.applied),
    (4, 1, 85.0, ApplicationStage.interview),
    (4, 3, 77.8, ApplicationStage.shortlisted),
    (4, 6, 48.3, ApplicationStage.rejected),
    (0, 6, 61.0, ApplicationStage.screening),
]


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------
async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("🌱 Seeding database…")

        # --- Companies ---
        companies: list[Company] = []
        for comp_data in COMPANIES:
            company = Company(**comp_data)
            session.add(company)
            companies.append(company)
        await session.flush()
        print(f"  ✅ Created {len(companies)} companies")

        # --- Admin ---
        admin = User(
            email=ADMIN_USER["email"],
            hashed_password=hash_password(ADMIN_USER["password"]),
            full_name=ADMIN_USER["full_name"],
            role=ADMIN_USER["role"],
            is_active=True,
            is_verified=True,
        )
        session.add(admin)
        await session.flush()
        print(f"  ✅ Created admin: {admin.email}")

        # --- Recruiters ---
        recruiter_objects: list[Recruiter] = []
        for i, rec_data in enumerate(RECRUITER_USERS):
            user = User(
                email=rec_data["email"],
                hashed_password=hash_password(rec_data["password"]),
                full_name=rec_data["full_name"],
                role=rec_data["role"],
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            await session.flush()

            recruiter = Recruiter(
                user_id=user.id,
                company_id=companies[i].id,
                designation=rec_data["designation"],
                phone=rec_data["phone"],
            )
            session.add(recruiter)
            recruiter_objects.append(recruiter)

        await session.flush()
        print(f"  ✅ Created {len(recruiter_objects)} recruiters")

        # --- Candidates ---
        candidate_objects: list[Candidate] = []
        for cand_data in CANDIDATE_USERS:
            user = User(
                email=cand_data["email"],
                hashed_password=hash_password(cand_data["password"]),
                full_name=cand_data["full_name"],
                role=cand_data["role"],
                is_active=True,
                is_verified=False,
            )
            session.add(user)
            await session.flush()

            candidate = Candidate(
                user_id=user.id,
                phone=cand_data["phone"],
                location=cand_data["location"],
                years_experience=cand_data["years_experience"],
                summary=cand_data["summary"],
                linkedin_url=f"https://linkedin.com/in/{cand_data['full_name'].lower().replace(' ', '-')}",
                github_url=f"https://github.com/{cand_data['full_name'].lower().replace(' ', '')}",
            )
            session.add(candidate)
            candidate_objects.append(candidate)

        await session.flush()
        print(f"  ✅ Created {len(candidate_objects)} candidates")

        # --- Jobs ---
        jobs_data = _jobs_data(
            companies[0].id,
            companies[1].id,
            recruiter_objects[0].id,
            recruiter_objects[1].id,
        )
        job_objects: list[Job] = []
        for jd in jobs_data:
            job = Job(**jd)
            session.add(job)
            job_objects.append(job)
        await session.flush()
        print(f"  ✅ Created {len(job_objects)} jobs")

        # --- Applications ---
        application_count = 0
        for cand_idx, job_idx, ai_score, stage in APPLICATION_PLAN:
            # Skip if job is draft (shouldn't have applications in seed)
            job = job_objects[job_idx]
            if job.status == JobStatus.draft:
                continue

            candidate = candidate_objects[cand_idx]
            applied_at = datetime.utcnow() - timedelta(days=random.randint(1, 30))

            application = Application(
                job_id=job.id,
                candidate_id=candidate.id,
                stage=stage,
                ai_score=ai_score,
                applied_at=applied_at,
            )
            session.add(application)
            application_count += 1

            # Create notification for candidate
            cand_user_result = await session.get(User, candidate.user_id)
            if cand_user_result:
                notification = Notification(
                    user_id=candidate.user_id,
                    title="Application Submitted",
                    message=f"Your application for '{job.title}' has been received.",
                    notification_type="application",
                    is_read=random.choice([True, False]),
                )
                session.add(notification)

        await session.commit()
        print(f"  ✅ Created {application_count} applications with AI scores")
        print("\n🎉 Database seeded successfully!")
        print("\nSample credentials:")
        print(f"  Admin:      {ADMIN_USER['email']} / {ADMIN_USER['password']}")
        print(f"  Recruiter1: {RECRUITER_USERS[0]['email']} / {RECRUITER_USERS[0]['password']}")
        print(f"  Recruiter2: {RECRUITER_USERS[1]['email']} / {RECRUITER_USERS[1]['password']}")
        print(f"  Candidate1: {CANDIDATE_USERS[0]['email']} / {CANDIDATE_USERS[0]['password']}")


if __name__ == "__main__":
    asyncio.run(seed())
