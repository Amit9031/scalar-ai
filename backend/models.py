import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="Member")
    created_at = Column(DateTime, default=datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
    category = Column(String, default="General") # Product, Engineering, Sales, 1-on-1, All-Hands
    sentiment = Column(String, default="Positive") # Positive, Mixed, Neutral
    audio_url = Column(String, nullable=True)
    summary_overview = Column(Text, nullable=True)
    status = Column(String, default="processed") # processed, processing
    organizer_name = Column(String, default="Fred (Fireflies Bot)")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    utterances = relationship("Utterance", back_populates="meeting", order_by="Utterance.order_index", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="meeting", order_by="Topic.order_index", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="meeting", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    avatar_color = Column(String, default="#7C3AED")
    role = Column(String, default="Attendee")
    talk_time_percentage = Column(Float, default=0.0)

    meeting = relationship("Meeting", back_populates="participants")

class Utterance(Base):
    __tablename__ = "transcript_utterances"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker_name = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    sentiment = Column(String, default="Neutral")
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="utterances")
    highlights = relationship("Highlight", back_populates="utterance", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    summary = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="topics")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    task = Column(Text, nullable=False)
    assignee = Column(String, default="Unassigned")
    due_date = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    timestamp = Column(Float, nullable=True)

    meeting = relationship("Meeting", back_populates="action_items")

class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    utterance_id = Column(String, ForeignKey("transcript_utterances.id", ondelete="CASCADE"), nullable=True)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    comment_text = Column(Text, nullable=False)
    tag = Column(String, default="Key Moment") # Key Moment, Soundbite, Action Item, Pricing
    created_by = Column(String, default="Fred Assistant")
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="highlights")
    utterance = relationship("Utterance", back_populates="highlights")
