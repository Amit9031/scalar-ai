from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
import models
import json

router = APIRouter(prefix="/api/meetings", tags=["Export"])

@router.get("/{meeting_id}/export")
def export_meeting(
    meeting_id: str,
    format: str = Query("markdown", description="markdown, txt, json"),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    title_slug = meeting.title.lower().replace(" ", "_").replace(":", "")

    if format == "json":
        data = {
            "title": meeting.title,
            "date": meeting.date.isoformat(),
            "duration_seconds": meeting.duration_seconds,
            "category": meeting.category,
            "summary_overview": meeting.summary_overview,
            "participants": [{"name": p.name, "role": p.role, "talk_time_percentage": p.talk_time_percentage} for p in meeting.participants],
            "topics": [{"title": t.title, "start_time": t.start_time, "summary": t.summary} for t in meeting.topics],
            "action_items": [{"task": a.task, "assignee": a.assignee, "due_date": a.due_date, "is_completed": a.is_completed} for a in meeting.action_items],
            "transcript": [{"speaker": u.speaker_name, "start_time": u.start_time, "end_time": u.end_time, "text": u.text} for u in meeting.utterances]
        }
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={title_slug}_transcript.json"}
        )

    elif format == "txt":
        lines = []
        lines.append(f"MEETING TRANSCRIPT: {meeting.title}")
        lines.append(f"Date: {meeting.date.strftime('%B %d, %Y')}")
        lines.append(f"Duration: {meeting.duration_seconds // 60} minutes")
        lines.append(f"Participants: {', '.join([p.name for p in meeting.participants])}")
        lines.append("=" * 60)
        lines.append("\nEXECUTIVE SUMMARY:")
        lines.append(meeting.summary_overview or "N/A")
        lines.append("\nACTION ITEMS:")
        for a in meeting.action_items:
            lines.append(f"[{'X' if a.is_completed else ' '}] {a.task} (Assigned: {a.assignee})")
        lines.append("\nFULL TRANSCRIPT:")
        for u in meeting.utterances:
            mins = int(u.start_time // 60)
            secs = int(u.start_time % 60)
            lines.append(f"[{mins:02d}:{secs:02d}] {u.speaker_name}: {u.text}")
        
        return Response(
            content="\n".join(lines),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={title_slug}_transcript.txt"}
        )

    else: # Default markdown
        lines = []
        lines.append(f"# {meeting.title}\n")
        lines.append(f"**Date:** {meeting.date.strftime('%B %d, %Y')} | **Duration:** {meeting.duration_seconds // 60}m {meeting.duration_seconds % 60}s | **Category:** {meeting.category}\n")
        lines.append("## Participants")
        for p in meeting.participants:
            lines.append(f"- **{p.name}** ({p.role}) - {p.talk_time_percentage}% talk time")
        lines.append("\n## Executive Summary")
        lines.append(meeting.summary_overview or "No summary available.")
        lines.append("\n## Key Topics & Chapters")
        for t in meeting.topics:
            mins = int(t.start_time // 60)
            secs = int(t.start_time % 60)
            lines.append(f"### `{mins:02d}:{secs:02d}` {t.title}")
            lines.append(f"{t.summary}\n")
        lines.append("## Action Items")
        for a in meeting.action_items:
            lines.append(f"- [{'x' if a.is_completed else ' '}] **{a.task}** *(Assignee: {a.assignee}, Due: {a.due_date or 'N/A'})*")
        lines.append("\n## Full Transcript")
        for u in meeting.utterances:
            mins = int(u.start_time // 60)
            secs = int(u.start_time % 60)
            lines.append(f"**[{mins:02d}:{secs:02d}] {u.speaker_name}:** {u.text}\n")

        return Response(
            content="\n".join(lines),
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={title_slug}_transcript.md"}
        )
