from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User
from app.models.course import Group, StudentGroup, Course
from app.models.wallet import Wallet

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/student")
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    student_groups = db.query(StudentGroup).filter(StudentGroup.student_id == current_user.id).all()
    
    dashboard_data = []
    
    for sg in student_groups:
        group = db.query(Group).filter(Group.id == sg.group_id).first()
        if not group:
            continue
            
        course = db.query(Course).filter(Course.id == group.course_id).first()
        teacher = db.query(User).filter(User.id == group.teacher_id).first()
        
        # Calculate rank in this group
        group_members = db.query(StudentGroup).filter(StudentGroup.group_id == group.id).all()
        member_ids = [m.student_id for m in group_members]
        wallets = db.query(Wallet).filter(Wallet.user_id.in_(member_ids)).order_by(Wallet.total_xp.desc()).all()
        
        rank = 0
        student_xp = 0
        for i, w in enumerate(wallets, 1):
            if w.user_id == current_user.id:
                rank = i
                student_xp = w.total_xp
                break
                
        schedules = [{"day": s.day_of_week, "start": s.start_time, "end": s.end_time} for s in group.schedules]
        
        dashboard_data.append({
            "group_id": group.id,
            "group_title": group.title,
            "course_title": course.title if course else "Unknown",
            "course_id": course.id if course else "",
            "teacher_name": teacher.full_name if teacher else "Unknown",
            "rank": rank,
            "total_xp": student_xp,
            "schedules": schedules
        })
        
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    return {
        "groups": dashboard_data,
        "coin_balance": wallet.coin_balance if wallet else 0,
        "total_xp": wallet.total_xp if wallet else 0
    }
from app.core.security import create_parent_token
from fastapi import Request

@router.get("/student/parent-link")
def get_parent_link(
    request: Request,
    current_user: User = Depends(require_role("student"))
):
    token = create_parent_token(current_user.id)
    # Return a relative link that the frontend will construct the full URL from
    # Or just return the token
    return {"token": token, "link": f"/parent/{token}"}

