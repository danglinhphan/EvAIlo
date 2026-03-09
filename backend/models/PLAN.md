# Backend — `models/` Plan

## Purpose
Two concerns live here:
1. **Pydantic schemas** — request/response validation (existing in `user.py`, `lms.py`)
2. **SQLAlchemy ORM models** — DB table mappings (new in `orm.py`)

---

## Files

### `user.py` ← KEEP AS-IS
Pydantic schemas: `UserRegister`, `UserLogin`, `UserOut`, `TokenResponse`.
No changes needed — schemas match DB columns.

**Checklist**:
- [ ] Verify `UserOut` includes all fields returned from DB (id, name, email, role, avatar)
- [ ] No breaking changes needed

---

### `lms.py` ← MINOR UPDATE
Pydantic schemas for LMS entities.

**Current schemas**: `Course`, `Module`, `ModuleItem`, `Assignment`, `AnalyticsBar`, `AnalyticsLine`, `AnalyticsData`, `DiscussionReply`, `DiscussionThread`, `NewReply`, `TodoItem`, `FeedbackItem`

**Checklist**:
- [ ] `Assignment`: add `submitted_at: Optional[datetime] = None` field
- [ ] `DiscussionThread`: change `timestamp: str` → `created_at: datetime` for DB; keep `timestamp` as computed property or alias
- [ ] `DiscussionReply`: same — add `created_at: datetime`, compute relative `timestamp` in response
- [ ] Add `NewThread` schema for creating new discussion threads
- [ ] Keep `Course`, `Module`, `ModuleItem` unchanged (mock data)

---

### `orm.py` ← NEW FILE
**Task**: SQLAlchemy ORM class definitions for all DB tables.

```python
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Enum, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum("student", "instructor"), nullable=False, default="student")
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    assignments: Mapped[list["Assignment"]] = relationship(back_populates="user")
    threads: Mapped[list["DiscussionThread"]] = relationship(back_populates="author")
    replies: Mapped[list["DiscussionReply"]] = relationship(back_populates="author")

class Assignment(Base):
    __tablename__ = "assignments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    status: Mapped[str] = mapped_column(Enum("graded", "submitted", "missing"), nullable=False)
    due_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="assignments")

class DiscussionThread(Base):
    __tablename__ = "discussion_threads"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    author: Mapped["User"] = relationship(back_populates="threads")
    replies: Mapped[list["DiscussionReply"]] = relationship(back_populates="thread", cascade="all, delete-orphan")

class DiscussionReply(Base):
    __tablename__ = "discussion_replies"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id: Mapped[str] = mapped_column(String(36), ForeignKey("discussion_threads.id"), nullable=False, index=True)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    thread: Mapped["DiscussionThread"] = relationship(back_populates="replies")
    author: Mapped["User"] = relationship(back_populates="replies")
```

**Checklist**:
- [ ] Create `orm.py`
- [ ] Define `User` ORM model
- [ ] Define `Assignment` ORM model
- [ ] Define `DiscussionThread` ORM model
- [ ] Define `DiscussionReply` ORM model
- [ ] Set up relationships between models
- [ ] UUID default generation for all PKs
