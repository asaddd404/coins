from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    message: Optional[str] = None
    is_read: bool
    created_at: datetime


class UnreadCountResponse(BaseModel):
    count: int
