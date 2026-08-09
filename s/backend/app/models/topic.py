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
