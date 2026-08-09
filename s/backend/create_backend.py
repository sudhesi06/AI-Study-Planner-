import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")

# MODELS
write_file("app/models/subject.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subjects")
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="subject", cascade="all, delete-orphan")
    study_tasks = relationship("StudyTask", back_populates="subject", cascade="all, delete-orphan")
""")

write_file("app/models/topic.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Topic(Base):
    __tablename__ = "topics"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    name = Column(String, nullable=False)
    difficulty = Column(String, default="medium")
    status = Column(String, default="pending")
    weakness_score = Column(Float, default=0.0)
    completion_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject = relationship("Subject", back_populates="topics")
    study_tasks = relationship("StudyTask", back_populates="topic", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="topic", cascade="all, delete-orphan")
""")

write_file("app/models/exam.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    exam_date = Column(DateTime, nullable=False)
    importance = Column(String, default="high")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="exams")
    subject = relationship("Subject", back_populates="exams")
""")

write_file("app/models/study_task.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class StudyTask(Base):
    __tablename__ = "study_tasks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=True)
    task_date = Column(DateTime, nullable=False)
    start_time = Column(String)
    duration_minutes = Column(Integer, nullable=False)
    task_type = Column(String)
    priority = Column(String)
    status = Column(String, default="pending")
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="study_tasks")
    subject = relationship("Subject", back_populates="study_tasks")
    topic = relationship("Topic", back_populates="study_tasks")
""")

write_file("app/models/progress.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Progress(Base):
    __tablename__ = "progress"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=True)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=True)
    study_hours = Column(Float, default=0.0)
    completion_percentage = Column(Float, default=0.0)
    quiz_score = Column(Float, default=0.0)
    weakness_score = Column(Float, default=0.0)
    last_studied_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    topic = relationship("Topic", back_populates="progress")
""")

write_file("app/models/ai_plan.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class AIPlan(Base):
    __tablename__ = "ai_plans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    plan_date = Column(DateTime, nullable=False)
    total_hours = Column(Integer)
    plan_data = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_plans")
""")

write_file("app/models/quiz.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=False)
    difficulty = Column(String)
    question_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer)
    percentage = Column(Float)
    correct_answers = Column(Integer)
    wrong_answers = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="results")
""")

write_file("app/models/notification.py", """
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.base import Base

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
""")

write_file("app/main.py", """
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
""")

print("Backend files generated successfully!")
