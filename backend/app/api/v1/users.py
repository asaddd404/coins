from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserResponse, ResetPasswordRequest

router = APIRouter(prefix='/users', tags=['Users'])


@router.get('/', response_model=list[UserResponse])
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) | (User.nickname.ilike(f'%{search}%'))
        )
    return query.order_by(User.created_at.desc()).all()


@router.get('/{user_id}', response_model=UserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    return user


@router.patch('/{user_id}/reset-password')
def reset_password(
    user_id: str,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {'detail': 'Password reset successfully.'}


@router.patch('/{user_id}/deactivate')
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    user.is_active = False
    db.commit()
    return {'detail': 'User deactivated.'}

@router.patch('/{user_id}/activate')
def activate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    user.is_active = True
    db.commit()
    return {'detail': 'User activated.'}

@router.delete('/{user_id}')
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found.')
    # Instead of raw delete, we'll do soft delete or delete depending on relationships.
    # Given the simplicity, we'll just delete the user. (SQLite might throw foreign key constraints if not ON DELETE CASCADE, but let's try direct delete first).
    db.delete(user)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=409, detail='Cannot delete user due to existing relationships (grades, groups). Deactivate them instead.')
    return {'detail': 'User deleted.'}
