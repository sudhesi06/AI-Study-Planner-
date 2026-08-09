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
