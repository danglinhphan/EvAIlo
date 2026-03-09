# Backend — `data/` Plan

## Purpose
- `mock.py` — Currently holds ALL mock data. Post-migration: **retain only** course+module content.
- `seed.py` — NEW: script to populate the DB with realistic initial data for dev.

---

## Files

### `mock.py` ← TRIM DOWN
**Current**: Contains `USERS_DB`, `COURSES`, `MODULES`, `ASSIGNMENTS`, `ANALYTICS`, `THREADS`, `THREAD_REPLIES`

**After migration**:
- Remove: `USERS_DB`, `ASSIGNMENTS`, `ANALYTICS`, `THREADS`, `THREAD_REPLIES`
- Keep: `COURSES`, `MODULES`

**Checklist**:
- [ ] Remove `from core.security import hash_password` import (no longer needed)
- [ ] Remove `USERS_DB` dict
- [ ] Remove `ASSIGNMENTS` list
- [ ] Remove `ANALYTICS` dict
- [ ] Remove `THREADS` list
- [ ] Remove `THREAD_REPLIES` dict
- [ ] Keep `COURSES` list (3 courses: ifb220, iab230, capstone)
- [ ] Keep `MODULES` dict (per-course module content)

---

### `seed.py` ← NEW FILE
**Task**: Populate the MariaDB database with initial dev data.

Seed data to create:
1. **Users** (2):
   - `student@evai.lo` / `password123` (role: student)
   - `dr.willis@evai.lo` / `instructor123` (role: instructor)

2. **Assignments** (8, all belonging to the student user):
   - 5 graded assignments for `ifb220`
   - 1 submitted for `ifb220`
   - 2 missing for `capstone`

3. **Discussion Threads** (4):
   - Mixed authors (student + instructor + seeded fictional users)

4. **Discussion Replies** (2-3 per thread):
   - Include OP replies

**Implementation**:
```python
import asyncio
from db.session import AsyncSessionLocal
from models.orm import User, Assignment, DiscussionThread, DiscussionReply
from core.security import hash_password

async def seed():
    async with AsyncSessionLocal() as session:
        # check if already seeded
        # insert users, assignments, threads, replies
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed())
```

**Checklist**:
- [ ] Create `seed.py`
- [ ] Check if DB already seeded (avoid duplicate runs)
- [ ] Seed 2 users
- [ ] Seed 8 assignments for student user
- [ ] Seed 4 discussion threads
- [ ] Seed replies for each thread
- [ ] Idempotent: skip if data already exists
- [ ] Print summary of seeded records
