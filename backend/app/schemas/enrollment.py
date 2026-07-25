from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EnrollmentCreate(BaseModel):
    group_id: str


class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    group_id: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    student_name: Optional[str] = None
    group_title: Optional[str] = None
