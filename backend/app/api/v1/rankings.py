from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.wallet import Wallet
from app.models.course import Group, StudentGroup
from app.schemas.ranking import RankingEntry

router = APIRouter(prefix='/rankings', tags=['Rankings'])


@router.get('/global', response_model=list[RankingEntry])
def global_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wallets = db.query(Wallet, User).join(User, Wallet.user_id == User.id).filter(
        User.role == 'student',
        User.is_active == True
    ).order_by(Wallet.total_xp.desc()).all()

    result = []
    for rank, (wallet, user) in enumerate(wallets, 1):
        result.append(RankingEntry(
            user_id=user.id,
            nickname=user.nickname,
            full_name=user.full_name,
            total_xp=wallet.total_xp,
            rank=rank
        ))
    return result


@router.get('/group/{group_id}', response_model=list[RankingEntry])
def group_ranking(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail='Group not found.')

    if current_user.role == 'student':
        is_member = db.query(StudentGroup).filter(
            StudentGroup.student_id == current_user.id,
            StudentGroup.group_id == group_id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail='You are not a member of this group.')
    elif current_user.role == 'teacher' and group.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not your group.')

    student_groups = db.query(StudentGroup).filter(StudentGroup.group_id == group_id).all()
    student_ids = [sg.student_id for sg in student_groups]

    if not student_ids:
        return []

    wallets = db.query(Wallet, User).join(User, Wallet.user_id == User.id).filter(
        Wallet.user_id.in_(student_ids)
    ).order_by(Wallet.total_xp.desc()).all()

    result = []
    for rank, (wallet, user) in enumerate(wallets, 1):
        result.append(RankingEntry(
            user_id=user.id,
            nickname=user.nickname,
            full_name=user.full_name,
            total_xp=wallet.total_xp,
            rank=rank
        ))
    return result
