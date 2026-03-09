from pydantic import BaseModel
from typing import List, Optional


class Course(BaseModel):
    id: str
    title: str
    subtitle: str
    instructor: str
    colorFrom: str
    colorTo: str


class ModuleItem(BaseModel):
    label: str
    type: str
    badge: str
    is_assignment: bool = False


class Module(BaseModel):
    id: str
    title: str
    week: str
    items: List[ModuleItem]


class Assignment(BaseModel):
    id: str
    name: str
    course_id: str
    score: Optional[int] = None
    max: int
    status: str  # graded | submitted | missing
    due_date: Optional[str] = None


class AnalyticsBar(BaseModel):
    name: str
    you: int
    avg: int


class AnalyticsLine(BaseModel):
    week: str
    score: int


class AnalyticsData(BaseModel):
    bar_data: List[AnalyticsBar]
    line_data: List[AnalyticsLine]
    assignments: List[Assignment]


class DiscussionReply(BaseModel):
    id: str
    author: str
    initials: str
    timestamp: str
    body: str
    is_op: bool = False


class DiscussionThread(BaseModel):
    id: str
    title: str
    author: str
    initials: str
    timestamp: str
    preview: str
    replies: int
    unread: bool = False


class NewReply(BaseModel):
    body: str


class TodoItem(BaseModel):
    id: str
    title: str
    due: str
    course_id: str


class FeedbackItem(BaseModel):
    id: str
    title: str
    grade: str
    max: str
