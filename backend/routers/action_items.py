from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/action-items", tags=["Action Items"])

@router.post("", response_model=schemas.ActionItemResponse)
def create_action_item(payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == payload.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    action_item = models.ActionItem(
        meeting_id=payload.meeting_id,
        task=payload.task,
        assignee=payload.assignee or "Unassigned",
        due_date=payload.due_date,
        is_completed=payload.is_completed or False,
        timestamp=payload.timestamp
    )
    db.add(action_item)
    db.commit()
    db.refresh(action_item)
    return action_item

@router.patch("/{item_id}", response_model=schemas.ActionItemResponse)
def update_action_item(item_id: str, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    action_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if payload.task is not None:
        action_item.task = payload.task
    if payload.assignee is not None:
        action_item.assignee = payload.assignee
    if payload.due_date is not None:
        action_item.due_date = payload.due_date
    if payload.is_completed is not None:
        action_item.is_completed = payload.is_completed

    db.commit()
    db.refresh(action_item)
    return action_item

@router.delete("/{item_id}")
def delete_action_item(item_id: str, db: Session = Depends(get_db)):
    action_item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(action_item)
    db.commit()
    return {"status": "success", "message": "Action item deleted."}
