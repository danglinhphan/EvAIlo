"""
Seed the database with initial dev data.
Run: python -m data.seed
"""
import asyncio
import uuid
from datetime import date, datetime

from sqlalchemy import select

from db.session import AsyncSessionLocal
from db.base import Base  # noqa: F401
from db.session import engine
from models.orm import User, Assignment, DiscussionThread, DiscussionReply
from core.security import hash_password


SEED_USERS = [
    {
        "id": "u1-student-evailodev",
        "name": "Dang Linh Phan",
        "email": "student@evai.lo",
        "password": "password123",
        "role": "student",
    },
    {
        "id": "u2-instructor-evailodev",
        "name": "Dr. Sam Willis",
        "email": "dr.willis@evai.lo",
        "password": "instructor123",
        "role": "instructor",
    },
    {
        "id": "u3-alex",
        "name": "Alex Chen",
        "email": "alex.chen@evai.lo",
        "password": "password123",
        "role": "student",
    },
    {
        "id": "u4-priya",
        "name": "Priya Nair",
        "email": "priya.nair@evai.lo",
        "password": "password123",
        "role": "student",
    },
]

SEED_ASSIGNMENTS = [
    # Student (u1) — ifb220
    {"course_id": "ifb220", "name": "Lab 1: SQL Fundamentals", "score": 88, "max_score": 100, "status": "graded", "due_date": date(2026, 2, 10)},
    {"course_id": "ifb220", "name": "Lab 2: Data Pipeline", "score": 92, "max_score": 100, "status": "graded", "due_date": date(2026, 2, 17)},
    {"course_id": "ifb220", "name": "Mid-Semester Exam", "score": 85, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 1)},
    {"course_id": "ifb220", "name": "LLM Literature Review", "score": 95, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 8)},
    {"course_id": "ifb220", "name": "EBM Interpretability Project", "score": 90, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 15)},
    {"course_id": "ifb220", "name": "Assignment 1: ICU Readmission", "score": None, "max_score": 100, "status": "submitted", "due_date": date(2026, 3, 20)},
    {"course_id": "capstone", "name": "K-GRS Algorithm Draft", "score": None, "max_score": 100, "status": "missing", "due_date": date(2026, 3, 12)},
    {"course_id": "capstone", "name": "DTA Frontend Setup", "score": None, "max_score": 100, "status": "missing", "due_date": date(2026, 3, 11)},
    # Alex (u3) — same course, different scores (for avg computation)
]

ALEX_ASSIGNMENTS = [
    {"course_id": "ifb220", "name": "Lab 1: SQL Fundamentals", "score": 74, "max_score": 100, "status": "graded", "due_date": date(2026, 2, 10)},
    {"course_id": "ifb220", "name": "Lab 2: Data Pipeline", "score": 78, "max_score": 100, "status": "graded", "due_date": date(2026, 2, 17)},
    {"course_id": "ifb220", "name": "Mid-Semester Exam", "score": 70, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 1)},
    {"course_id": "ifb220", "name": "LLM Literature Review", "score": 81, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 8)},
    {"course_id": "ifb220", "name": "EBM Interpretability Project", "score": 76, "max_score": 100, "status": "graded", "due_date": date(2026, 3, 15)},
]


async def seed():
    # Ensure tables exist
    async with engine.begin() as conn:
        from db.base import Base
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        existing = await db.execute(select(User).where(User.email == "student@evai.lo"))
        if existing.scalar_one_or_none():
            print("✓ Database already seeded — skipping.")
            return

        print("Seeding users...")
        user_map = {}
        for u in SEED_USERS:
            user = User(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user)
            user_map[u["email"]] = user
        await db.flush()

        print("Seeding assignments (student)...")
        for a in SEED_ASSIGNMENTS:
            assignment = Assignment(
                id=str(uuid.uuid4()),
                user_id="u1-student-evailodev",
                **a,
            )
            db.add(assignment)

        print("Seeding assignments (alex — for class average)...")
        for a in ALEX_ASSIGNMENTS:
            assignment = Assignment(
                id=str(uuid.uuid4()),
                user_id="u3-alex",
                **a,
            )
            db.add(assignment)

        await db.flush()

        print("Seeding discussion threads + replies...")

        threads_data = [
            {
                "id": "t1",
                "course_id": "ifb220",
                "title": "Handling missing values in MIMIC-III",
                "author_id": "u3-alex",
                "created_at": datetime(2026, 3, 10, 8, 0, 0),
            },
            {
                "id": "t2",
                "course_id": "ifb220",
                "title": "TCH-SSM implementation details",
                "author_id": "u4-priya",
                "created_at": datetime(2026, 3, 10, 5, 0, 0),
            },
            {
                "id": "t3",
                "course_id": "ifb220",
                "title": "EBM vs SHAP for clinical interpretability",
                "author_id": "u2-instructor-evailodev",
                "created_at": datetime(2026, 3, 9, 10, 0, 0),
            },
            {
                "id": "t4",
                "course_id": "capstone",
                "title": "Vercel deployment — env vars for Next.js API routes",
                "author_id": "u1-student-evailodev",
                "created_at": datetime(2026, 3, 8, 14, 0, 0),
            },
        ]

        replies_data = [
            {
                "id": "r1",
                "thread_id": "t1",
                "author_id": "u3-alex",
                "body": "I've been using median imputation for numeric vitals and mode for categorical features. MICE worked better but was too slow on the full MIMIC dataset.",
                "created_at": datetime(2026, 3, 10, 8, 0, 0),
            },
            {
                "id": "r2",
                "thread_id": "t1",
                "author_id": "u2-instructor-evailodev",
                "body": "Forward-fill (last observation carried forward) is the clinical standard for time-series gaps. Worth checking the MIMIC-Extract pipeline — it handles this automatically.",
                "created_at": datetime(2026, 3, 10, 9, 0, 0),
            },
            {
                "id": "r3",
                "thread_id": "t3",
                "author_id": "u1-student-evailodev",
                "body": "From my testing, SHAP values are more interpretable for individual predictions, but EBMs give better global explanations for clinical audits.",
                "created_at": datetime(2026, 3, 9, 11, 0, 0),
            },
        ]

        for t in threads_data:
            thread = DiscussionThread(**t)
            db.add(thread)

        await db.flush()

        for r in replies_data:
            reply = DiscussionReply(**r)
            db.add(reply)

        await db.commit()
        print("✓ Seed complete!")
        print(f"  Users: {len(SEED_USERS)}")
        print(f"  Assignments: {len(SEED_ASSIGNMENTS) + len(ALEX_ASSIGNMENTS)}")
        print(f"  Threads: {len(threads_data)}, Replies: {len(replies_data)}")


if __name__ == "__main__":
    asyncio.run(seed())
