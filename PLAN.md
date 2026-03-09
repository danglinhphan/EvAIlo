# EvAIlo LMS — Master Project Plan

## Project Overview
Full-stack LMS (Learning Management System) called **EvAIlo**, consisting of:
- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS, shadcn/ui)
- **Backend**: FastAPI (Python), MariaDB (replacing all in-memory mock data)

---

## Directory Structure (Post-Restructure)
```
/
├── frontend/          ← Next.js app
├── backend/           ← FastAPI app
├── .gitignore
├── PLAN.md            ← This file
└── docker-compose.yml ← (Phase 4: Docker)
```

---

## Phases

### Phase 1 — Dev Environment (Current)
- [x] Kill all stale processes
- [x] Restructure codebase: `frontend/` + `backend/` clearly separated
- [ ] Create comprehensive plan per folder/file
- [ ] Replace all mock data with MariaDB (except COURSES which stays mock)
- [ ] Wire real data into all frontend components

### Phase 2 — Real Data Integration
| Area | Target | Keep Mock? |
|------|--------|------------|
| Users / Auth | MariaDB users table | No |
| Assignments | MariaDB assignments + submissions tables | No |
| Analytics | Computed from real assignment data | No |
| Discussions | MariaDB threads + replies tables | No |
| Courses | Hardcoded list (mock) | **YES** |
| Modules | Hardcoded per-course list (mock) | **YES** |

### Phase 3 — Static vs Dynamic Consideration
- **Static export** (`next export`): No server-side rendering. All data fetched client-side via API. Suitable for CDN deployment.
- **Dynamic (default Next.js)**: Supports SSR, ISR, server actions. Better for real-time features.
- **Recommendation**: Stay with dynamic (default) for dev. Evaluate static for production where applicable.

### Phase 4 — Docker Preparation
- `docker-compose.yml` at root orchestrating:
  - `frontend` service (Next.js, port 3000)
  - `backend` service (uvicorn, port 8000)
  - `db` service (MariaDB, port 3306)
- `.env` files per service with secrets
- Health checks + volume mounts for DB

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=evailodbDB_USER=evailouser
DB_PASSWORD=changeme
SECRET_KEY=evAIlo-super-secret-change-in-prod
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Key Design Decisions
1. **JWT auth** stays (stateless, easy to scale). Tokens stored in `localStorage`.
2. **MariaDB** chosen for relational structure (users ↔ assignments ↔ courses).
3. **Courses + Modules remain mock** — content management is out of scope for now.
4. **ORM**: SQLAlchemy (async via `aiomysql` driver).
5. **Migrations**: Alembic for schema versioning.
6. **CORS**: Only `http://localhost:3000` in dev; configurable via env in prod.

---

## Quick Start (Dev)

### Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Database (MariaDB local)
```bash
# Start MariaDB locally or via Docker
docker run -d --name evailomariadb -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=evailodb -e MYSQL_USER=evailouser -e MYSQL_PASSWORD=changeme -p 3306:3306 mariadb:11
```

---

## Sub-Plans (see each folder)
- [`backend/PLAN.md`](backend/PLAN.md)
- [`frontend/PLAN.md`](frontend/PLAN.md)
