# Database Schema

The backend uses a PostgreSQL database with the following tables and relationships.

## 1. users
- `id` (String, PK)
- `name`, `email`, `hashed_password`, `department`, `year`
- `daily_study_hours`, `preferred_study_time`

## 2. subjects
- `id` (String, PK)
- `user_id` (FK -> users.id)
- `name`, `description`, `priority`

## 3. topics
- `id` (String, PK)
- `subject_id` (FK -> subjects.id)
- `name`, `difficulty`, `status`, `weakness_score`, `completion_percentage`

## 4. exams
- `id` (String, PK)
- `user_id` (FK -> users.id)
- `subject_id` (FK -> subjects.id)
- `exam_date`, `importance`

## 5. study_tasks
- `id` (String, PK)
- `user_id` (FK -> users.id)
- `subject_id` (FK -> subjects.id)
- `topic_id` (FK -> topics.id)
- `task_date`, `start_time`, `duration_minutes`, `status`

## 6. progress
- `id` (String, PK)
- `user_id` (FK -> users.id)
- `subject_id` (FK -> subjects.id)
- `topic_id` (FK -> topics.id)
- `study_hours`, `completion_percentage`, `quiz_score`, `weakness_score`

## 7. ai_plans
- `id` (String, PK)
- `user_id` (FK -> users.id)
- `plan_date`, `total_hours`, `plan_data` (JSONB)

## 8. quizzes & quiz_results
- Track generated AI quizzes and the user's score/performance.

## 9. notifications
- General system and study reminder notifications.
