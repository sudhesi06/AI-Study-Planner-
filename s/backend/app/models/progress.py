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
