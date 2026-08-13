from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
from datetime import datetime
import json
import re

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

@router.get("/stats", response_model=schemas.GlobalStatsResponse)
def get_global_stats(db: Session = Depends(get_db)):
    meetings = db.query(models.Meeting).all()
    total_meetings = len(meetings)
    total_duration_seconds = sum(m.duration_seconds for m in meetings)
    total_duration_hours = round(total_duration_seconds / 3600.0, 1)

    action_items = db.query(models.ActionItem).all()
    total_action_items = len(action_items)
    pending_action_items = sum(1 for a in action_items if not a.is_completed)

    # Top categories
    category_counts = {}
    for m in meetings:
        cat = m.category or "General"
        category_counts[cat] = category_counts.get(cat, 0) + 1

    top_categories = [{"category": k, "count": v} for k, v in category_counts.items()]

    return {
        "total_meetings": total_meetings,
        "total_duration_hours": total_duration_hours,
        "total_action_items": total_action_items,
        "pending_action_items": pending_action_items,
        "top_categories": top_categories
    }

@router.get("", response_model=List[schemas.MeetingListResponse])
def get_meetings(
    search: Optional[str] = Query(None, description="Search by title, participant, or transcript text"),
    category: Optional[str] = Query(None, description="Filter by category"),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    sort_by: Optional[str] = Query("date_desc", description="date_desc, date_asc, duration_desc, title_asc"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)

    # Filter by category
    if category and category != "All":
        query = query.filter(models.Meeting.category == category)

    # Filter by search
    if search:
        search_pattern = f"%{search}%"
        # Search in title, summary, or utterances text
        query = query.outerjoin(models.Meeting.utterances).filter(
            or_(
                models.Meeting.title.ilike(search_pattern),
                models.Meeting.summary_overview.ilike(search_pattern),
                models.Utterance.text.ilike(search_pattern),
                models.Utterance.speaker_name.ilike(search_pattern)
            )
        ).distinct()

    # Filter by participant name
    if participant:
        query = query.join(models.Meeting.participants).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )

    # Sort
    if sort_by == "date_asc":
        query = query.order_by(asc(models.Meeting.date))
    elif sort_by == "duration_desc":
        query = query.order_by(desc(models.Meeting.duration_seconds))
    elif sort_by == "title_asc":
        query = query.order_by(asc(models.Meeting.title))
    else: # default date_desc
        query = query.order_by(desc(models.Meeting.date))

    meetings = query.all()

    response = []
    for m in meetings:
        response.append({
            "id": m.id,
            "title": m.title,
            "date": m.date,
            "duration_seconds": m.duration_seconds,
            "category": m.category,
            "sentiment": m.sentiment,
            "organizer_name": m.organizer_name,
            "status": m.status,
            "participant_count": len(m.participants),
            "action_item_count": len(m.action_items),
            "participants": m.participants
        })

    return response

@router.get("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def get_meeting_detail(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.post("", response_model=schemas.MeetingDetailResponse)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    # Create meeting entity
    meeting_date = payload.date or datetime.utcnow()
    new_meeting = models.Meeting(
        title=payload.title,
        category=payload.category or "General",
        date=meeting_date,
        duration_seconds=180, # default 3 mins for uploaded text
        sentiment="Positive",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        summary_overview=f"Automated meeting summary for '{payload.title}'. The team gathered to review strategy, assign pending tasks, and establish milestones.",
        status="processed",
        organizer_name="Fred (Fireflies Bot)"
    )
    db.add(new_meeting)
    db.flush()

    # Add participants
    participants_list = []
    names = [n.strip() for n in (payload.participants_str or "Fred (Fireflies Bot), Alex Rivera").split(",") if n.strip()]
    colors = ["#8B5CF6", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"]
    for idx, name in enumerate(names):
        p = models.Participant(
            meeting_id=new_meeting.id,
            name=name,
            email=f"{name.lower().replace(' ', '.')}@workspace.com",
            avatar_color=colors[idx % len(colors)],
            role="Host" if idx == 0 else "Attendee",
            talk_time_percentage=round(100.0 / len(names), 1)
        )
        db.add(p)

    # Parse raw transcript text if provided
    utterances = []
    if payload.raw_transcript:
        lines = payload.raw_transcript.strip().split("\n")
        current_time = 0.0
        order = 1
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Simple line parsing "Speaker: text" or timestamp lines
            speaker = "Speaker 1"
            text = line
            if ":" in line and not line.startswith("00:"):
                parts = line.split(":", 1)
                speaker = parts[0].strip()
                text = parts[1].strip()

            if text:
                u = models.Utterance(
                    meeting_id=new_meeting.id,
                    speaker_name=speaker,
                    start_time=round(current_time, 1),
                    end_time=round(current_time + 15.0, 1),
                    text=text,
                    sentiment="Neutral",
                    order_index=order
                )
                db.add(u)
                current_time += 16.0
                order += 1

        new_meeting.duration_seconds = int(current_time)

    # Default utterances if none provided
    if not payload.raw_transcript:
        u1 = models.Utterance(meeting_id=new_meeting.id, speaker_name=names[0], start_time=0.0, end_time=25.0, text=f"Welcome everyone to {payload.title}. Let's review our progress.", sentiment="Positive", order_index=1)
        u2 = models.Utterance(meeting_id=new_meeting.id, speaker_name=names[1] if len(names)>1 else names[0], start_time=26.0, end_time=60.0, text="Everything is moving along smoothly according to schedule.", sentiment="Positive", order_index=2)
        db.add_all([u1, u2])

    # Default topic & action item
    topic1 = models.Topic(meeting_id=new_meeting.id, title="1. Kickoff & Progress Review", start_time=0.0, summary=f"Initial discussion and status check for {payload.title}.", order_index=1)
    db.add(topic1)

    act1 = models.ActionItem(meeting_id=new_meeting.id, task=f"Follow up on action items from {payload.title}", assignee=names[0], due_date="Next Week", is_completed=False, timestamp=10.0)
    db.add(act1)

    db.commit()
    db.refresh(new_meeting)
    return new_meeting

@router.post("/upload", response_model=schemas.MeetingDetailResponse)
async def upload_transcript_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    db: Session = Depends(get_db)
):
    content = await file.read()
    raw_text = content.decode("utf-8", errors="ignore")
    meeting_title = title or file.filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()

    # Delegate to create logic
    payload = schemas.MeetingCreate(
        title=meeting_title,
        category=category,
        raw_transcript=raw_text
    )
    return create_meeting(payload, db)

@router.patch("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def update_meeting(meeting_id: str, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if payload.title is not None:
        meeting.title = payload.title
    if payload.category is not None:
        meeting.category = payload.category
    if payload.date is not None:
        meeting.date = payload.date
    if payload.organizer_name is not None:
        meeting.organizer_name = payload.organizer_name
    if payload.summary_overview is not None:
        meeting.summary_overview = payload.summary_overview

    db.commit()
    db.refresh(meeting)
    return meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return {"status": "success", "message": f"Meeting '{meeting.title}' deleted successfully."}
