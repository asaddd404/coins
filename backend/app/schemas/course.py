from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ScheduleSlot(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    day_of_week: str
    start_time: str
    end_time: str


class CourseCreate(BaseModel):
    title: str
    description: str
    course_type: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_type: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    course_type: str
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime


class GroupCreate(BaseModel):
    course_id: str
    teacher_id: str
    title: str
    max_students: int
    schedules: List[ScheduleSlot] = []


class GroupUpdate(BaseModel):
    title: Optional[str] = None
    max_students: Optional[int] = None
    is_active: Optional[bool] = None


class GroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    teacher_id: str
    title: str
    max_students: int
    current_count: int
    is_active: bool
    created_at: datetime
    schedules: List[ScheduleSlot] = []
    teacher_name: Optional[str] = None
