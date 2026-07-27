from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.course import Course, Group, StudentGroup
from app.models.enrollment import EnrollmentRequest
from app.models.notification import Notification
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter(prefix='/courses', tags=['Courses'])


@router.get('/', response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Course).filter(Course.is_active == True).order_by(Course.created_at.desc()).all()


@router.post('/', response_model=CourseResponse, status_code=201)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    if data.course_type not in ('online', 'offline'):
        raise HTTPException(status_code=400, detail='course_type must be online or offline.')
    course = Course(
        title=data.title,
        description=data.description,
        course_type=data.course_type
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get('/{course_id}', response_model=CourseResponse)
def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found.')
    return course


@router.patch('/{course_id}', response_model=CourseResponse)
def update_course(
    course_id: str,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found.')
    update_data = data.model_dump(exclude_unset=True)
    if 'course_type' in update_data and update_data['course_type'] not in ('online', 'offline'):
        raise HTTPException(status_code=400, detail='course_type must be online or offline.')
    for key, value in update_data.items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course

@router.delete('/{course_id}')
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail='Course not found.')
        
    course.is_active = False
    
    # Cascade to groups
    groups = db.query(Group).filter(Group.course_id == course_id, Group.is_active == True).all()
    for group in groups:
        group.is_active = False
        
        # 1. Notify teacher
        teacher_notif = Notification(
            user_id=group.teacher_id,
            type='system',
            title='Курс закрыт',
            message=f'Курс "{course.title}" и ваша группа "{group.title}" были закрыты менеджером.'
        )
        db.add(teacher_notif)
        
        # 2. Reject pending enrollments & notify
        pending_enrollments = db.query(EnrollmentRequest).filter(
            EnrollmentRequest.group_id == group.id,
            EnrollmentRequest.status == 'pending'
        ).all()
        for req in pending_enrollments:
            req.status = 'rejected'
            req.reviewed_by = current_user.id
            db.add(Notification(
                user_id=req.student_id,
                type='enrollment_rejected',
                title='Заявка отклонена',
                message=f'Курс "{course.title}" был закрыт. Ваша заявка в группу "{group.title}" отклонена.'
            ))
            
        # 3. Remove enrolled students & notify
        student_groups = db.query(StudentGroup).filter(StudentGroup.group_id == group.id).all()
        for sg in student_groups:
            db.add(Notification(
                user_id=sg.student_id,
                type='system',
                title='Курс закрыт',
                message=f'Курс "{course.title}" закрыт. Ваше обучение в группе "{group.title}" завершено.'
            ))
            db.delete(sg)
            
        group.current_count = 0
        
    db.commit()
    return {'detail': 'Course deactivated successfully and all related users notified.'}
