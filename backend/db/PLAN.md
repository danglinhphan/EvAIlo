# Backend — `db/` Plan

## Purpose
Database connection, session management, and ORM base.  
This entire folder is **NEW** — does not exist yet.

---

## Files to Create

### `__init__.py`
Empty init file.

---

### `session.py` ← NEW
**Task**: Async SQLAlchemy engine + session factory

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from core.config import settings

DATABASE_URL = (
    f"mysql+aiomysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

**Checklist**:
- [ ] Create file
- [ ] Build connection URL from `settings`
- [ ] Use `pool_pre_ping=True` for robustness
- [ ] Provide `get_db()` async generator for FastAPI `Depends`
- [ ] Set `echo=False` in prod (configurable via settings)

---

### `base.py` ← NEW
**Task**: Declarative base for all ORM models + import all models for Alembic

```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import all ORM models here so Alembic can detect them
from models.orm import User, Assignment, DiscussionThread, DiscussionReply  # noqa: F401
```

**Checklist**:
- [ ] Create file
- [ ] Define `Base`
- [ ] Import all ORM model classes (so Alembic `autogenerate` works)

---

## Schema Design

### `users` table
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) PK | UUID |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) UNIQUE | NOT NULL, index |
| hashed_password | VARCHAR(255) | NOT NULL |
| role | ENUM('student','instructor') | NOT NULL, default 'student' |
| avatar | VARCHAR(500) NULL | |
| created_at | DATETIME | default now() |

### `assignments` table
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK→users.id | NOT NULL |
| course_id | VARCHAR(50) | NOT NULL (matches mock course id) |
| name | VARCHAR(255) | NOT NULL |
| score | INT NULL | NULL if not graded |
| max_score | INT | default 100 |
| status | ENUM('graded','submitted','missing') | NOT NULL |
| due_date | DATE NULL | |
| submitted_at | DATETIME NULL | |

### `discussion_threads` table
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) PK | UUID |
| course_id | VARCHAR(50) | |
| title | VARCHAR(500) | NOT NULL |
| author_id | VARCHAR(36) FK→users.id | NOT NULL |
| created_at | DATETIME | default now() |

### `discussion_replies` table
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) PK | UUID |
| thread_id | VARCHAR(36) FK→threads.id | NOT NULL |
| author_id | VARCHAR(36) FK→users.id | NOT NULL |
| body | TEXT | NOT NULL |
| created_at | DATETIME | default now() |

---

## Alembic Migration Checklist
- [ ] Run `alembic init migrations` in `backend/`
- [ ] Edit `alembic.ini`: set `script_location = migrations`
- [ ] Edit `migrations/env.py`:
  - Import `Base` from `db.base`
  - Set `target_metadata = Base.metadata`
  - Load DB URL from env
- [ ] Generate: `alembic revision --autogenerate -m "init_tables"`
- [ ] Apply: `alembic upgrade head`
