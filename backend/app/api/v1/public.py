from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.course import Group, StudentGroup, Course
from app.models.wallet import Wallet
from app.models.grade import Grade, Lesson
from datetime import datetime, timedelta

router = APIRouter(prefix="/public", tags=["Public"])

@router.get("/student/{token}")
def get_public_student_progress(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "parent":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    student_id = payload.get("sub")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    wallet = db.query(Wallet).filter(Wallet.user_id == student.id).first()
    
    # Get last 10 grades
    recent_grades = (
        db.query(Grade, Lesson, User)
        .join(Lesson, Grade.lesson_id == Lesson.id)
        .join(User, Grade.teacher_id == User.id)
        .filter(Grade.student_id == student.id, Grade.is_cancelled == False)
        .order_by(Grade.created_at.desc())
        .limit(10)
        .all()
    )
    
    grades_data = []
    for grade, lesson, teacher in recent_grades:
        group = db.query(Group).filter(Group.id == lesson.group_id).first()
        grades_data.append({
            "id": grade.id,
            "grade": grade.grade,
            "xp_earned": grade.xp_earned,
            "lesson_title": lesson.title,
            "lesson_date": lesson.lesson_date,
            "teacher_name": teacher.full_name,
            "group_title": group.title if group else "Unknown",
            "date": grade.created_at.isoformat()
        })
        
    # Get current groups and teacher info
    student_groups = db.query(StudentGroup).filter(StudentGroup.student_id == student.id).all()
    groups_data = []
    for sg in student_groups:
        group = db.query(Group).filter(Group.id == sg.group_id).first()
        if group:
            course = db.query(Course).filter(Course.id == group.course_id).first()
            teacher = db.query(User).filter(User.id == group.teacher_id).first()
            groups_data.append({
                "title": group.title,
                "course_type": course.course_type if course else "online",
                "teacher": {
                    "full_name": teacher.full_name if teacher else "Unknown",
                    "nickname": teacher.nickname if teacher else "",
                    "whatsapp_url": teacher.whatsapp_url if teacher else None
                }
            })

    # Calculate global rank
    higher_ranked = db.query(Wallet).filter(
        Wallet.total_xp > (wallet.total_xp if wallet else 0)
    ).count()
    global_rank = higher_ranked + 1
            
    return {
        "student": {
            "full_name": student.full_name,
            "nickname": student.nickname,
            "total_xp": wallet.total_xp if wallet else 0,
            "coin_balance": wallet.coin_balance if wallet else 0,
            "global_rank": global_rank
        },
        "recent_grades": grades_data,
        "groups": groups_data
    }
