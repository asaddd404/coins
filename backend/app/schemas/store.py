from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StoreItemCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    price: int
    stock: int


class StoreItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[int] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None


class StoreItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: int
    stock: int
    is_active: bool
    created_at: datetime


class PurchaseRequest(BaseModel):
    item_id: str


class PurchaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    item_id: str
    price_paid: int
    status: str
    created_at: datetime
    item_title: Optional[str] = None
    student_name: Optional[str] = None
