# Backend — `routers/` Plan

## Purpose
API route handlers. Post-migration: replace mock data reads with DB queries.

---

## Files

### `auth.py` ← MODIFY
**Current**: Reads/writes to `USERS_DB` in-memory dict.

**Tasks**:
- [ ] Add `AsyncSession` dependency via `Depends(get_db)`
- [ ] `POST /register`:
  - Query DB: `SELECT * FROM users WHERE email = ?` → raise 400 if exists
  - Insert new `User` ORM row with `hash_password(body.password)`
  - Return JWT + `UserOut`
- [ ] `POST /login`:
  - Query DB by email
  - `verify_password(body.password, user.hashed_password)`
  - Return JWT + `UserOut`
- [ ] `POST /logout`: No change (stateless JWT)

---

### `courses.py` ← NO CHANGE
**Current**: Returns `COURSES` mock list.  
**Decision**: Course catalog stays hardcoded mock data — no DB needed.

---

### `modules.py` ← NO CHANGE
**Current**: Returns `MODULES` mock dict by course ID.  
**Decision**: Module content stays hardcoded mock data — no DB needed.

---

### `assignments.py` ← MODIFY
**Current**: Filters `ASSIGNMENTS` in-memory list.

**Tasks**:
- [ ] Add `AsyncSession` + `current_user` dependencies
- [ ] `GET /assignments`:
  - Query: `SELECT * FROM assignments WHERE user_id = current_user.id`
  - Optional filter: `AND course_id = ?` if `course_id` query param provided
  - Return list of `Assignment` Pydantic models
- [ ] `GET /assignments/{id}`:
  - Query: `SELECT * FROM assignments WHERE id = ? AND user_id = current_user.id`
  - Raise 404 if not found
- [ ] `POST /assignments/{id}/submit` (NEW endpoint):
  - Update `status = 'submitted'`, set `submitted_at = now()`
  - Or create a new submission record

---

### `analytics.py` ← MODIFY
**Current**: Returns hardcoded `ANALYTICS` dict + filters `ASSIGNMENTS` list.

**Tasks**:
- [ ] Add `AsyncSession` + `current_user` dependencies
- [ ] `GET /analytics?course_id=...`:
  - Query assignments for current user + course from DB
  - Compute `bar_data`: `[{name, you: score, avg: avg_of_all_users_same_course_assignment}]`
  - Compute `line_data`: group graded assignments by due_date/week, return score over time
  - Average computation: subquery or join across all users for the same course

**Analytics Computation Logic**:
```
bar_data:
  For each graded assignment of this user in this course:
    - name = assignment.name (or shortened)
    - you = assignment.score
    - avg = AVG(score) FROM assignments WHERE course_id = ? AND name = ? AND status = 'graded'

line_data:
  Group user's graded assignments by week/date, ordered by due_date
  - week = format(due_date, "Wk N")
  - score = assignment.score
```

---

### `discussions.py` ← MODIFY
**Current**: Reads from `THREADS`, `THREAD_REPLIES` in-memory dicts. Writes back in-memory.

**Tasks**:
- [ ] Add `AsyncSession` + `current_user` dependencies
- [ ] `GET /discussions`:
  - Query threads from DB, ordered by `created_at DESC`
  - Include reply count (join/subquery on `discussion_replies`)
  - Compute `timestamp` as relative time from `created_at`
  - `unread`: mark as unread if thread `created_at > user_last_seen` (can be simplified: always False for now, implement later)
- [ ] `GET /discussions/{id}/replies`:
  - Query replies where `thread_id = ?`, ordered by `created_at ASC`
  - Include `is_op`: `reply.author_id == thread.author_id`
- [ ] `POST /discussions/{id}/replies`:
  - Insert new `DiscussionReply` row
  - Return the created reply
- [ ] `POST /discussions` (NEW endpoint — optional):
  - Create new `DiscussionThread` row

---

## Shared Pattern for All DB Routers
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
from db.session import get_db
from core.deps import get_current_user

@router.get("", response_model=List[SomeSchema])
async def list_something(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(SomeORMModel).where(...))
    rows = result.scalars().all()
    return rows
```

**Key**: All router functions must be `async def` to use async SQLAlchemy.
