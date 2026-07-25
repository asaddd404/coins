import uuid
import re
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), unique=True, nullable=True)
    nickname = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default='student')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    wallet = relationship('Wallet', back_populates='user', uselist=False)

    @property
    def whatsapp_url(self):
        if not self.phone:
            return None
        digits = re.sub(r'\D', '', self.phone)
        return f'https://wa.me/{digits}'

    @property
    def total_xp(self):
        return self.wallet.total_xp if self.wallet else 0

    @property
    def coin_balance(self):
        return self.wallet.coin_balance if self.wallet else 0
