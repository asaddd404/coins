import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = 'courses'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    course_type = Column(String(20), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    groups = relationship('Group', back_populates='course', lazy='select')


class Group(Base):
    __tablename__ = 'groups'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey('courses.id'), nullable=False)
    teacher_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    title = Column(String(200), nullable=False)
    max_students = Column(Integer, nullable=False)
    current_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    course = relationship('Course', back_populates='groups')
    teacher = relationship('User', foreign_keys=[teacher_id])
    schedules = relationship('Schedule', back_populates='group', cascade='all, delete-orphan', lazy='select')
    students = relationship('StudentGroup', back_populates='group', lazy='select')


class Schedule(Base):
    __tablename__ = 'schedules'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False)
    day_of_week = Column(String(3), nullable=False)
    start_time = Column(String(5), nullable=False)
    end_time = Column(String(5), nullable=False)

    group = relationship('Group', back_populates='schedules')


class StudentGroup(Base):
    __tablename__ = 'student_groups'
    __table_args__ = (UniqueConstraint('student_id', 'group_id', name='uq_student_group'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    group_id = Column(String(36), ForeignKey('groups.id'), nullable=False)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship('User', foreign_keys=[student_id])
    group = relationship('Group', back_populates='students')
