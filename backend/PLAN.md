# Backend — Plan

## Stack
- **Framework**: FastAPI 0.115
- **Python**: 3.11+
- **Database**: MariaDB 11 via SQLAlchemy (async) + Alembic migrations
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **ORM driver**: `aiomysql` (async) + `sqlalchemy[asyncio]`

---

## Current State
All data is served from **in-memory mock** (`data/mock.py`). The goal is to replace everything except Courses + Modules with real MariaDB data.

---

## Target Structure (Post-Migration)
```
backend/
├── main.py               ← App entry point, CORS, router mounting
├── requirements.txt      ← Updated with DB deps
├── .env                  ← Secrets + DB config (gitignored)
├── alembic.ini           ← Alembic config
├── core/
│   ├── __init__.py
│   ├── config.py         ← NEW: pydantic-settings config from .env
│   ├── security.py       ← JWT + bcrypt (keep, refactor SECRET_KEY to config)
│   └── deps.py           ← Updated: get_current_user from DB, not mock
├── db/
│   ├── __init__.py       ← NEW
│   ├── session.py        ← NEW: async engine + SessionLocal
│   └── base.py           ← NEW: declarative Base for all models
├── models/
│   ├── __init__.py
│   ├── user.py           ← Pydantic schemas (keep) + SQLAlchemy ORM model (add)
│   ├── lms.py            ← Pydantic schemas (keep) + ORM models for assignments, discussions
│   └── orm.py            ← NEW: all SQLAlchemy ORM table definitions
├── data/
│   ├── __init__.py
│   ├── mock.py           ← Retain ONLY: COURSES, MODULES (mock content data)
│   └── seed.py           ← NEW: seed script for initial DB data
├── routers/
│   ├── __init__.py
│   ├── auth.py           ← Updated: register/login with DB
│   ├── courses.py        ← Unchanged: still returns mock COURSES list
│   ├── modules.py        ← Unchanged: still returns mock MODULES
│   ├── assignments.py    ← Updated: CRUD from DB
│   ├── analytics.py      ← Updated: computed from real assignment data
│   └── discussions.py    ← Updated: threads + replies from DB
└── migrations/
    └── versions/         ← Alembic migration scripts
```

---

## File-by-File Tasks

### `main.py`
- [x] Add routers, CORS (complete)
- [ ] Add lifespan handler to create DB tables on startup (or rely on Alembic)
- [ ] Move `allow_origins` to env config

### `core/config.py` ← NEW FILE
- [ ] Create `Settings` class using `pydantic-settings`
- [ ] Fields: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- [ ] Load from `.env` file

### `core/security.py`
- [ ] Replace hardcoded `SECRET_KEY` with `settings.SECRET_KEY`
- [ ] Replace hardcoded `ACCESS_TOKEN_EXPIRE_MINUTES` with `settings.ACCESS_TOKEN_EXPIRE_MINUTES`

### `core/deps.py`
- [ ] Replace `USERS_DB.get(email)` mock lookup with async DB query via SQLAlchemy
- [ ] Inject `AsyncSession` dependency

### `db/session.py` ← NEW FILE
- [ ] Create async SQLAlchemy engine using `aiomysql`
- [ ] Create `AsyncSessionLocal` scoped session
- [ ] Provide `get_db()` dependency for FastAPI injection

### `db/base.py` ← NEW FILE
- [ ] Define `Base = declarative_base()`  
- [ ] Import all ORM models here so Alembic can detect them

### `models/orm.py` ← NEW FILE
Define SQLAlchemy ORM tables:

| Table | Columns |
|-------|---------|
| `users` | id (UUID PK), name, email (unique), hashed_password, role, avatar, created_at |
| `assignments` | id (UUID PK), name, course_id (FK→courses.id or just string), user_id (FK→users.id), score, max_score, status, due_date, submitted_at |
| `discussion_threads` | id (UUID PK), course_id, title, author_id (FK→users.id), created_at |
| `discussion_replies` | id (UUID PK), thread_id (FK→threads.id), author_id (FK→users.id), body, created_at |

> Note: No `courses` or `modules` ORM table — they stay mock.

### `data/mock.py`
- [ ] Remove: `USERS_DB`, `ASSIGNMENTS`, `ANALYTICS`, `THREADS`, `THREAD_REPLIES`
- [ ] Keep: `COURSES`, `MODULES` (content data, stays hardcoded)

### `data/seed.py` ← NEW FILE
- [ ] Seed 2 default users (student + instructor)
- [ ] Seed sample assignments per user
- [ ] Seed sample discussion threads + replies
- [ ] Run script: `python -m data.seed`

### `routers/auth.py`
- [ ] `register`: check uniqueness against DB, insert user row with hashed password
- [ ] `login`: fetch user by email from DB, verify password

### `routers/assignments.py`
- [ ] `GET /assignments`: query DB filtered by `user_id` (from JWT) + optional `course_id`
- [ ] `GET /assignments/{id}`: single row from DB
- [ ] `POST /assignments/{id}/submit`: create/update submission record (future)

### `routers/analytics.py`
- [ ] Compute `bar_data` and `line_data` dynamically from real assignment rows in DB
- [ ] Aggregate `avg` across all users for the same course/assignment name

### `routers/discussions.py`
- [ ] `GET /discussions`: list threads from DB (with reply count join)
- [ ] `GET /discussions/{id}/replies`: query replies from DB ordered by `created_at`
- [ ] `POST /discussions/{id}/replies`: insert new reply row into DB

### `routers/courses.py`
- [ ] **No change** — returns `COURSES` mock list as-is

### `routers/modules.py`
- [ ] **No change** — returns `MODULES` mock dict as-is

---

## New Dependencies to Add (`requirements.txt`)
```
sqlalchemy[asyncio]==2.0.35
aiomysql==0.2.0
alembic==1.13.3
pydantic-settings==2.5.2
python-dotenv==1.0.1
```

---

## Alembic Setup
```bash
cd backend
alembic init migrations
# Edit alembic.ini: set sqlalchemy.url to env var
# Edit migrations/env.py: import Base from db.base, set target_metadata
alembic revision --autogenerate -m "init_tables"
alembic upgrade head
```

---

## Security Notes
- Never commit `.env` to git
- Use env vars for all secrets in production
- Hash passwords with bcrypt — never store plaintext
- Parameterized queries only (SQLAlchemy ORM protects against SQL injection)
- JWT expiry enforced on every request

---

## Sub-Plans
- [`core/PLAN.md`](core/PLAN.md)
- [`db/PLAN.md`](db/PLAN.md)
- [`models/PLAN.md`](models/PLAN.md)
- [`routers/PLAN.md`](routers/PLAN.md)
- [`data/PLAN.md`](data/PLAN.md)
