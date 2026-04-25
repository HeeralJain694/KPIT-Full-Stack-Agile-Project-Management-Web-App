# Agile Project Management Tool

A lightweight web-based Agile Project Management tool designed for small teams to plan, track, and manage work using a simple hierarchy: Project → User Stories → Tasks.

## Live Demo

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, dnd-kit (for Kanban drag & drop).
- **Backend**: Node.js, Express, TypeScript, Zod (Validation), node-cron (Async jobs).
- **Database**: SQLite via Prisma ORM (designed to easily migrate to PostgreSQL).

## Features
- **Authentication**: JWT-based auth with Role-Based Access Control (Admin/Member).
- **Projects & Stories**: Full CRUD for projects and user stories.
- **Kanban Board**: Drag-and-drop task management between "To Do", "In Progress", and "Done".
- **Notifications**: Automatic notifications for task assignment and hourly cron jobs for approaching deadlines.
- **Robust UX**: Loading states, empty states, and toast notifications.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up the database:
Ensure the `.env` file exists with `DATABASE_URL="file:./dev.db"`.
Run Prisma migrations to create the database:
```bash
npx prisma db push
npx prisma generate
```

Start the development server:
```bash
npm run dev
```
The backend will be running on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will be running on `http://localhost:5173`.

---

## Sample API Requests

Here are a few sample `curl` commands to test the API (replace `<TOKEN>` with your actual JWT).

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe", "email":"john@example.com", "password":"password123"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com", "password":"password123"}'
```

**3. Create a Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Website"}'
```

**4. Get Projects:**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <TOKEN>"
```

**5. Get Notifications:**
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <TOKEN>"
```
