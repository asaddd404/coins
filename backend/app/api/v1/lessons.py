from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.course import Group
from app.models.grade import Lesson, Grade
from app.schemas.grade import LessonCreate, LessonUpdate, LessonResponse

router = APIRouter(prefix='/groups/{group_id}/lessons', tags=['Lessons'])


def _check_group_access(group_id: str, current_user: User, db: Session) -> Group:
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')
    if current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied.')
    if current_user.role == 'student':
        raise HTTPException(status_code=403, detail='Access denied.')
    return group


@router.get('/', response_model=list[LessonResponse])
def list_lessons(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _check_group_access(group_id, current_user, db)
    return db.query(Lesson).filter(Lesson.group_id == group_id).order_by(Lesson.created_at.desc()).all()


@router.post('/', response_model=LessonResponse, status_code=201)
def create_lesson(
    group_id: str,
    data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _check_group_access(group_id, current_user, db)
    lesson = Lesson(
        group_id=group_id,
        title=data.title,
        lesson_date=data.lesson_date
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get('/{lesson_id}', response_model=LessonResponse)
def get_lesson(
    group_id: str,
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _check_group_access(group_id, current_user, db)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.group_id == group_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found.')
    return lesson


@router.patch('/{lesson_id}', response_model=LessonResponse)
def update_lesson(
    group_id: str,
    lesson_id: str,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _check_group_access(group_id, current_user, db)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.group_id == group_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found.')
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete('/{lesson_id}')
def delete_lesson(
    group_id: str,
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _check_group_access(group_id, current_user, db)
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.group_id == group_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found.')
    grades_count = db.query(Grade).filter(Grade.lesson_id == lesson_id).count()
    if grades_count > 0:
        raise HTTPException(status_code=409, detail='Cannot delete lesson with existing grades.')
    db.delete(lesson)
    db.commit()
    return {'detail': 'Lesson deleted.'}
