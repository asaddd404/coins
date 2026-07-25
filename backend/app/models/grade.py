import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False)
    title = Column(String(200), nullable=False)
    lesson_date = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    group = relationship('Group')
    grades = relationship('Grade', back_populates='lesson', lazy='select')


class Grade(Base):
    __tablename__ = 'grades'
    __table_args__ = (UniqueConstraint('student_id', 'lesson_id', name='uq_student_lesson_grade'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    lesson_id = Column(String(36), ForeignKey('lessons.id'), nullable=False)
    teacher_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    grade = Column(Integer, nullable=False)
    xp_earned = Column(Integer, nullable=False, default=0)
    is_cancelled = Column(Boolean, default=False)
    cancelled_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    cancelled_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship('User', foreign_keys=[student_id])
    lesson = relationship('Lesson', back_populates='grades')
    teacher = relationship('User', foreign_keys=[teacher_id])
    canceller = relationship('User', foreign_keys=[cancelled_by])


class GradeAuditLog(Base):
    __tablename__ = 'grade_audit_log'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    grade_id = Column(String(36), ForeignKey('grades.id'), nullable=False)
    teacher_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    student_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    lesson_id = Column(String(36), ForeignKey('lessons.id'), nullable=False)
    grade_value = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    grade_record = relationship('Grade', foreign_keys=[grade_id])
    teacher = relationship('User', foreign_keys=[teacher_id])
    student = relationship('User', foreign_keys=[student_id])
    lesson = relationship('Lesson', foreign_keys=[lesson_id])
