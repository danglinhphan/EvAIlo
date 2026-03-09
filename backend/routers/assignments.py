from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.lms import Assignment
from models.orm import Assignment as AssignmentORM, User
from core.deps import get_current_user
from db.session import get_db

router = APIRouter()


def _orm_to_schema(a: AssignmentORM) -> Assignment:
    return Assignment(
        id=a.id,
        name=a.name,
        course_id=a.course_id,
        score=a.score,
        max=a.max_score,
        status=a.status,
        due_date=str(a.due_date) if a.due_date else None,
    )


@router.get("", response_model=List[Assignment])
async def list_assignments(
    course_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AssignmentORM).where(AssignmentORM.user_id == current_user.id)
    if course_id:
        stmt = stmt.where(AssignmentORM.course_id == course_id)
    result = await db.execute(stmt)
    return [_orm_to_schema(a) for a in result.scalars().all()]


@router.get("/{assignment_id}", response_model=Assignment)
async def get_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AssignmentORM).where(
            AssignmentORM.id == assignment_id,
            AssignmentORM.user_id == current_user.id,
        )
    )
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return _orm_to_schema(a)


@router.post("/{assignment_id}/submit", response_model=Assignment)
async def submit_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AssignmentORM).where(
            AssignmentORM.id == assignment_id,
            AssignmentORM.user_id == current_user.id,
        )
    )
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if a.status == "graded":
        raise HTTPException(status_code=400, detail="Assignment already graded")
    a.status = "submitted"
    a.submitted_at = datetime.utcnow()
    await db.commit()
    await db.refresh(a)
    return _orm_to_schema(a)
