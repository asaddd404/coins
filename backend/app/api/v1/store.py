from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.store import StoreItem, Purchase
from app.models.wallet import Wallet
from app.models.notification import Notification
from app.schemas.store import (
    StoreItemCreate, StoreItemUpdate, StoreItemResponse,
    PurchaseRequest, PurchaseResponse
)

router = APIRouter(prefix='/store', tags=['Store'])


@router.get('/items', response_model=list[StoreItemResponse])
def list_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StoreItem).filter(StoreItem.is_active == True).order_by(StoreItem.created_at.desc()).all()


@router.post('/items', response_model=StoreItemResponse, status_code=201)
def create_item(
    data: StoreItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    item = StoreItem(
        title=data.title,
        description=data.description,
        image_url=data.image_url,
        price=data.price,
        stock=data.stock
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch('/items/{item_id}', response_model=StoreItemResponse)
def update_item(
    item_id: str,
    data: StoreItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    item = db.query(StoreItem).filter(StoreItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item not found.')
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@router.delete('/items/{item_id}')
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    item = db.query(StoreItem).filter(StoreItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item not found.')
    item.is_active = False
    db.commit()
    return {'detail': 'Item deleted.'}


@router.post('/purchase', response_model=PurchaseResponse, status_code=201)
def purchase_item(
    data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(StoreItem).filter(StoreItem.id == data.item_id, StoreItem.is_active == True).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item not found or inactive.')

    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=400, detail='Wallet not found.')

    if wallet.coin_balance < item.price:
        raise HTTPException(status_code=400, detail='Insufficient coin balance.')

    rows_updated = db.query(StoreItem).filter(
        StoreItem.id == item.id,
        StoreItem.stock > 0
    ).update({StoreItem.stock: StoreItem.stock - 1}, synchronize_session=False)

    if rows_updated == 0:
        raise HTTPException(status_code=409, detail='Item out of stock.')

    # Atomic coin deduction
    wallet_updated = db.query(Wallet).filter(
        Wallet.user_id == current_user.id,
        Wallet.coin_balance >= item.price
    ).update({Wallet.coin_balance: Wallet.coin_balance - item.price}, synchronize_session=False)

    if wallet_updated == 0:
        # Revert stock decrement if wallet deduction failed (e.g., balance changed)
        db.query(StoreItem).filter(StoreItem.id == item.id).update({StoreItem.stock: StoreItem.stock + 1}, synchronize_session=False)
        raise HTTPException(status_code=400, detail='Insufficient coin balance.')

    purchase = Purchase(
        student_id=current_user.id,
        item_id=item.id,
        price_paid=item.price
    )
    db.add(purchase)

    notification = Notification(
        user_id=current_user.id,
        type='purchase',
        title='Purchase Successful',
        message=f'You purchased "{item.title}" for {item.price} coins.'
    )
    db.add(notification)

    db.commit()
    db.refresh(purchase)

    return PurchaseResponse(
        id=purchase.id,
        student_id=purchase.student_id,
        item_id=purchase.item_id,
        price_paid=purchase.price_paid,
        status=purchase.status,
        created_at=purchase.created_at,
        item_title=item.title,
        student_name=current_user.full_name
    )


@router.get('/purchases', response_model=list[PurchaseResponse])
def list_purchases(
    status_filter: Optional[str] = Query(None, alias='status'),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Purchase)
    if current_user.role != 'manager':
        query = query.filter(Purchase.student_id == current_user.id)
    if status_filter:
        query = query.filter(Purchase.status == status_filter)
    purchases = query.order_by(Purchase.created_at.desc()).all()
    result = []
    for p in purchases:
        result.append(PurchaseResponse(
            id=p.id,
            student_id=p.student_id,
            item_id=p.item_id,
            price_paid=p.price_paid,
            status=p.status,
            created_at=p.created_at,
            item_title=p.item.title if p.item else None,
            student_name=p.student.full_name if p.student else None
        ))
    return result


@router.patch('/purchases/{purchase_id}/deliver', response_model=PurchaseResponse)
def deliver_purchase(
    purchase_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail='Purchase not found.')
    if purchase.status == 'delivered':
        raise HTTPException(status_code=400, detail='Already delivered.')
    purchase.status = 'delivered'

    notification = Notification(
        user_id=purchase.student_id,
        type='purchase_delivered',
        title='Purchase Delivered',
        message='Your purchase has been delivered.'
    )
    db.add(notification)

    db.commit()
    db.refresh(purchase)
    return PurchaseResponse(
        id=purchase.id,
        student_id=purchase.student_id,
        item_id=purchase.item_id,
        price_paid=purchase.price_paid,
        status=purchase.status,
        created_at=purchase.created_at,
        item_title=purchase.item.title if purchase.item else None,
        student_name=purchase.student.full_name if purchase.student else None
    )

@router.patch('/purchases/{purchase_id}/cancel', response_model=PurchaseResponse)
def cancel_purchase(
    purchase_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role('manager'))
):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail='Purchase not found.')
    if purchase.status != 'pending_delivery':
        raise HTTPException(status_code=400, detail='Can only cancel pending purchases.')
        
    purchase.status = 'cancelled'
    
    # Refund wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == purchase.student_id).first()
    if wallet:
        wallet.coin_balance += purchase.price_paid
        
    # Restock item
    item = db.query(StoreItem).filter(StoreItem.id == purchase.item_id).first()
    if item:
        item.stock += 1

    notification = Notification(
        user_id=purchase.student_id,
        type='purchase_cancelled',
        title='Заявка отменена',
        message=f'Ваша покупка была отменена. Возвращено {purchase.price_paid} монет.'
    )
    db.add(notification)

    db.commit()
    db.refresh(purchase)
    return PurchaseResponse(
        id=purchase.id,
        student_id=purchase.student_id,
        item_id=purchase.item_id,
        price_paid=purchase.price_paid,
        status=purchase.status,
        created_at=purchase.created_at,
        item_title=purchase.item.title if purchase.item else None,
        student_name=purchase.student.full_name if purchase.student else None
    )
