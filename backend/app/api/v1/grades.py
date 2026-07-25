from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.course import Group
from app.models.grade import Lesson, Grade, GradeAuditLog
from app.models.wallet import Wallet
from app.models.notification import Notification
from app.schemas.grade import GradeCreate, GradeResponse, GradeAuditResponse, GradeCancelRequest

router = APIRouter(prefix='/grades', tags=['Grades'])

XP_MAP = {5: 2, 4: 1, 3: 0}
COIN_MAP = {5: 2, 4: 1, 3: 0}


def _grade_to_response(g: Grade) -> GradeResponse:
    return GradeResponse(
        id=g.id,
        student_id=g.student_id,
        lesson_id=g.lesson_id,
        teacher_id=g.teacher_id,
        grade=g.grade,
        xp_earned=g.xp_earned,
        is_cancelled=g.is_cancelled,
        created_at=g.created_at,
        student_name=g.student.full_name if g.student else None,
        lesson_title=g.lesson.title if g.lesson else None
    )


@router.post('/', response_model=GradeResponse, status_code=201)
def create_or_update_grade(
    data: GradeCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('teacher'))
):
    lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found.')

    group = db.query(Group).filter(Group.id == lesson.group_id).first()
    if not group or group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='You are not the teacher of this group.')

    student = db.query(User).filter(User.id == data.student_id, User.role == 'student').first()
    if not student:
        raise HTTPException(status_code=404, detail='Student not found.')

    xp = XP_MAP.get(data.grade, 0)
    coins = COIN_MAP.get(data.grade, 0)
    client_ip = request.client.host if request.client else None

    existing = db.query(Grade).filter(
        Grade.student_id == data.student_id,
        Grade.lesson_id == data.lesson_id,
        Grade.is_cancelled == False
    ).first()

    wallet = db.query(Wallet).filter(Wallet.user_id == data.student_id).first()
    if not wallet:
        wallet = Wallet(user_id=data.student_id)
        db.add(wallet)
        db.flush()

    if existing:
        old_xp = XP_MAP.get(existing.grade, 0)
        old_coins = COIN_MAP.get(existing.grade, 0)

        audit_old = GradeAuditLog(
            grade_id=existing.id,
            teacher_id=current_user.id,
            student_id=data.student_id,
            lesson_id=data.lesson_id,
            grade_value=existing.grade,
            action='updated',
            ip_address=client_ip
        )
        db.add(audit_old)

        existing.grade = data.grade
        existing.xp_earned = xp
        existing.teacher_id = current_user.id

        wallet.total_xp = wallet.total_xp - old_xp + xp
        wallet.coin_balance = wallet.coin_balance - old_coins + coins

        audit_new = GradeAuditLog(
            grade_id=existing.id,
            teacher_id=current_user.id,
            student_id=data.student_id,
            lesson_id=data.lesson_id,
            grade_value=data.grade,
            action='updated',
            ip_address=client_ip
        )
        db.add(audit_new)

        notification = Notification(
            user_id=data.student_id,
            type='grade_updated',
            title='Grade Updated',
            message=f'Your grade for "{lesson.title}" has been updated to {data.grade}.'
        )
        db.add(notification)

        db.commit()
        db.refresh(existing)
        return _grade_to_response(existing)
    else:
        grade_obj = Grade(
            student_id=data.student_id,
            lesson_id=data.lesson_id,
            teacher_id=current_user.id,
            grade=data.grade,
            xp_earned=xp
        )
        db.add(grade_obj)
        db.flush()

        wallet.total_xp += xp
        wallet.coin_balance += coins

        audit = GradeAuditLog(
            grade_id=grade_obj.id,
            teacher_id=current_user.id,
            student_id=data.student_id,
            lesson_id=data.lesson_id,
            grade_value=data.grade,
            action='created',
            ip_address=client_ip
        )
        db.add(audit)

        notification = Notification(
            user_id=data.student_id,
            type='grade_created',
            title='New Grade',
            message=f'You received a grade of {data.grade} for "{lesson.title}".'
        )
        db.add(notification)

        db.commit()
        db.refresh(grade_obj)
        return _grade_to_response(grade_obj)


@router.get('/my', response_model=list[GradeResponse])
def my_grades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grades = db.query(Grade).filter(
        Grade.student_id == current_user.id,
        Grade.is_cancelled == False
    ).order_by(Grade.created_at.desc()).all()
    return [_grade_to_response(g) for g in grades]


@router.get('/audit', response_model=list[GradeAuditResponse])
def grade_audit(
    teacher_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    query = db.query(GradeAuditLog)
    if teacher_id:
        query = query.filter(GradeAuditLog.teacher_id == teacher_id)
    if student_id:
        query = query.filter(GradeAuditLog.student_id == student_id)
    if date_from:
        try:
            dt_from = datetime.strptime(date_from, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            query = query.filter(GradeAuditLog.created_at >= dt_from)
        except ValueError:
            pass
    if date_to:
        try:
            dt_to = datetime.strptime(date_to, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            query = query.filter(GradeAuditLog.created_at <= dt_to)
        except ValueError:
            pass

    logs = query.order_by(GradeAuditLog.created_at.desc()).all()
    result = []
    for log in logs:
        result.append(GradeAuditResponse(
            id=log.id,
            grade_id=log.grade_id,
            teacher_id=log.teacher_id,
            student_id=log.student_id,
            lesson_id=log.lesson_id,
            grade_value=log.grade_value,
            action=log.action,
            ip_address=log.ip_address,
            created_at=log.created_at,
            teacher_name=log.teacher.full_name if log.teacher else None,
            student_name=log.student.full_name if log.student else None
        ))
    return result


@router.patch('/{grade_id}/cancel', response_model=GradeResponse)
def cancel_grade(
    grade_id: str,
    data: GradeCancelRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail='Grade not found.')
    if grade.is_cancelled:
        raise HTTPException(status_code=400, detail='Grade already cancelled.')

    grade.is_cancelled = True
    grade.cancelled_by = current_user.id
    grade.cancelled_reason = data.reason
    grade.cancelled_at = datetime.now(timezone.utc)

    xp = XP_MAP.get(grade.grade, 0)
    coins = COIN_MAP.get(grade.grade, 0)
    wallet = db.query(Wallet).filter(Wallet.user_id == grade.student_id).first()
    if wallet:
        wallet.total_xp = max(0, wallet.total_xp - xp)
        wallet.coin_balance = max(0, wallet.coin_balance - coins)

    client_ip = request.client.host if request.client else None
    audit = GradeAuditLog(
        grade_id=grade.id,
        teacher_id=current_user.id,
        student_id=grade.student_id,
        lesson_id=grade.lesson_id,
        grade_value=grade.grade,
        action='cancelled',
        ip_address=client_ip
    )
    db.add(audit)

    notification = Notification(
        user_id=grade.student_id,
        type='grade_cancelled',
        title='Grade Cancelled',
        message=f'Your grade has been cancelled. Reason: {data.reason}'
    )
    db.add(notification)

    db.commit()
    db.refresh(grade)
    return _grade_to_response(grade)
