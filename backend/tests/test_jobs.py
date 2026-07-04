"""
Tests for job endpoints: create, list, update, publish, close.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.database import Base, get_db
from main import app

# ---------------------------------------------------------------------------
# Test database
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.dependency_overrides[get_db] = override_get_db
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _register_and_login(client: AsyncClient, role: str = "recruiter") -> dict:
    """Register a user and return login response data including token."""
    email = f"{role}_test@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "password123",
            "full_name": f"Test {role.title()}",
            "role": role,
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return login.json()


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_create_job(client: AsyncClient):
    """Recruiter can create a job posting."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    response = await client.post(
        "/api/v1/jobs",
        json={
            "title": "Backend Engineer",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": "full_time",
            "skills_required": ["Python", "FastAPI", "PostgreSQL"],
            "experience_min": 2,
            "experience_max": 5,
            "description": "We are looking for a backend engineer...",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Backend Engineer"
    assert data["status"] == "draft"
    assert "Python" in data["skills_required"]


@pytest.mark.asyncio
async def test_list_jobs(client: AsyncClient):
    """Jobs endpoint returns a paginated list."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    # Create two jobs
    for i in range(2):
        await client.post(
            "/api/v1/jobs",
            json={"title": f"Job {i}", "employment_type": "full_time"},
            headers={"Authorization": f"Bearer {token}"},
        )

    response = await client.get(
        "/api/v1/jobs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 2


@pytest.mark.asyncio
async def test_get_single_job(client: AsyncClient):
    """GET /jobs/{id} returns a specific job."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    create_resp = await client.post(
        "/api/v1/jobs",
        json={"title": "Frontend Dev", "employment_type": "part_time"},
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = create_resp.json()["id"]

    response = await client.get(
        f"/api/v1/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == job_id


@pytest.mark.asyncio
async def test_update_job(client: AsyncClient):
    """PUT /jobs/{id} updates job fields."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    create_resp = await client.post(
        "/api/v1/jobs",
        json={"title": "Old Title", "employment_type": "full_time"},
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = create_resp.json()["id"]

    update_resp = await client.put(
        f"/api/v1/jobs/{job_id}",
        json={"title": "New Title", "location": "New York"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "New Title"
    assert update_resp.json()["location"] == "New York"


@pytest.mark.asyncio
async def test_publish_job(client: AsyncClient):
    """POST /jobs/{id}/publish changes status to active."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    create_resp = await client.post(
        "/api/v1/jobs",
        json={"title": "DevOps Engineer", "employment_type": "full_time"},
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = create_resp.json()["id"]

    pub_resp = await client.post(
        f"/api/v1/jobs/{job_id}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pub_resp.status_code == 200
    assert pub_resp.json()["status"] == "active"


@pytest.mark.asyncio
async def test_close_job(client: AsyncClient):
    """POST /jobs/{id}/close changes status to closed."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    create_resp = await client.post(
        "/api/v1/jobs",
        json={"title": "QA Engineer", "employment_type": "full_time"},
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = create_resp.json()["id"]

    close_resp = await client.post(
        f"/api/v1/jobs/{job_id}/close",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert close_resp.status_code == 200
    assert close_resp.json()["status"] == "closed"


@pytest.mark.asyncio
async def test_delete_job(client: AsyncClient):
    """DELETE /jobs/{id} removes the job."""
    auth = await _register_and_login(client, "recruiter")
    token = auth["access_token"]

    create_resp = await client.post(
        "/api/v1/jobs",
        json={"title": "Temp Job", "employment_type": "contract"},
        headers={"Authorization": f"Bearer {token}"},
    )
    job_id = create_resp.json()["id"]

    del_resp = await client.delete(
        f"/api/v1/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 204

    get_resp = await client.get(
        f"/api/v1/jobs/{job_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_candidate_cannot_create_job(client: AsyncClient):
    """Candidates are not allowed to create jobs."""
    auth = await _register_and_login(client, "candidate")
    token = auth["access_token"]

    response = await client.post(
        "/api/v1/jobs",
        json={"title": "Unauthorized Job", "employment_type": "full_time"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
