"""
Tests for auth endpoints: register and login.
Uses httpx AsyncClient with an in-memory SQLite test database.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.database import Base, get_db
from main import app

# ---------------------------------------------------------------------------
# Test database (in-memory SQLite)
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
    """Create all tables before each test and drop them after."""
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
# Test cases
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_register_candidate(client: AsyncClient):
    """A new candidate can register successfully."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "alice@example.com",
            "password": "securepassword123",
            "full_name": "Alice Johnson",
            "role": "candidate",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "candidate"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Registering with a duplicate email returns 400."""
    payload = {
        "email": "bob@example.com",
        "password": "password1234",
        "full_name": "Bob Smith",
        "role": "candidate",
    }
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Registered user can log in and receive a JWT token."""
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "carol@example.com",
            "password": "mypassword99",
            "full_name": "Carol White",
            "role": "candidate",
        },
    )
    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "carol@example.com", "password": "mypassword99"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "candidate"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Login with wrong password returns 401."""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "dave@example.com",
            "password": "correctpassword",
            "full_name": "Dave Brown",
            "role": "candidate",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "dave@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    """GET /auth/me returns the current user with a valid token."""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "eve@example.com",
            "password": "password123",
            "full_name": "Eve Green",
            "role": "candidate",
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "eve@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]

    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "eve@example.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """GET /auth/me without token returns 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
