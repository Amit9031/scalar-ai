from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_color: Optional[str] = "#7C3AED"
    role: Optional[str] = "Attendee"
    talk_time_percentage: Optional[float] = 0.0

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class UtteranceBase(BaseModel):
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    sentiment: Optional[str] = "Neutral"
    order_index: int

class UtteranceResponse(UtteranceBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class TopicBase(BaseModel):
    title: str
    start_time: float
    summary: Optional[str] = None
    order_index: int

class TopicResponse(TopicBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    task: str
    assignee: Optional[str] = "Unassigned"
    due_date: Optional[str] = None
    is_completed: Optional[bool] = False
    timestamp: Optional[float] = None

class ActionItemCreate(ActionItemBase):
    meeting_id: str

class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    is_completed: Optional[bool] = None

class ActionItemResponse(ActionItemBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class HighlightBase(BaseModel):
    utterance_id: Optional[str] = None
    start_time: float
    end_time: float
    comment_text: str
    tag: Optional[str] = "Key Moment"
    created_by: Optional[str] = "Fred Assistant"

class HighlightCreate(HighlightBase):
    pass

class HighlightResponse(HighlightBase):
    id: str
    meeting_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingBase(BaseModel):
    title: str
    category: Optional[str] = "General"
    sentiment: Optional[str] = "Positive"
    audio_url: Optional[str] = None
    summary_overview: Optional[str] = None
    organizer_name: Optional[str] = "Fred (Fireflies Bot)"

class MeetingCreate(BaseModel):
    title: str
    category: Optional[str] = "General"
    date: Optional[datetime] = None
    participants_str: Optional[str] = "" # comma-separated names
    raw_transcript: Optional[str] = None # raw text or VTT format to auto-parse

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    organizer_name: Optional[str] = None
    summary_overview: Optional[str] = None

class MeetingListResponse(BaseModel):
    id: str
    title: str
    date: datetime
    duration_seconds: int
    category: str
    sentiment: str
    organizer_name: str
    status: str
    participant_count: int
    action_item_count: int
    participants: List[ParticipantResponse]

    class Config:
        from_attributes = True

class MeetingDetailResponse(BaseModel):
    id: str
    title: str
    date: datetime
    duration_seconds: int
    category: str
    sentiment: str
    audio_url: Optional[str]
    summary_overview: Optional[str]
    status: str
    organizer_name: str
    created_at: datetime
    participants: List[ParticipantResponse]
    utterances: List[UtteranceResponse]
    topics: List[TopicResponse]
    action_items: List[ActionItemResponse]
    highlights: List[HighlightResponse]

    class Config:
        from_attributes = True

class AskAIRequest(BaseModel):
    question: str

class AskAIResponse(BaseModel):
    question: str
    answer: str
    relevant_utterance_ids: List[str] = []
    source_timestamps: List[float] = []

class GlobalStatsResponse(BaseModel):
    total_meetings: int
    total_duration_hours: float
    total_action_items: int
    pending_action_items: int
    top_categories: List[dict]
