Architecture Overview
System Architecture
Frontend → Backend → Database
Frontend (React): Handles UI and user interactions
Backend (Express): Handles business logic and APIs
Database (SQLite + Prisma): Stores structured data
Data Flow
User interacts with UI
Request sent to backend API
Backend processes request
Data stored/retrieved from database
Response sent back to UI
Hierarchical Model
Project └── User Stories └── Tasks
Async Workflow
Background jobs for notifications/reminders
Cron jobs used for scheduling
Handles retries in case of failure
