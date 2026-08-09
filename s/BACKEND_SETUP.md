# Backend Setup Guide

## Prerequisites
- **Python 3.9+** (Please ensure Python is added to your system PATH)
- **PostgreSQL 14+**

## 1. Configure Environment
1. Navigate to the `backend` directory.
2. Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials.
3. Add your `GEMINI_API_KEY` to the `.env` file.

## 2. Install Dependencies
Run the following commands in your terminal:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Database Migrations
We use SQLAlchemy to define our schemas. To create the tables, run:
```bash
python -c "from app.database.connection import engine; from app.database.base import Base; from app.models import user, subject, topic, exam, study_task, progress, ai_plan, quiz, notification; Base.metadata.create_all(bind=engine)"
```

## 4. Run the API Server
Start the FastAPI application with Uvicorn:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`. You can view the interactive Swagger documentation at `http://127.0.0.1:8000/docs`.
