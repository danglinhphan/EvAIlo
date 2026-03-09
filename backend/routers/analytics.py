from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.lms import AnalyticsData, AnalyticsBar, AnalyticsLine, Assignment
from models.orm import Assignment as AssignmentORM, User
from core.deps import get_current_user
from db.session import get_db

router = APIRouter()


@router.get("", response_model=AnalyticsData)
async def get_analytics(
    course_id: str = "ifb220",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get this user's graded assignments for the course
    user_result = await db.execute(
        select(AssignmentORM).where(
            AssignmentORM.user_id == current_user.id,
            AssignmentORM.course_id == course_id,
        )
    )
    user_assignments = user_result.scalars().all()

    if not user_assignments:
        raise HTTPException(status_code=404, detail="No assignments found for this course")

    # Compute class average per assignment name
    avg_result = await db.execute(
        select(AssignmentORM.name, func.avg(AssignmentORM.score))
        .where(
            AssignmentORM.course_id == course_id,
            AssignmentORM.status == "graded",
            AssignmentORM.score.isnot(None),
        )
        .group_by(AssignmentORM.name)
    )
    avg_map = {row[0]: round(row[1]) for row in avg_result.fetchall()}

    # bar_data: only graded assignments
    graded = sorted(
        [a for a in user_assignments if a.status == "graded" and a.score is not None],
        key=lambda a: a.due_date or a.id,
    )
    bar_data = [
        AnalyticsBar(
            name=a.name[:12] if len(a.name) > 12 else a.name,
            you=a.score,
            avg=avg_map.get(a.name, a.score),
        )
        for a in graded
    ]

    # line_data: score progression over time
    line_data = [
        AnalyticsLine(week=f"Wk {i + 1}", score=a.score)
        for i, a in enumerate(graded)
    ]

    # All assignments for the table
    all_assignments = [
        Assignment(
            id=a.id,
            name=a.name,
            course_id=a.course_id,
            score=a.score,
            max=a.max_score,
            status=a.status,
            due_date=str(a.due_date) if a.due_date else None,
        )
        for a in sorted(user_assignments, key=lambda x: x.due_date or x.id)
    ]

    return AnalyticsData(bar_data=bar_data, line_data=line_data, assignments=all_assignments)
