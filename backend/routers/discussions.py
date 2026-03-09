import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.lms import DiscussionThread, DiscussionReply, NewReply
from models.orm import DiscussionThread as ThreadORM, DiscussionReply as ReplyORM, User
from core.deps import get_current_user
from db.session import get_db

router = APIRouter()


def _relative_time(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "just now"
    if seconds < 3600:
        return f"{seconds // 60}m ago"
    if seconds < 86400:
        return f"{seconds // 3600}h ago"
    return f"{seconds // 86400}d ago"


@router.get("", response_model=List[DiscussionThread])
async def list_threads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get threads with reply counts
    result = await db.execute(
        select(ThreadORM, func.count(ReplyORM.id).label("reply_count"))
        .outerjoin(ReplyORM, ReplyORM.thread_id == ThreadORM.id)
        .options(selectinload(ThreadORM.author))
        .group_by(ThreadORM.id)
        .order_by(ThreadORM.created_at.desc())
    )
    rows = result.all()

    threads = []
    for thread, reply_count in rows:
        author = thread.author
        initials = "".join(w[0].upper() for w in author.name.split()[:2])
        threads.append(
            DiscussionThread(
                id=thread.id,
                title=thread.title,
                author=author.name,
                initials=initials,
                timestamp=_relative_time(thread.created_at),
                preview=thread.title,
                replies=reply_count,
                unread=False,
            )
        )
    return threads


@router.get("/{thread_id}/replies", response_model=List[DiscussionReply])
async def get_replies(
    thread_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread_result = await db.execute(select(ThreadORM).where(ThreadORM.id == thread_id))
    thread = thread_result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    result = await db.execute(
        select(ReplyORM)
        .options(selectinload(ReplyORM.author))
        .where(ReplyORM.thread_id == thread_id)
        .order_by(ReplyORM.created_at)
    )
    replies = result.scalars().all()

    return [
        DiscussionReply(
            id=r.id,
            author=r.author.name,
            initials="".join(w[0].upper() for w in r.author.name.split()[:2]),
            timestamp=_relative_time(r.created_at),
            body=r.body,
            is_op=(r.author_id == thread.author_id),
        )
        for r in replies
    ]


@router.post("/{thread_id}/replies", response_model=DiscussionReply, status_code=201)
async def post_reply(
    thread_id: str,
    body: NewReply,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread_result = await db.execute(select(ThreadORM).where(ThreadORM.id == thread_id))
    thread = thread_result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    reply = ReplyORM(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        author_id=current_user.id,
        body=body.body,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)

    initials = "".join(w[0].upper() for w in current_user.name.split()[:2])
    return DiscussionReply(
        id=reply.id,
        author=current_user.name,
        initials=initials,
        timestamp="just now",
        body=reply.body,
        is_op=(current_user.id == thread.author_id),
    )


@router.post("", response_model=DiscussionThread, status_code=201)
async def create_thread(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    title = body.get("title", "").strip()
    course_id = body.get("course_id", "ifb220")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    thread = ThreadORM(
        id=str(uuid.uuid4()),
        course_id=course_id,
        title=title,
        author_id=current_user.id,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)

    initials = "".join(w[0].upper() for w in current_user.name.split()[:2])
    return DiscussionThread(
        id=thread.id,
        title=thread.title,
        author=current_user.name,
        initials=initials,
        timestamp="just now",
        preview=thread.title,
        replies=0,
        unread=False,
    )
