from fastapi.testclient import TestClient
from main import app
from seed_data import seed_database
from database import Base, engine

# Ensure DB tables and seed data exist
Base.metadata.create_all(bind=engine)
seed_database()

client = TestClient(app)

print("--- STARTING FASTAPI TESTCLIENT INTEGRATION TEST ---")

# Test 1: Stats
response = client.get("/api/meetings/stats")
assert response.status_code == 200, f"Expected 200, got {response.status_code}"
stats = response.json()
print(f"[TEST 1 PASSED] Stats: Total Meetings={stats['total_meetings']}, Hours={stats['total_duration_hours']}")
assert stats['total_meetings'] > 0

# Test 2: Meetings list
response = client.get("/api/meetings")
assert response.status_code == 200
meetings = response.json()
print(f"[TEST 2 PASSED] Meetings Count: {len(meetings)}")
assert len(meetings) > 0

first_id = meetings[0]['id']

# Test 3: Detail view
response = client.get(f"/api/meetings/{first_id}")
assert response.status_code == 200
detail = response.json()
print(f"[TEST 3 PASSED] Detail Title: '{detail['title']}', Utterances: {len(detail['utterances'])}, ActionItems: {len(detail['action_items'])}")
assert len(detail['utterances']) > 0

# Test 4: Ask AI
response = client.post(f"/api/meetings/{first_id}/ask-ai", json={"question": "What action items were assigned?"})
assert response.status_code == 200
ai_resp = response.json()
print(f"[TEST 4 PASSED] Ask AI Answer Snippet: '{ai_resp['answer'][:120]}...'")

# Test 5: Create Meeting
response = client.post("/api/meetings", json={
    "title": "Automated Test Sprint Alignment",
    "category": "Engineering",
    "participants_str": "Sarah Lin, Alex Rivera",
    "raw_transcript": "Sarah: Let's test the new transcript parser.\nAlex: Parsed successfully!"
})
assert response.status_code == 200
new_m = response.json()
print(f"[TEST 5 PASSED] Created Meeting ID: {new_m['id']}, Title: '{new_m['title']}'")

# Test 6: Action Item lifecycle
response = client.post("/api/action-items", json={
    "meeting_id": new_m['id'],
    "task": "Test task item completion",
    "assignee": "Alex Rivera"
})
assert response.status_code == 200
item = response.json()

response = client.patch(f"/api/action-items/{item['id']}", json={"is_completed": True})
assert response.status_code == 200
updated = response.json()
assert updated['is_completed'] == True
print(f"[TEST 6 PASSED] Action Item '{item['task']}' updated to completed=True!")

# Test 7: Export Markdown
response = client.get(f"/api/meetings/{first_id}/export?format=markdown")
assert response.status_code == 200
assert "# " in response.text
print("[TEST 7 PASSED] Exported transcript to Markdown successfully!")

print("\n=======================================================")
print(" ALL 7 BACKEND INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
print("=======================================================")
