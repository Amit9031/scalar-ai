from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if DB is already seeded
    if db.query(models.Meeting).first():
        db.close()
        return

    # Seed User
    user = models.User(
        id="user-default-01",
        name="Alex Rivera",
        email="alex.rivera@fireflies.ai",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role="Product Lead"
    )
    db.add(user)

    now = datetime.utcnow()

    # --- MEETING 1: Q3 Product Roadmap & Engineering Alignment ---
    m1 = models.Meeting(
        id="meeting-q3-roadmap",
        title="Q3 Product Roadmap & Engineering Alignment",
        date=now - timedelta(days=1, hours=3),
        duration_seconds=325, # 5m 25s
        category="Product",
        sentiment="Positive",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        summary_overview="The team aligned on the Q3 product deliverables, focusing on the launch of AI Meeting Search, dark mode enhancements, and third-party integrations with Notion and HubSpot. Engineering identified a 2-week bottleneck regarding database migrations which David will lead.",
        status="processed",
        organizer_name="Sarah Lin (VP Product)"
    )
    db.add(m1)

    # Participants
    p1_1 = models.Participant(meeting_id=m1.id, name="Sarah Lin", email="sarah@fireflies.ai", avatar_color="#8B5CF6", role="VP Product", talk_time_percentage=42.0)
    p1_2 = models.Participant(meeting_id=m1.id, name="Alex Rivera", email="alex@fireflies.ai", avatar_color="#EC4899", role="Product Manager", talk_time_percentage=31.0)
    p1_3 = models.Participant(meeting_id=m1.id, name="David Chen", email="david@fireflies.ai", avatar_color="#10B981", role="Lead Engineer", talk_time_percentage=23.0)
    p1_4 = models.Participant(meeting_id=m1.id, name="Fred (Fireflies Bot)", email="fred@fireflies.ai", avatar_color="#6366F1", role="AI Recorder", talk_time_percentage=4.0)
    db.add_all([p1_1, p1_2, p1_3, p1_4])

    # Utterances
    u1_list = [
        models.Utterance(meeting_id=m1.id, speaker_name="Sarah Lin", start_time=0.0, end_time=12.5, text="Good morning everyone! Let's kick off our Q3 Roadmap alignment meeting. Today we want to cover three main priorities: AI Meeting Search, third-party integrations, and performance optimizations.", sentiment="Positive", order_index=1),
        models.Utterance(meeting_id=m1.id, speaker_name="Alex Rivera", start_time=13.0, end_time=35.2, text="Thanks Sarah. On the AI Meeting Search side, user feedback from our beta testers shows a 40% increase in productivity when users can query past transcripts using natural language questions.", sentiment="Positive", order_index=2),
        models.Utterance(meeting_id=m1.id, speaker_name="David Chen", start_time=36.0, end_time=68.4, text="From an engineering standpoint, vector embeddings are indexing well in SQLite and PostgreSQL. However, we need to ensure database migration scripts run smoothly across tenant databases without downtime.", sentiment="Neutral", order_index=3),
        models.Utterance(meeting_id=m1.id, speaker_name="Sarah Lin", start_time=69.0, end_time=95.0, text="Great point David. Can you lead the database migration strategy and prepare a stress test report by next Tuesday?", sentiment="Neutral", order_index=4),
        models.Utterance(meeting_id=m1.id, speaker_name="David Chen", start_time=95.5, end_time=112.0, text="Absolutely. I will schedule a spike with Marcus on Monday and drop the migration plan in Slack by Tuesday afternoon.", sentiment="Positive", order_index=5),
        models.Utterance(meeting_id=m1.id, speaker_name="Alex Rivera", start_time=113.0, end_time=148.0, text="Regarding integrations, HubSpot and Notion export features are almost ready. Alex will complete the frontend modal polish and API connector tests by Thursday.", sentiment="Positive", order_index=6),
        models.Utterance(meeting_id=m1.id, speaker_name="Sarah Lin", start_time=149.0, end_time=195.0, text="Awesome! What about the dark mode theme update? Many enterprise customers requested a high-contrast dark aesthetic that matches Fireflies brand guidelines.", sentiment="Positive", order_index=7),
        models.Utterance(meeting_id=m1.id, speaker_name="Alex Rivera", start_time=196.0, end_time=240.0, text="The design tokens are fully updated! We are using deep slate slate-900 background colors, purple accents (#7C3AED), and crisp typography. It looks super clean and modern.", sentiment="Positive", order_index=8),
        models.Utterance(meeting_id=m1.id, speaker_name="Sarah Lin", start_time=241.0, end_time=325.0, text="Sounds like a solid plan. Let's wrap up here. David handles the DB migration report, Alex finalizes Notion/HubSpot integrations, and I'll update executive management. Thanks team!", sentiment="Positive", order_index=9)
    ]
    db.add_all(u1_list)

    # Topics / Chapters
    t1_list = [
        models.Topic(meeting_id=m1.id, title="1. Kickoff & Q3 Objectives Overview", start_time=0.0, summary="Sarah welcomed the team and outlined the three core deliverables for Q3: AI search, integrations, and UI performance.", order_index=1),
        models.Topic(meeting_id=m1.id, title="2. AI Search & Vector Indexing", start_time=13.0, summary="Alex presented beta feedback showing 40% productivity boosts. David discussed database migration and architecture considerations.", order_index=2),
        models.Topic(meeting_id=m1.id, title="3. Notion & HubSpot Integrations", start_time=113.0, summary="Alex confirmed frontend modal and API connectors are scheduled for completion by Thursday.", order_index=3),
        models.Topic(meeting_id=m1.id, title="4. Dark Mode Aesthetics & Final Action Items", start_time=149.0, summary="The team reviewed Fireflies dark mode visual tokens and assigned owner responsibilities.", order_index=4)
    ]
    db.add_all(t1_list)

    # Action Items
    a1_list = [
        models.ActionItem(meeting_id=m1.id, task="Lead database migration strategy & prepare stress test report", assignee="David Chen", due_date="Next Tuesday", is_completed=False, timestamp=69.0),
        models.ActionItem(meeting_id=m1.id, task="Complete Notion & HubSpot integration frontend modal polish", assignee="Alex Rivera", due_date="Thursday", is_completed=True, timestamp=113.0),
        models.ActionItem(meeting_id=m1.id, task="Update executive management on Q3 delivery timeline", assignee="Sarah Lin", due_date="Friday", is_completed=False, timestamp=241.0)
    ]
    db.add_all(a1_list)

    # Highlights
    h1_list = [
        models.Highlight(meeting_id=m1.id, utterance_id=u1_list[1].id, start_time=13.0, end_time=35.2, comment_text="Great feedback metrics for AI search product showcase", tag="Key Moment", created_by="Sarah Lin"),
        models.Highlight(meeting_id=m1.id, utterance_id=u1_list[4].id, start_time=95.5, end_time=112.0, comment_text="Engineering commitment for DB migration spike", tag="Soundbite", created_by="David Chen")
    ]
    db.add_all(h1_list)


    # --- MEETING 2: Enterprise Client Pitch: Acumen Financials ---
    m2 = models.Meeting(
        id="meeting-acumen-sales",
        title="Enterprise Client Pitch: Acumen Financials",
        date=now - timedelta(days=3, hours=5),
        duration_seconds=410, # 6m 50s
        category="Sales",
        sentiment="Positive",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        summary_overview="Product demo and security compliance pitch with Acumen Financials CTO. Acumen expressed strong interest in Fireflies' SOC2 compliance, automated action item extraction, and custom CRM syncing.",
        status="processed",
        organizer_name="Michael Vance (Account Executive)"
    )
    db.add(m2)

    p2_1 = models.Participant(meeting_id=m2.id, name="Michael Vance", email="michael@fireflies.ai", avatar_color="#F59E0B", role="Account Executive", talk_time_percentage=55.0)
    p2_2 = models.Participant(meeting_id=m2.id, name="Jessica Taylor", email="jtaylor@acumen.com", avatar_color="#3B82F6", role="CTO @ Acumen", talk_time_percentage=38.0)
    p2_3 = models.Participant(meeting_id=m2.id, name="Fred (Fireflies Bot)", email="fred@fireflies.ai", avatar_color="#6366F1", role="AI Recorder", talk_time_percentage=7.0)
    db.add_all([p2_1, p2_2, p2_3])

    u2_list = [
        models.Utterance(meeting_id=m2.id, speaker_name="Michael Vance", start_time=0.0, end_time=25.0, text="Hi Jessica! Thanks for taking the time today. I'm excited to showcase how Fireflies helps financial teams transcribe calls, automatically log action items, and push transcripts directly to Salesforce.", sentiment="Positive", order_index=1),
        models.Utterance(meeting_id=m2.id, speaker_name="Jessica Taylor", start_time=26.0, end_time=60.0, text="Hi Michael. Security and compliance are our top priorities. Can you clarify your encryption standards and whether transcript data is used to train public models?", sentiment="Neutral", order_index=2),
        models.Utterance(meeting_id=m2.id, speaker_name="Michael Vance", start_time=61.0, end_time=110.0, text="Zero data is ever used for public model training. All customer data is encrypted in transit using TLS 1.3 and at rest with AES-256 encryption. We are SOC2 Type II certified and GDPR compliant.", sentiment="Positive", order_index=3),
        models.Utterance(meeting_id=m2.id, speaker_name="Jessica Taylor", start_time=111.0, end_time=150.0, text="That is exactly what our compliance team needs to hear. What about custom field mapping for Salesforce entries?", sentiment="Positive", order_index=4),
        models.Utterance(meeting_id=m2.id, speaker_name="Michael Vance", start_time=151.0, end_time=220.0, text="You can map custom fields, auto-assign leads based on call participants, and trigger automated follow-up emails right after the call ends.", sentiment="Positive", order_index=5),
        models.Utterance(meeting_id=m2.id, speaker_name="Jessica Taylor", start_time=221.0, end_time=410.0, text="Impressive demo. Please send over the MSA draft, SOC2 report, and pricing breakdown for 250 enterprise seats by Friday.", sentiment="Positive", order_index=6)
    ]
    db.add_all(u2_list)

    t2_list = [
        models.Topic(meeting_id=m2.id, title="1. Product Overview & Salesforce Sync", start_time=0.0, summary="Michael introduced Fireflies workflow automation and CRM capabilities.", order_index=1),
        models.Topic(meeting_id=m2.id, title="2. Security, Compliance & Data Isolation", start_time=26.0, summary="Jessica inquired about encryption and data privacy. Michael confirmed SOC2 Type II certification and zero public model training.", order_index=2),
        models.Topic(meeting_id=m2.id, title="3. Enterprise Pricing & Contract Next Steps", start_time=221.0, summary="Jessica requested MSA draft, SOC2 documentation, and enterprise proposal for 250 seats.", order_index=3)
    ]
    db.add_all(t2_list)

    a2_list = [
        models.ActionItem(meeting_id=m2.id, task="Send MSA draft & SOC2 Type II compliance package to Acumen", assignee="Michael Vance", due_date="Friday", is_completed=True, timestamp=221.0),
        models.ActionItem(meeting_id=m2.id, task="Prepare enterprise pricing proposal for 250 seats", assignee="Michael Vance", due_date="Friday", is_completed=False, timestamp=221.0)
    ]
    db.add_all(a2_list)


    # --- MEETING 3: Sprint Retrospective & Architecture Review ---
    m3 = models.Meeting(
        id="meeting-sprint-retro",
        title="Sprint Retrospective & Architecture Review",
        date=now - timedelta(days=5, hours=2),
        duration_seconds=280, # 4m 40s
        category="Engineering",
        sentiment="Mixed",
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        summary_overview="The engineering team discussed high API latencies observed during peak traffic hours last week. Identified database indexing bottlenecks and agreed to migrate heavy WebSocket polling to HTTP SSE streams.",
        status="processed",
        organizer_name="David Chen (Lead Engineer)"
    )
    db.add(m3)

    p3_1 = models.Participant(meeting_id=m3.id, name="David Chen", email="david@fireflies.ai", avatar_color="#10B981", role="Lead Engineer", talk_time_percentage=50.0)
    p3_2 = models.Participant(meeting_id=m3.id, name="Elena Rostova", email="elena@fireflies.ai", avatar_color="#8B5CF6", role="Backend Dev", talk_time_percentage=30.0)
    p3_3 = models.Participant(meeting_id=m3.id, name="Marcus Thorne", email="marcus@fireflies.ai", avatar_color="#EF4444", role="DevOps Lead", talk_time_percentage=20.0)
    db.add_all([p3_1, p3_2, p3_3])

    u3_list = [
        models.Utterance(meeting_id=m3.id, speaker_name="David Chen", start_time=0.0, end_time=30.0, text="Welcome team. In this retro, let's address the spike in latency we saw on Wednesday during peak meeting transcription hours.", sentiment="Neutral", order_index=1),
        models.Utterance(meeting_id=m3.id, speaker_name="Elena Rostova", start_time=31.0, end_time=90.0, text="The primary issue was database locks when writing simultaneous transcript utterances during high-concurrency calls. Adding composite indexes on meeting_id and timestamp dropped query times from 450ms down to 12ms.", sentiment="Positive", order_index=2),
        models.Utterance(meeting_id=m3.id, speaker_name="Marcus Thorne", start_time=91.0, end_time=150.0, text="Also, frontend clients were polling the backend API every 1 second. Switching to Server-Sent Events (SSE) will drastically reduce server load.", sentiment="Positive", order_index=3),
        models.Utterance(meeting_id=m3.id, speaker_name="David Chen", start_time=151.0, end_time=280.0, text="Great work team. Elena, please finalize the composite index migration script today. Marcus will update our Redis cache TTL policies.", sentiment="Positive", order_index=4)
    ]
    db.add_all(u3_list)

    t3_list = [
        models.Topic(meeting_id=m3.id, title="1. Peak Traffic Latency Post-Mortem", start_time=0.0, summary="Reviewed Wednesday's database lock spikes.", order_index=1),
        models.Topic(meeting_id=m3.id, title="2. Database Indexing & SSE Stream Migration", start_time=31.0, summary="Elena & Marcus outlined composite index fixes and SSE streaming upgrades.", order_index=2)
    ]
    db.add_all(t3_list)

    a3_list = [
        models.ActionItem(meeting_id=m3.id, task="Deploy composite database index migration script", assignee="Elena Rostova", due_date="Today", is_completed=True, timestamp=31.0),
        models.ActionItem(meeting_id=m3.id, task="Update Redis cache TTL policies & monitoring alerts", assignee="Marcus Thorne", due_date="Tomorrow", is_completed=False, timestamp=91.0)
    ]
    db.add_all(a3_list)

    db.commit()
    db.close()
    print("Database seeded successfully with initial Fireflies meetings!")

if __name__ == "__main__":
    seed_database()
