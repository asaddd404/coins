import os
import sys
import random
from datetime import datetime, timedelta, timezone
import logging

sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models.user import User
from app.models.course import Course, Group, Schedule, StudentGroup
from app.models.store import StoreItem, Purchase
from app.models.enrollment import EnrollmentRequest
from app.models.grade import Lesson, Grade
from app.models.wallet import Wallet
from app.models.notification import Notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fake Data Sources
FIRST_NAMES = ["Иван", "Алексей", "Дмитрий", "Сергей", "Андрей", "Михаил", "Максим", "Александр", "Владимир", "Евгений", "Антон", "Артем", "Илья", "Кирилл", "Денис", "Анна", "Мария", "Екатерина", "Дарья", "Анастасия", "Виктория", "Елизавета", "Полина", "Ксения", "Александра", "Ольга", "Наталья", "Татьяна", "Юлия", "Алина"]
LAST_NAMES = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров"]

def get_random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def get_random_phone(index):
    return f"+7700{str(index).zfill(7)}"

def seed_db():
    logger.info("Initializing database...")
    init_db()
    db = SessionLocal()
    
    try:
        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)
        
        # 1. Base Users (Admin & Fixed Demo Users)
        logger.info("Creating admin and fixed users...")
        fixed_users = [
            {"nickname": "admin", "full_name": "Администратор", "role": "manager", "phone": "+77001112233"},
            {"nickname": "teacher1", "full_name": "Анна Смирнова", "role": "teacher", "phone": "+77002223344"},
            {"nickname": "student1", "full_name": "Алексей Иванов", "role": "student", "phone": "+77004445566"},
        ]
        
        db_users = {}
        for ud in fixed_users:
            user = User(
                nickname=ud["nickname"],
                full_name=ud["full_name"],
                phone=ud["phone"],
                role=ud["role"],
                password_hash=hash_password("ZaytunaCoin2026!"),
                created_at=thirty_days_ago
            )
            db.add(user)
            db.flush()
            db.add(Wallet(user_id=user.id, total_xp=0, coin_balance=0))
            db_users[ud["nickname"]] = user

        # Generate 4 more teachers
        teachers = [db_users["teacher1"]]
        for i in range(2, 6):
            user = User(
                nickname=f"teacher{i}",
                full_name=get_random_name(),
                phone=get_random_phone(100 + i),
                role="teacher",
                password_hash=hash_password("ZaytunaCoin2026!"),
                created_at=thirty_days_ago
            )
            db.add(user)
            db.flush()
            db.add(Wallet(user_id=user.id, total_xp=0, coin_balance=0))
            teachers.append(user)

        # Generate 60 more students
        students = [db_users["student1"]]
        for i in range(2, 62):
            user = User(
                nickname=f"student{i}",
                full_name=get_random_name(),
                phone=get_random_phone(200 + i),
                role="student",
                password_hash=hash_password("ZaytunaCoin2026!"),
                created_at=thirty_days_ago + timedelta(days=random.randint(0, 5))
            )
            db.add(user)
            db.flush()
            db.add(Wallet(user_id=user.id, total_xp=0, coin_balance=0))
            students.append(user)
        
        db.commit()

        # 2. Courses
        logger.info("Creating courses...")
        courses_data = [
            {"title": "Python Developer", "desc": "Полный курс по Python", "type": "online"},
            {"title": "Frontend (React)", "desc": "HTML, CSS, JS, React", "type": "online"},
            {"title": "Java Enterprise", "desc": "Spring Boot, Hibernate, SQL", "type": "offline"},
            {"title": "Дизайн UI/UX", "desc": "Figma, Adobe XD", "type": "online"},
            {"title": "Data Science", "desc": "Pandas, NumPy, Machine Learning", "type": "online"},
            {"title": "Английский для IT", "desc": "Технический и разговорный", "type": "offline"}
        ]
        
        courses = []
        for cd in courses_data:
            course = Course(title=cd["title"], description=cd["desc"], course_type=cd["type"], created_at=thirty_days_ago)
            db.add(course)
            db.flush()
            courses.append(course)
        db.commit()

        # 3. Groups & Schedules
        logger.info("Creating groups...")
        groups = []
        group_idx = 1
        for course in courses:
            # 2 groups per course
            for _ in range(2):
                if group_idx <= 3:
                    teacher = db_users["teacher1"]
                else:
                    teacher = random.choice(teachers)
                group = Group(
                    course_id=course.id,
                    teacher_id=teacher.id,
                    title=f"{course.title[:4].upper()}-{group_idx} (Поток {random.randint(10, 99)})",
                    max_students=random.randint(12, 20),
                    current_count=0,
                    created_at=thirty_days_ago
                )
                db.add(group)
                db.flush()
                
                # Schedules (2 days a week)
                days = random.sample(["mon", "tue", "wed", "thu", "fri", "sat"], 2)
                for day in days:
                    db.add(Schedule(group_id=group.id, day_of_week=day, start_time="18:00", end_time="20:00"))
                
                groups.append(group)
                group_idx += 1
        db.commit()

        # 4. Enrollments (Assigning students to groups)
        logger.info("Enrolling students...")
        # Give each student 1 to 3 groups
        for student in students:
            num_groups = random.randint(1, 3)
            student_groups = random.sample(groups, num_groups)
            
            for g in student_groups:
                if g.current_count < g.max_students:
                    # 90% approved, 10% pending request
                    if random.random() < 0.9:
                        db.add(StudentGroup(student_id=student.id, group_id=g.id, enrolled_at=thirty_days_ago + timedelta(days=random.randint(2, 10))))
                        g.current_count += 1
                        db.add(EnrollmentRequest(student_id=student.id, group_id=g.id, status="approved", reviewed_by=db_users["admin"].id, created_at=thirty_days_ago))
                    else:
                        db.add(EnrollmentRequest(student_id=student.id, group_id=g.id, status="pending", created_at=now - timedelta(days=random.randint(0, 2))))
        db.commit()

        # 5. Lessons and Grades
        logger.info("Generating 1 month of lessons & grades...")
        for group in groups:
            # Let's say 8 lessons in the past month for each group
            enrolled = db.query(StudentGroup).filter_by(group_id=group.id).all()
            if not enrolled: continue
            
            for i in range(8):
                lesson_date = (thirty_days_ago + timedelta(days=3 * i)).strftime("%Y-%m-%d")
                lesson = Lesson(group_id=group.id, title=f"Урок {i+1}. Тема {random.randint(100, 999)}", lesson_date=lesson_date)
                db.add(lesson)
                db.flush()
                
                # Grade students
                for sg in enrolled:
                    # 80% attendance
                    if random.random() < 0.8:
                        val = random.choices([5, 4, 3], weights=[50, 30, 20])[0]
                        xp = 2 if val == 5 else (1 if val == 4 else 0)
                        
                        grade = Grade(student_id=sg.student_id, lesson_id=lesson.id, teacher_id=group.teacher_id, grade=val, xp_earned=xp, created_at=now)
                        db.add(grade)
                        
                        # Update wallet
                        wallet = db.query(Wallet).filter_by(user_id=sg.student_id).first()
                        wallet.total_xp += xp
                        wallet.coin_balance += xp
                        
                        # Randomly add a notification about grade
                        if random.random() < 0.1:
                            db.add(Notification(user_id=sg.student_id, type="grade", title="Новая оценка", message=f"Вы получили {val} за урок."))
        db.commit()

        # 6. Store Items
        logger.info("Populating store...")
        store_items = [
            {"title": "Худи Acaddem", "desc": "Черное премиальное худи с логотипом", "price": 50, "stock": 10},
            {"title": "Термокружка", "desc": "Удобная термокружка", "price": 20, "stock": 15},
            {"title": "Стикерпак", "desc": "Набор IT стикеров", "price": 5, "stock": 100},
            {"title": "Рюкзак", "desc": "Для ноутбука", "price": 80, "stock": 5},
            {"title": "Кружка", "desc": "Керамическая", "price": 10, "stock": 30},
            {"title": "Футболка", "desc": "Белая футболка с принтом", "price": 30, "stock": 20}
        ]
        items = []
        for sd in store_items:
            item = StoreItem(title=sd["title"], description=sd["desc"], price=sd["price"], stock=sd["stock"], created_at=thirty_days_ago)
            db.add(item)
            db.flush()
            items.append(item)
        db.commit()

        # 7. Purchases
        logger.info("Simulating purchases...")
        for student in students:
            wallet = db.query(Wallet).filter_by(user_id=student.id).first()
            # If student has enough coins, buy something
            if wallet.coin_balance >= 5:
                # Buy 1 to 3 items
                num_purchases = random.randint(1, 3)
                for _ in range(num_purchases):
                    affordable = [i for i in items if i.price <= wallet.coin_balance and i.stock > 0]
                    if affordable:
                        item = random.choice(affordable)
                        # Purchase
                        wallet.coin_balance -= item.price
                        item.stock -= 1
                        
                        status = random.choices(["pending_delivery", "delivered", "cancelled"], weights=[20, 70, 10])[0]
                        purchase_date = now - timedelta(days=random.randint(1, 15))
                        db.add(Purchase(student_id=student.id, item_id=item.id, price_paid=item.price, status=status, created_at=purchase_date))
                        
                        if status == "delivered":
                            db.add(Notification(user_id=student.id, type="purchase", title="Заказ выдан", message=f"Товар {item.title} успешно выдан!"))
        db.commit()

        logger.info("Mega-seed completed! The platform looks like it's been active for a month. 🚀")
        
    except Exception as e:
        logger.error(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
