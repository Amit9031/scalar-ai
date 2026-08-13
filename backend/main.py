from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import engine, Base
from seed_data import seed_database
from routers import meetings, action_items, ai_chat, export

app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Backend services for Fireflies Meeting Notes & Transcription platform clone",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and Seed Data on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    seed_database()

# Include Routers
app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(ai_chat.router)
app.include_router(export.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Fireflies.ai Clone API",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
