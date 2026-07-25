from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class GradeCreate(BaseModel):
    student_id: str
    lesson_id: str
    grade: int = Field(..., ge=3, le=5)


class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    lesson_id: str
    teacher_id: str
    grade: int
    xp_earned: int
    is_cancelled: bool
    created_at: datetime
    student_name: Optional[str] = None
    lesson_title: Optional[str] = None


class GradeAuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    grade_id: str
    teacher_id: str
    student_id: str
    lesson_id: str
    grade_value: int
    action: str
    ip_address: Optional[str] = None
    created_at: datetime
    teacher_name: Optional[str] = None
    student_name: Optional[str] = None


class GradeCancelRequest(BaseModel):
    reason: str


class LessonCreate(BaseModel):
    title: str
    lesson_date: Optional[str] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    lesson_date: Optional[str] = None


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    group_id: str
    title: str
    lesson_date: Optional[str] = None
    created_at: datetime
