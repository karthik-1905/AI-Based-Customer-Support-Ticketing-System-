# RecruitAI – AI-Powered Recruitment & Applicant Tracking System

<div align="center">
  <h3>🧠 Smarter Hiring Powered by Artificial Intelligence</h3>
  <p>A production-ready, full-stack ATS platform with AI resume parsing, skill matching, and candidate ranking.</p>
</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Resume Parsing** | Automatically extract skills, experience, education from PDF/DOCX |
| 🎯 **Smart Skill Matching** | NLP-based semantic matching of candidate skills to job requirements |
| 📊 **Candidate Ranking** | AI-powered scoring and ranking with explanations |
| 🗂️ **Hiring Pipeline** | Drag-and-drop Kanban board with 9 stages |
| 📅 **Interview Scheduling** | Calendar-based scheduling with Google Meet/Zoom support |
| 📈 **Analytics Dashboard** | Real-time hiring metrics, funnel analysis, and trends |
| 🔐 **Role-Based Auth** | JWT authentication with Recruiter/HR/Candidate/Admin roles |
| 🐳 **Docker Ready** | One-command startup with Docker Compose |

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone/navigate to project
cd RecruitAI

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Start all services
docker-compose up --build

# 4. Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup (Development)

#### Prerequisites
- Python 3.12+
- Node.js 20+
- (Optional) PostgreSQL 16

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and configure
cp .env.example .env

# Initialize database (SQLite by default)
python -c "from app.db.database import init_db; import asyncio; asyncio.run(init_db())"

# (Optional) Seed sample data
python seed.py

# Start backend
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend available at: http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Database (SQLite default for dev, use PostgreSQL for production)
DATABASE_URL=sqlite:///./recruitai.db
# For PostgreSQL: postgresql+asyncpg://user:password@localhost:5432/recruitai_db

# JWT Configuration
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# File Uploads
UPLOAD_DIR=./uploads

# CORS (frontend URLs)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (optional - uses console output if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
RecruitAI/
├── 🐳 docker-compose.yml          # Multi-service Docker config
├── 🐳 Dockerfile.backend          # Backend container
├── 🐳 Dockerfile.frontend         # Frontend container (multi-stage)
├── 🌐 nginx.conf                  # Nginx config for production
│
├── backend/                       # FastAPI Python backend
│   ├── main.py                    # App entry point
│   ├── requirements.txt           # Python dependencies
│   ├── seed.py                    # Sample data seeder
│   ├── .env.example               # Environment template
│   ├── app/
│   │   ├── api/                   # Route handlers
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   ├── jobs.py            # Job management
│   │   │   ├── applications.py    # Application tracking
│   │   │   ├── resumes.py         # Resume upload & parsing
│   │   │   ├── candidates.py      # Candidate management
│   │   │   ├── interviews.py      # Interview scheduling
│   │   │   ├── notifications.py   # Notifications
│   │   │   ├── analytics.py       # Dashboard analytics
│   │   │   ├── matching.py        # AI skill matching
│   │   │   └── admin.py           # Admin operations
│   │   ├── core/
│   │   │   ├── config.py          # Settings (pydantic-settings)
│   │   │   └── security.py        # JWT + bcrypt
│   │   ├── db/
│   │   │   └── database.py        # SQLAlchemy engine + session
│   │   ├── models/                # ORM models (SQLAlchemy)
│   │   ├── schemas/               # Pydantic request/response models
│   │   └── services/              # Business logic layer
│   ├── ai_module/
│   │   ├── parser.py              # PDF/DOCX text extraction
│   │   ├── extractor.py           # NLP entity extraction
│   │   ├── matcher.py             # Skill matching + scoring
│   │   └── ranker.py              # Candidate ranking engine
│   ├── alembic/                   # Database migrations
│   └── tests/                     # Pytest unit tests
│
└── frontend/                      # React + Vite + Tailwind
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                # Root + routing
        ├── main.jsx               # React 18 entry
        ├── contexts/              # Auth, Theme contexts
        ├── services/              # Axios API layer
        ├── components/            # Reusable UI components
        │   ├── layout/            # Navbar, Sidebar, DashboardLayout
        │   ├── ui/                # Cards, badges, uploaders
        │   ├── jobs/              # Job cards and forms
        │   ├── candidates/        # Candidate cards
        │   ├── pipeline/          # Kanban board
        │   └── charts/            # Recharts components
        ├── pages/                 # Route-level pages
        │   ├── Landing.jsx
        │   ├── auth/              # Login, Register, ForgotPassword
        │   ├── dashboard/         # Recruiter + Candidate dashboards
        │   ├── jobs/              # Listing, Create, Detail
        │   ├── candidates/        # List, Profile
        │   ├── pipeline/          # Kanban pipeline
        │   ├── resume/            # Resume analyzer
        │   ├── interviews/        # Scheduler + calendar
        │   ├── analytics/         # Full analytics
        │   └── admin/             # Admin panel
        ├── hooks/                 # Custom React hooks
        ├── utils/                 # Formatters, helpers
        └── data/                  # Mock data for development
```

---

## 🔌 API Documentation

When the backend is running, visit:
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login + get JWT token |
| GET | `/jobs` | List jobs (paginated, filterable) |
| POST | `/jobs` | Create job (recruiter only) |
| POST | `/resumes/upload` | Upload resume file |
| POST | `/resumes/{id}/parse` | Trigger AI parsing |
| POST | `/match` | AI skill matching score |
| GET | `/rankings/{job_id}` | Ranked candidates for a job |
| GET | `/analytics/dashboard` | Dashboard statistics |

---

## 🧪 Running Tests

```bash
cd backend
# Activate virtual environment first
pytest tests/ -v
```

---

## 🎭 Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@recruitai.com | Admin@123 |
| Recruiter | recruiter@techcorp.com | Recruiter@123 |
| HR Manager | hr@techcorp.com | HRManager@123 |
| Candidate | candidate1@gmail.com | Candidate@123 |

---

## 🏗️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI Framework |
| Vite | 5 | Build Tool |
| Tailwind CSS | 3 | Utility Styling |
| Material UI | 5 | Component Library |
| React Router | 6 | Client Routing |
| Axios | latest | HTTP Client |
| Recharts | latest | Data Visualization |
| Framer Motion | latest | Animations |
| react-beautiful-dnd | latest | Drag & Drop |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | Web Framework |
| Python | 3.12+ | Language |
| SQLAlchemy | 2.x | ORM |
| Pydantic | v2 | Data Validation |
| python-jose | latest | JWT Tokens |
| passlib | latest | Password Hashing |

### AI/NLP
| Library | Purpose |
|---|---|
| pdfplumber | PDF text extraction |
| PyMuPDF | Advanced PDF processing |
| python-docx | DOCX parsing |
| scikit-learn | TF-IDF, cosine similarity |
| spaCy | NLP entity recognition |
| sentence-transformers | Semantic similarity |
| NLTK | Text processing |

---

## 🚢 Production Deployment

```bash
# Build production frontend
cd frontend && npm run build

# Use PostgreSQL in production
# Update DATABASE_URL in backend/.env to PostgreSQL connection string

# Run with Docker Compose (production profile coming soon)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ by the RecruitAI Team</p>
  <p>Powered by FastAPI + React + AI</p>
</div>
