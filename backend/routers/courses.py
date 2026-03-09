from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.lms import Course
from data.mock import COURSES
from core.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[Course])
def list_courses(current_user: dict = Depends(get_current_user)):
    return COURSES


@router.get("/{course_id}", response_model=Course)
def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = next((c for c in COURSES if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
