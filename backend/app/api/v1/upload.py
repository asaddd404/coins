import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.config import settings
from app.core.deps import require_role
from app.models.user import User

router = APIRouter(prefix='/upload', tags=['Upload'])

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_SIZE = 5 * 1024 * 1024  # 5MB


@router.post('')
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role('manager', 'teacher'))
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f'File type {file.content_type} not allowed. Allowed: {ALLOWED_TYPES}')

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail='File too large. Maximum 5MB.')

    ext = file.filename.rsplit('.', 1)[-1] if file.filename and '.' in file.filename else 'jpg'
    filename = f'{uuid.uuid4()}.{ext}'

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)
    with open(filepath, 'wb') as f:
        f.write(contents)

    return {'url': f'/uploads/{filename}'}
