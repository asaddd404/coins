import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class EnrollmentRequest(Base):
    __tablename__ = 'enrollment_requests'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False)
    status = Column(String(20), default='pending')
    reviewed_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship('User', foreign_keys=[student_id])
    group = relationship('Group')
    reviewer = relationship('User', foreign_keys=[reviewed_by])
