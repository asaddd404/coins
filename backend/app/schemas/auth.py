from typing import Optional
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    phone: Optional[str] = None
    nickname: str
    full_name: str
    password: str


class LoginRequest(BaseModel):
    login: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'


class RefreshRequest(BaseModel):
    refresh_token: str
