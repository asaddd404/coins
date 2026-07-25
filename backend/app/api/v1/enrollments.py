from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.course import Group, StudentGroup
from app.models.enrollment import EnrollmentRequest
from app.models.notification import Notification
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("", response_model=EnrollmentResponse)
def create_enrollment(
    data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    group = db.query(Group).filter(Group.id == data.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    existing = db.query(EnrollmentRequest).filter(
        EnrollmentRequest.student_id == current_user.id,
        EnrollmentRequest.group_id == data.group_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Enrollment request already exists")
        
    req = EnrollmentRequest(
        student_id=current_user.id,
        group_id=data.group_id,
        status="pending"
    )
    db.add(req)
    
    # Notify the teacher
    notif = Notification(
        user_id=group.teacher_id,
        type="new_enrollment",
        title="Новая заявка",
        message=f"Пользователь {current_user.full_name} подал заявку в вашу группу '{group.title}'."
    )
    db.add(notif)

    # Note: we could also notify managers here if needed, but the teacher is the main recipient.
    # We will notify all managers just in case.
    managers = db.query(User).filter(User.role == "manager").all()
    for m in managers:
        db.add(Notification(
            user_id=m.id,
            type="new_enrollment",
            title="Новая заявка (Система)",
            message=f"Ученик {current_user.full_name} хочет вступить в '{group.title}'."
        ))

    db.commit()
    db.refresh(req)
    return req

@router.get("", response_model=List[EnrollmentResponse])
def get_enrollments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(EnrollmentRequest)
    if status:
        query = query.filter(EnrollmentRequest.status == status)
        
    if current_user.role == "student":
        query = query.filter(EnrollmentRequest.student_id == current_user.id)
    elif current_user.role == "teacher":
        query = query.join(Group).filter(Group.teacher_id == current_user.id)
        
    reqs = query.all()
    # Fill student_name and group_title manually since schema expects them
    for req in reqs:
        student = db.query(User).filter(User.id == req.student_id).first()
        group = db.query(Group).filter(Group.id == req.group_id).first()
        req.student_name = student.full_name if student else None
        req.group_title = group.title if group else None
        
    return reqs

@router.patch("/{id}/approve", response_model=EnrollmentResponse)
def approve_enrollment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "manager"))
):
    req = db.query(EnrollmentRequest).filter(EnrollmentRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Enrollment request not found")
        
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    group = db.query(Group).filter(Group.id == req.group_id).first()
    if current_user.role == "teacher" and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not teacher of this group")
        
    # Atomic update for spots using SQLite serialization
    if group.current_count >= group.max_students:
        raise HTTPException(status_code=409, detail="No available spots in this group")
        
    group.current_count += 1
    req.status = "approved"
    req.reviewed_by = current_user.id
    req.reviewed_at = datetime.utcnow()
    
    student_group = StudentGroup(
        student_id=req.student_id,
        group_id=req.group_id
    )
    db.add(student_group)
    
    notif = Notification(
        user_id=req.student_id,
        type="enrollment_approved",
        title="Заявка одобрена",
        message=f"Ваша заявка в группу '{group.title}' была одобрена."
    )
    db.add(notif)
    db.commit()
    db.refresh(req)
    return req

@router.patch("/{id}/reject", response_model=EnrollmentResponse)
def reject_enrollment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "manager"))
):
    req = db.query(EnrollmentRequest).filter(EnrollmentRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Enrollment request not found")
        
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    group = db.query(Group).filter(Group.id == req.group_id).first()
    if current_user.role == "teacher" and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not teacher of this group")
        
    req.status = "rejected"
    req.reviewed_by = current_user.id
    req.reviewed_at = datetime.utcnow()
    
    notif = Notification(
        user_id=req.student_id,
        type="enrollment_rejected",
        title="Заявка отклонена",
        message=f"Ваша заявка в группу '{group.title}' была отклонена."
    )
    db.add(notif)
    db.commit()
    db.refresh(req)
    return req
