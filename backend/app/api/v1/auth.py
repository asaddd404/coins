import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserResponse

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post('/register', status_code=201, dependencies=[rate_limit(max_calls=5, window_seconds=900)])
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if data.phone:
        if not re.match(r'^\+\d{10,15}$', data.phone):
            raise HTTPException(status_code=400, detail='Invalid phone format. Must start with + followed by 10-15 digits.')
        existing_phone = db.query(User).filter(User.phone == data.phone).first()
        if existing_phone:
            raise HTTPException(status_code=409, detail='Phone number already registered.')

    existing_nickname = db.query(User).filter(User.nickname == data.nickname).first()
    if existing_nickname:
        raise HTTPException(status_code=409, detail='Nickname already taken.')

    user = User(
        phone=data.phone,
        nickname=data.nickname,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role='student',
        is_active=False
    )
    db.add(user)
    db.flush()

    wallet = Wallet(user_id=user.id)
    db.add(wallet)
    db.commit()
    db.refresh(user)

    return {'detail': 'Аккаунт создан. Ожидайте активации менеджером.'}


@router.post('/login', response_model=TokenResponse, dependencies=[rate_limit(max_calls=10, window_seconds=900)])
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.phone == data.login) | (User.nickname == data.login)
    ).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials.')

    if not user.is_active:
        raise HTTPException(status_code=403, detail='Ваш аккаунт находится на модерации. Ожидайте подтверждения менеджером.')

    token_data = {'sub': user.id, 'role': user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.post('/refresh', response_model=TokenResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get('type') != 'refresh':
        raise HTTPException(status_code=401, detail='Invalid refresh token.')

    user_id = payload.get('sub')
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail='User not found or inactive.')

    token_data = {'sub': user.id, 'role': user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
