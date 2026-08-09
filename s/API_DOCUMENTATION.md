# API Documentation

The complete interactive API documentation is available via Swagger UI once the server is running at `/docs`.

## Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login and receive a JWT token.
- `GET /api/auth/me` - Get current user profile.

## Subjects
- `GET /api/subjects` - List all subjects for the user.
- `POST /api/subjects` - Create a new subject.

## Topics
- `GET /api/topics` - List topics.
- `POST /api/topics` - Create a new topic under a subject.

## AI Planner
- `POST /api/planner/generate` - Generate a new AI study plan using Gemini.
- Request Body: `{"date": "YYYY-MM-DD"}`
- `POST /api/planner/replan` - Adapt and re-plan based on missed tasks.

## Tasks & Progress
- `GET /api/tasks/today` - List tasks scheduled for today.
- `PUT /api/tasks/{task_id}/complete` - Mark a task as complete and update progress.

## Quizzes
- `POST /api/quiz/generate` - Generate an AI quiz for a specific topic.
- `POST /api/quiz/{quiz_id}/submit` - Submit answers and calculate score.
