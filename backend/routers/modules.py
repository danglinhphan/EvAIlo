from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.lms import Module
from data.mock import MODULES
from core.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[Module])
def get_modules(courseId: str, current_user: dict = Depends(get_current_user)):
    mods = MODULES.get(courseId)
    if mods is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return mods
