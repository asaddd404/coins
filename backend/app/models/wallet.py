import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Wallet(Base):
    __tablename__ = 'wallets'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    coin_balance = Column(Integer, default=0)

    user = relationship('User', back_populates='wallet', foreign_keys=[user_id])
