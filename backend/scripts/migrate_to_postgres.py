import os
import sys

# Добавляем корневую директорию проекта в sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import user, course, enrollment, grade, store, wallet, notification
from app.core.database import Base
from dotenv import load_dotenv

# Загружаем .env
load_dotenv()

SQLITE_URL = "sqlite:///./acaddem.db"
POSTGRES_URL = os.getenv("DATABASE_URL")

if "[YOUR-PASSWORD]" in POSTGRES_URL:
    print("ОШИБКА: Замените [YOUR-PASSWORD] на ваш пароль в файле backend/.env")
    sys.exit(1)

print(f"Подключение к старой базе (SQLite): {SQLITE_URL}")
sqlite_engine = create_engine(SQLITE_URL)
SqliteSessionLocal = sessionmaker(bind=sqlite_engine)

print(f"Подключение к новой базе (PostgreSQL): {POSTGRES_URL}")
postgres_engine = create_engine(POSTGRES_URL)
PostgresSessionLocal = sessionmaker(bind=postgres_engine)

# Создаем все таблицы в PostgreSQL
print("Создание таблиц в PostgreSQL...")
Base.metadata.create_all(bind=postgres_engine)

# Список всех моделей для миграции в правильном порядке (учитывая связи)
MODELS = [
    user.User,
    course.Course,
    store.StoreItem,
    course.Group,
    course.Schedule,
    course.StudentGroup,
    enrollment.EnrollmentRequest,
    grade.Lesson,
    grade.Grade,
    grade.GradeAuditLog,
    store.Purchase,
    wallet.Wallet,
    notification.Notification
]

old_db = SqliteSessionLocal()
new_db = PostgresSessionLocal()

try:
    print("Начало переноса данных...")
    for model in MODELS:
        print(f"Перенос таблицы {model.__tablename__}...")
        records = old_db.query(model).all()
        if not records:
            continue
            
        # Очищаем таблицу перед вставкой (опционально, если база уже не пустая)
        new_db.query(model).delete()
        
        for record in records:
            # Создаем новую запись, очистив состояние SQLAlchemy (отвязываем от старой сессии)
            new_db.merge(record)
        
        new_db.commit()
        print(f"Успешно перенесено {len(records)} записей.")
        
    print("✅ Миграция успешно завершена!")

except Exception as e:
    new_db.rollback()
    print(f"❌ Ошибка во время миграции: {e}")
finally:
    old_db.close()
    new_db.close()
