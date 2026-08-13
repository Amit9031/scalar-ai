from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import re

router = APIRouter(prefix="/api/meetings", tags=["Ask AI"])

@router.post("/{meeting_id}/ask-ai", response_model=schemas.AskAIResponse)
def ask_ai_about_meeting(meeting_id: str, payload: schemas.AskAIRequest, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    q = payload.question.lower().strip()
    utterances = meeting.utterances
    action_items = meeting.action_items

    matched_utterances = []
    relevant_ids = []
    source_timestamps = []

    # Search for matching keywords in utterances
    words = [w for w in re.split(r'\W+', q) if len(w) > 2]
    for u in utterances:
        text_lower = u.text.lower()
        speaker_lower = u.speaker_name.lower()
        if any(w in text_lower or w in speaker_lower for w in words):
            matched_utterances.append(u)
            relevant_ids.append(u.id)
            source_timestamps.append(u.start_time)

    # Contextual generator logic
    if "action item" in q or "task" in q or "todo" in q or "assign" in q:
        if action_items:
            items_str = "\n".join([f"- **{a.task}** (Assigned to: {a.assignee}, Due: {a.due_date or 'N/A'}, Completed: {'Yes' if a.is_completed else 'No'})" for a in action_items])
            answer = f"Here are the action items extracted from **{meeting.title}**:\n\n{items_str}"
        else:
            answer = f"No pending action items were found for **{meeting.title}**."

    elif "summary" in q or "overview" in q or "about" in q and len(words) <= 3:
        answer = f"**Executive Overview for {meeting.title}:**\n\n{meeting.summary_overview}\n\nKey topics discussed include:\n" + "\n".join([f"- **{t.title}** (starts at {int(t.start_time//60)}m {int(t.start_time%60)}s)" for t in meeting.topics])

    elif matched_utterances:
        quotes = []
        for u in matched_utterances[:3]:
            mins = int(u.start_time // 60)
            secs = int(u.start_time % 60)
            quotes.append(f"• **{u.speaker_name}** [{mins:02d}:{secs:02d}]: \"{u.text}\"")

        answer = f"Based on the transcript analysis for **{meeting.title}**, here is what was discussed regarding your question:\n\n" + "\n\n".join(quotes)
    else:
        answer = f"I searched the full transcript of **{meeting.title}** for '{payload.question}'. While there wasn't a direct match for those exact words, the meeting covered: {meeting.summary_overview}"

    return {
        "question": payload.question,
        "answer": answer,
        "relevant_utterance_ids": relevant_ids[:5],
        "source_timestamps": source_timestamps[:5]
    }
