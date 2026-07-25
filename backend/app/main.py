from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.wallet import Wallet

from app.api.v1 import auth, users, courses, groups, enrollments, lessons, grades, rankings, store, notifications, upload, dashboard

app = FastAPI(title='Acaddem LMS', version='1.0.0')

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=settings.UPLOAD_DIR), name='uploads')

# Include routers
app.include_router(auth.router, prefix='/api/v1')
app.include_router(users.router, prefix='/api/v1')
app.include_router(courses.router, prefix='/api/v1')
app.include_router(groups.router, prefix='/api/v1')
app.include_router(enrollments.router, prefix='/api/v1')
app.include_router(lessons.router, prefix='/api/v1')
app.include_router(grades.router, prefix='/api/v1')
app.include_router(rankings.router, prefix='/api/v1')
app.include_router(store.router, prefix='/api/v1')
app.include_router(notifications.router, prefix='/api/v1')
app.include_router(upload.router, prefix='/api/v1')
app.include_router(dashboard.router, prefix='/api/v1')


@app.on_event('startup')
def on_startup():
    init_db()

    # Create default manager if no users exist
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            admin = User(
                phone='+70000000000',
                nickname='admin',
                full_name='System Administrator',
                password_hash=hash_password('admin123'),
                role='manager'
            )
            db.add(admin)
            db.flush()
            wallet = Wallet(user_id=admin.id)
            db.add(wallet)
            db.commit()
            print('Default admin user created: nickname=admin, password=admin123')
    finally:
        db.close()


@app.get('/')
def root():
    return {'message': 'Acaddem LMS API', 'version': '1.0.0', 'docs': '/docs'}
