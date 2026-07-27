from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.course import Course, Group, Schedule, StudentGroup
from app.models.enrollment import EnrollmentRequest
from app.models.notification import Notification
from app.schemas.course import GroupCreate, GroupUpdate, GroupResponse, ScheduleSlot
from app.schemas.user import UserResponse
from pydantic import BaseModel

class AddStudentRequest(BaseModel):
    nickname_or_phone: str

router = APIRouter(prefix='/groups', tags=['Groups'])


def _group_to_response(group: Group) -> GroupResponse:
    schedules = [ScheduleSlot(day_of_week=s.day_of_week, start_time=s.start_time, end_time=s.end_time) for s in group.schedules]
    teacher_name = group.teacher.full_name if group.teacher else None
    return GroupResponse(
        id=group.id,
        course_id=group.course_id,
        teacher_id=group.teacher_id,
        title=group.title,
        max_students=group.max_students,
        current_count=group.current_count,
        is_active=group.is_active,
        created_at=group.created_at,
        schedules=schedules,
        teacher_name=teacher_name
    )


@router.get('/', response_model=list[GroupResponse])
def list_groups(
    course_id: Optional[str] = Query(None),
    teacher_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Group).options(joinedload(Group.schedules), joinedload(Group.teacher)).filter(Group.is_active == True)
    if course_id:
        query = query.filter(Group.course_id == course_id)
    if teacher_id:
        query = query.filter(Group.teacher_id == teacher_id)
    if current_user.role == 'teacher':
        query = query.filter(Group.teacher_id == current_user.id)
    groups = query.order_by(Group.created_at.desc()).all()
    # Deduplicate due to joinedload
    seen = set()
    unique_groups = []
    for g in groups:
        if g.id not in seen:
            seen.add(g.id)
            unique_groups.append(g)
    return [_group_to_response(g) for g in unique_groups]


@router.post('/', response_model=GroupResponse, status_code=201)
def create_group(
    data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found.')
    teacher = db.query(User).filter(User.id == data.teacher_id, User.role == 'teacher').first()
    if not teacher:
        raise HTTPException(status_code=404, detail='Teacher not found.')

    group = Group(
        course_id=data.course_id,
        teacher_id=data.teacher_id,
        title=data.title,
        max_students=data.max_students
    )
    db.add(group)
    db.flush()

    for slot in data.schedules:
        schedule = Schedule(
            group_id=group.id,
            day_of_week=slot.day_of_week,
            start_time=slot.start_time,
            end_time=slot.end_time
        )
        db.add(schedule)

    db.commit()
    db.refresh(group)
    return _group_to_response(group)


@router.get('/{group_id}', response_model=GroupResponse)
def get_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(Group).options(joinedload(Group.schedules), joinedload(Group.teacher)).filter(Group.id == group_id, Group.is_active == True).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    if current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied.')
    return _group_to_response(group)


@router.get('/{group_id}/students', response_model=list[UserResponse])
def list_group_students(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    if current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied.')
    if current_user.role == 'student':
        raise HTTPException(status_code=403, detail='Access denied.')

    student_groups = db.query(StudentGroup).filter(StudentGroup.group_id == group_id).all()
    student_ids = [sg.student_id for sg in student_groups]
    if not student_ids:
        return []
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    return students


@router.patch('/{group_id}', response_model=GroupResponse)
def update_group(
    group_id: str,
    data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    group = db.query(Group).options(joinedload(Group.schedules), joinedload(Group.teacher)).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return _group_to_response(group)


@router.delete('/{group_id}')
def delete_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
        
    group.is_active = False
    
    # 1. Notify teacher
    db.add(Notification(
        user_id=group.teacher_id,
        type='system',
        title='Группа закрыта',
        message=f'Ваша группа "{group.title}" была закрыта менеджером.'
    ))
    
    # 2. Reject pending enrollments & notify
    pending_enrollments = db.query(EnrollmentRequest).filter(
        EnrollmentRequest.group_id == group_id,
        EnrollmentRequest.status == 'pending'
    ).all()
    for req in pending_enrollments:
        req.status = 'rejected'
        req.reviewed_by = current_user.id
        db.add(Notification(
            user_id=req.student_id,
            type='enrollment_rejected',
            title='Заявка отклонена',
            message=f'Группа "{group.title}" была закрыта. Ваша заявка отклонена.'
        ))
        
    # 3. Remove enrolled students & notify
    student_groups = db.query(StudentGroup).filter(StudentGroup.group_id == group_id).all()
    for sg in student_groups:
        db.add(Notification(
            user_id=sg.student_id,
            type='system',
            title='Группа закрыта',
            message=f'Группа "{group.title}" закрыта. Ваше обучение в этой группе завершено.'
        ))
        db.delete(sg)
        
    group.current_count = 0
    db.query(Schedule).filter(Schedule.group_id == group_id).delete()
    db.commit()
    return {'detail': 'Group deactivated and all related users notified.'}


@router.post('/{group_id}/students', response_model=UserResponse)
def add_student_to_group(
    group_id: str,
    data: AddStudentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('teacher', 'manager'))
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    if current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied.')
        
    student = db.query(User).filter(
        User.role == 'student',
        (User.nickname == data.nickname_or_phone) | (User.phone == data.nickname_or_phone)
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail='Студент не найден.')
        
    existing = db.query(StudentGroup).filter(StudentGroup.student_id == student.id, StudentGroup.group_id == group_id).first()
    if existing:
        raise HTTPException(status_code=400, detail='Студент уже в группе.')
        
    if group.current_count >= group.max_students:
        raise HTTPException(status_code=409, detail='Нет свободных мест.')
        
    group.current_count += 1
    sg = StudentGroup(student_id=student.id, group_id=group.id)
    db.add(sg)
    db.commit()
    return student


@router.delete('/{group_id}/students/{student_id}')
def remove_student_from_group(
    group_id: str,
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('teacher', 'manager'))
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    if current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied.')
        
    sg = db.query(StudentGroup).filter(StudentGroup.student_id == student_id, StudentGroup.group_id == group_id).first()
    if not sg:
        raise HTTPException(status_code=404, detail='Студент не в этой группе.')
        
    group.current_count = max(0, group.current_count - 1)
    db.delete(sg)
    
    # Notify student
    db.add(Notification(
        user_id=student_id,
        type='system',
        title='Исключение из группы',
        message=f'Вы были исключены из группы "{group.title}".'
    ))
    
    db.commit()
    return {'detail': 'Студент исключен из группы и уведомлен.'}


@router.post('/{group_id}/schedules', response_model=GroupResponse, status_code=201)
def add_schedule(
    group_id: str,
    slot: ScheduleSlot,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    group = db.query(Group).options(joinedload(Group.schedules), joinedload(Group.teacher)).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    schedule = Schedule(
        group_id=group.id,
        day_of_week=slot.day_of_week,
        start_time=slot.start_time,
        end_time=slot.end_time
    )
    db.add(schedule)
    db.commit()
    db.refresh(group)
    return _group_to_response(group)


@router.delete('/{group_id}/schedules/{schedule_id}')
def remove_schedule(
    group_id: str,
    schedule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.group_id == group_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail='Schedule not found.')
    db.delete(schedule)
    db.commit()
    return {'detail': 'Schedule removed.'}
