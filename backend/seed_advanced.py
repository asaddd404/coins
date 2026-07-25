import os
import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, init_db
from app.models.user import User
from app.models.course import Course, Group, StudentGroup
from app.models.enrollment import EnrollmentRequest
from app.models.grade import Lesson, Grade, GradeAuditLog
from app.models.store import StoreItem, Purchase
from app.models.wallet import Wallet
from app.core.security import hash_password

db = SessionLocal()

def clear_db():
    print("Clearing database...")
    db.query(Purchase).delete()
    db.query(StoreItem).delete()
    db.query(GradeAuditLog).delete()
    db.query(Grade).delete()
    db.query(Lesson).delete()
    db.query(EnrollmentRequest).delete()
    db.query(StudentGroup).delete()
    db.query(Group).delete()
    db.query(Course).delete()
    db.query(Wallet).delete()
    db.query(User).delete()
    db.commit()

def seed():
    clear_db()
    print("Seeding advanced data...")

    # Managers
    m1 = User(phone="+70000000001", nickname="admin", full_name="Главный Администратор", password_hash=hash_password("admin123"), role="manager")
    m2 = User(phone="+70000000002", nickname="manager1", full_name="Елена Смирнова", password_hash=hash_password("admin123"), role="manager")
    
    # Teachers
    teachers = [
        User(phone=f"+7100000000{i}", nickname=f"teacher{i}", full_name=name, password_hash=hash_password("12345"), role="teacher")
        for i, name in enumerate(["Александр Петров", "Мария Иванова", "Дмитрий Соколов", "Анна Кузнецова"])
    ]
    
    # Students
    students_names = [
        "Иван Смирнов", "Екатерина Волкова", "Михаил Лебедев", "София Козлова", "Даниил Новиков", 
        "Алиса Морозова", "Артем Соколов", "Виктория Попова", "Максим Васильев", "Полина Павлова",
        "Илья Семенов", "Ксения Голубева", "Роман Ильин", "Дарья Киселева", "Кирилл Степанов",
        "Алина Федорова", "Егор Николаев", "Арина Орлова", "Тимофей Андреев", "Валерия Макарова"
    ]
    students = [
        User(phone=f"+790000000{i:02d}", nickname=f"student{i}", full_name=name, password_hash=hash_password("12345"), role="student")
        for i, name in enumerate(students_names)
    ]
    
    db.add_all([m1, m2] + teachers + students)
    db.commit()

    # Wallets for students
    for s in students:
        db.add(Wallet(user_id=s.id, total_xp=0, coin_balance=0))
    db.commit()

    # Courses
    course_data = [
        ("Python для начинающих", "Идеальный старт для тех, кто никогда не программировал. Изучаем основы, циклы, функции и создаем свои первые проекты.", "online", "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=800&auto=format&fit=crop"),
        ("Advanced React & Redux", "Глубокое погружение во фронтенд разработку. Паттерны проектирования, оптимизация рендеринга и стейт менеджмент.", "online", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop"),
        ("Основы UI/UX Дизайна", "Научитесь создавать удобные и красивые интерфейсы в Figma. Теория цвета, типографика и юзабилити.", "offline", "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop"),
        ("FastAPI & Микросервисы", "Разработка быстрых и масштабируемых бэкенд систем на современном стеке Python.", "online", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"),
        ("Машинное обучение базовый курс", "Введение в Data Science: от обработки данных в Pandas до первых нейросетей.", "offline", "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop"),
    ]
    courses = []
    for title, desc, ctype, img in course_data:
        c = Course(title=title, description=desc, course_type=ctype, image_url=img)
        courses.append(c)
    db.add_all(courses)
    db.commit()

    # Groups
    groups = []
    for c in courses:
        for i in range(2): # 2 groups per course
            t = random.choice(teachers)
            g = Group(course_id=c.id, teacher_id=t.id, title=f"Поток {i+1} ({t.full_name.split()[0]})", max_students=random.randint(10, 15))
            groups.append(g)
    db.add_all(groups)
    db.commit()

    # Enrollments
    for s in students:
        # Enroll in 1-3 random groups
        s_groups = random.sample(groups, random.randint(1, 3))
        for g in s_groups:
            if g.current_count < g.max_students:
                g.current_count += 1
                db.add(StudentGroup(student_id=s.id, group_id=g.id, enrolled_at=datetime.utcnow()))
    db.commit()

    # Lessons and Grades
    grade_xp_map = {5: 2, 4: 1, 3: 0}
    for g in groups:
        # Create 3-5 lessons per group
        group_students = [sg.student_id for sg in db.query(StudentGroup).filter_by(group_id=g.id).all()]
        if not group_students:
            continue
            
        for i in range(random.randint(3, 5)):
            past_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            lesson = Lesson(group_id=g.id, title=f"Тема {i+1}: Основы {g.title}", lesson_date=past_date.strftime("%Y-%m-%d"), created_at=past_date)
            db.add(lesson)
            db.flush()

            # Randomly grade some students
            for sid in group_students:
                if random.random() > 0.2: # 80% chance of being graded
                    g_val = random.choice([3, 4, 4, 5, 5, 5]) # Skewed to good grades
                    xp = grade_xp_map[g_val]
                    grade = Grade(student_id=sid, lesson_id=lesson.id, teacher_id=g.teacher_id, grade=g_val, xp_earned=xp, created_at=past_date, updated_at=past_date)
                    db.add(grade)
                    db.flush()
                    
                    # Update Wallet
                    wallet = db.query(Wallet).filter_by(user_id=sid).first()
                    wallet.total_xp += xp
                    wallet.coin_balance += xp
                    
                    # Add Audit Log
                    audit = GradeAuditLog(grade_id=grade.id, teacher_id=g.teacher_id, student_id=sid, lesson_id=lesson.id, grade_value=g_val, action="created", ip_address="127.0.0.1", created_at=past_date)
                    db.add(audit)
    db.commit()

    # Store Items
    store_data = [
        ("Фирменное Худи Acaddem", "Стильное и теплое худи с логотипом платформы. Идеально для долгих сессий кодинга.", 50, 15, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"),
        ("Кружка разработчика", "Кружка, которая сохраняет тепло вашего кофе на протяжении всей отладки.", 10, 30, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"),
        ("Набор стикеров", "Виниловые стикеры для вашего ноутбука с IT мемами.", 5, 100, "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=600&auto=format&fit=crop"),
        ("Ежедневник", "Премиальный блокнот в кожаном переплете для записи гениальных идей.", 20, 25, "https://images.unsplash.com/photo-1531346878377-a541fa4cb512?q=80&w=600&auto=format&fit=crop"),
        ("Рюкзак для ноутбука", "Вместительный и водонепроницаемый рюкзак со специальным отделением для техники.", 100, 5, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop")
    ]
    store_items = []
    for title, desc, price, stock, img in store_data:
        item = StoreItem(title=title, description=desc, price=price, stock=stock, image_url=img)
        store_items.append(item)
    db.add_all(store_items)
    db.commit()

    # Random Purchases
    for s in students:
        wallet = db.query(Wallet).filter_by(user_id=s.id).first()
        if wallet.coin_balance > 15:
            item = random.choice([i for i in store_items if i.price <= wallet.coin_balance and i.stock > 0])
            if item:
                item.stock -= 1
                wallet.coin_balance -= item.price
                status = random.choice(["pending_delivery", "delivered"])
                purchase = Purchase(student_id=s.id, item_id=item.id, price_paid=item.price, status=status)
                db.add(purchase)
    db.commit()

    print("Advanced seeding completed successfully!")

if __name__ == "__main__":
    seed()
