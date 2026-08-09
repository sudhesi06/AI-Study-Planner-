from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.base import Base
from app.database.connection import engine

# Make sure all models are imported before creating tables
from app.models import user, subject, topic, exam, study_task, progress, ai_plan, quiz, notification

app = FastAPI(title="AI Study Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    try:
        # Not using alembic for this simple example, just creating tables directly
        # In production, you would run alembic migrations instead
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database connection error: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Study Planner API"}

# Include routers here later
