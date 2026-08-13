# Meeting Notes & Transcription Platform (Fireflies.ai Clone)

A fullstack meeting-assistant web application replicating the core workflows, interactive transcript experience, AI summaries, and design aesthetic of **Fireflies.ai**.

---

## Technical Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons, HTML5 Audio Sync)
- **Backend**: Python 3.11 with FastAPI, SQLAlchemy ORM, Pydantic validation
- **Database**: SQLite (`fireflies.db`) with normalized schema design
- **Audio & Media**: Synchronized playback seeking with interactive transcript utterances, search match highlighting, speaker talk-time breakdown, and Ask AI Q&A panel.

---

## System Architecture

```
 ┌─────────────────────────────────────────────────────────┐
 │                Next.js 14 Frontend UI                   │
 │ (Meetings Dashboard, Interactive Transcript, Ask AI)    │
 └────────────────────────────┬────────────────────────────┘
                              │ REST API Calls (Axios)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   FastAPI Backend API                   │
 │ (/api/meetings, /api/action-items, /ask-ai, /export)    │
 └────────────────────────────┬────────────────────────────┘
                              │ SQLAlchemy ORM
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   SQLite Database                       │
 │ (Meetings, Utterances, Topics, ActionItems, Highlights) │
 └─────────────────────────────────────────────────────────┘
```

---

## Database Schema Design (SQLite)

The application uses a normalized relational database schema with foreign key constraints and cascade deletions.

```
       +-------------------+
       |       User        |
       +-------------------+
       | id (PK)           |
       | name              |
       | email             |
       +---------+---------+
                 |
                 | 1:N
                 v
       +-------------------+        1:N        +-------------------+
       |      Meeting      |------------------>|    Participant    |
       +-------------------+                   +-------------------+
       | id (PK)           |                   | id (PK)           |
       | title             |                   | meeting_id (FK)   |
       | date              |                   | name              |
       | duration_seconds  |                   | talk_time_pct     |
       | category          |                   +-------------------+
       | sentiment         |
       | summary_overview  |
       +----+----+----+----+
            |    |    |
       1:N  |    |    | 1:N
  +---------+    |    +--------------------+
  |              | 1:N                     |
  v              v                         v
+-------------+ +-----------------------+ +------------------+
|    Topic    | |   Transcript Utterance| |   Action Item    |
+-------------+ +-----------------------+ +------------------+
| id (PK)     | | id (PK)               | | id (PK)          |
| meeting_id  | | meeting_id (FK)       | | meeting_id (FK)  |
| title       | | speaker_name          | | task             |
| start_time  | | start_time, end_time  | | assignee         |
| summary     | | text, sentiment       | | is_completed     |
+-------------+ +-----------+-----------+ +------------------+
                            |
                            | 1:N
                            v
                +-----------------------+
                |       Highlight       |
                +-----------------------+
                | id (PK)               |
                | utterance_id (FK)     |
                | comment_text, tag     |
                +-----------------------+
```

### Table Definitions:
1. `meetings`: Primary record of meeting metadata, audio URL, category (Product, Engineering, Sales, 1-on-1), sentiment, and executive summary overview.
2. `participants`: Speaker attendees for each meeting, avatar colors, roles, and talk-time percentage analytics.
3. `transcript_utterances`: Time-stamped text spoken by attendees with start/end timestamps in seconds, speaker names, and sentiment tags.
4. `topics`: Chapter outlines with clickable timestamp markers.
5. `action_items`: Extracted meeting tasks with assignee, due date, completion status (`is_completed`), and transcript timestamp location.
6. `highlights`: Annotations/comments saved by users or AI on specific transcript lines.

---

## Key Features

1. **Meetings Dashboard**:
   - Stat overview cards (Total meetings, hours transcribed, pending action items, top conversation topic).
   - Category filtering (All, Product, Engineering, Sales, 1-on-1).
   - Instant search by title, participant name, or transcript keyword.
   - Sort by recency, duration, or title.
2. **Interactive Transcript View**:
   - Bidirectional audio playback synchronization: clicking a transcript line jumps audio playback to that exact timestamp; playing audio automatically highlights the current line and scrolls into view!
   - Full-text search with highlighted text matches and navigation controls.
   - Speaker filter dropdown.
3. **AI Summaries & Action Items**:
   - Executive meeting overview card.
   - Clickable key chapters.
   - Action item checklist with interactive check-to-complete, edit, and add new task features.
4. **Ask AI Assistant**:
   - Conversational Q&A sidepanel answering natural language questions about meeting transcripts with direct timestamp citations.
5. **Meeting Management (CRUD)**:
   - Create meetings manually or upload transcript files (`.vtt`, `.txt`, `.json`).
   - Edit meeting metadata (title, category).
   - Delete meetings.
6. **Export Options**:
   - Download complete transcripts and summaries as Markdown (`.md`), Plain Text (`.txt`), or JSON (`.json`).

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-multipart requests jinja2

# Run FastAPI server (runs database seeding automatically on first launch)
python3 main.py
```
The FastAPI backend will start on **`http://localhost:8000`** (Interactive API docs at `http://localhost:8000/docs`).

### 2. Frontend Setup (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
The Next.js frontend will start on **`http://localhost:3000`**.

---

## API Overview

- `GET /api/meetings`: List & filter meetings by search term, category, or sort order.
- `GET /api/meetings/stats`: Get dashboard counter statistics.
- `POST /api/meetings`: Create a new meeting or parse raw transcript text.
- `POST /api/meetings/upload`: Upload transcript file (`.vtt`, `.txt`, `.json`).
- `GET /api/meetings/{id}`: Detailed view (meeting, participants, utterances, topics, action items).
- `PATCH /api/meetings/{id}`: Edit meeting title or category.
- `DELETE /api/meetings/{id}`: Delete a meeting.
- `POST /api/action-items`: Create action item.
- `PATCH /api/action-items/{id}`: Toggle completion status or update task.
- `POST /api/meetings/{id}/ask-ai`: Natural language Q&A about a transcript.
- `GET /api/meetings/{id}/export`: Export transcript in Markdown, TXT, or JSON.
