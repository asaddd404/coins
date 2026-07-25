from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: Optional[str] = None
    nickname: str
    full_name: str
    role: str
    is_active: bool
    whatsapp_url: Optional[str] = None
    created_at: datetime
    total_xp: Optional[int] = 0
    coin_balance: Optional[int] = 0


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    nickname: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    new_password: str
