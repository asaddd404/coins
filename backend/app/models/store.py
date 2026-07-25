import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class StoreItem(Base):
    __tablename__ = 'store_items'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Purchase(Base):
    __tablename__ = 'purchases'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    item_id = Column(String(36), ForeignKey('store_items.id'), nullable=False)
    price_paid = Column(Integer, nullable=False)
    status = Column(String(20), default='pending_delivery')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship('User', foreign_keys=[student_id])
    item = relationship('StoreItem')
