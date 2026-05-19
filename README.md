# Scalable Job Board Platform

A full-stack scalable job board platform built with React, TypeScript, Express.js, PostgreSQL, Prisma ORM, and Redis.

The platform supports candidate job applications, employer job management, resume uploads, application tracking, role-based authentication, Redis caching, and advanced job search functionality.

---

## Features

## Candidate Features
- User registration and login
- JWT-based authentication
- Browse jobs and companies
- Smart keyword and location search
- Filter by salary, job type, and remote jobs
- Save jobs for later
- Apply to jobs with PDF resume upload
- View uploaded resumes
- Track application statuses
- Withdraw applications

## Employer Features
- Employer authentication and authorization
- Create and manage company profiles
- Create and edit job postings
- Employer analytics dashboard
- View received applications
- Download candidate resumes
- Review cover letters
- Mark applications as reviewed
- Shortlist or reject candidates

## Platform Features
- Role-based authorization
- Secure protected API routes
- Redis caching support
- Global API rate limiting
- Responsive modern UI
- Advanced filtering and search
- Prisma ORM integration
- PostgreSQL relational database
- Reusable React component architecture

---

## Screenshots

# Screenshots

## Home Page

<img width="1883" height="907" alt="home-page png" src="https://github.com/user-attachments/assets/9f884a8d-e7be-4056-90d9-491fb1323aab" />

---

## Smart Job Search

<img width="1887" height="912" alt="job-search png" src="https://github.com/user-attachments/assets/a888f6bf-def7-46a4-a542-57af805cf35b" />

---

## Jobs Page

<img width="1883" height="915" alt="jobs-page png" src="https://github.com/user-attachments/assets/5475b0af-9389-4428-a509-5845179c0e72" />

---

## Companies Page

<img width="1900" height="785" alt="companies-page png" src="https://github.com/user-attachments/assets/29eccb93-7d7c-4ccc-a6f0-3f3003476d57" />

---

## Candidate Dashboard

<img width="1887" height="921" alt="candidate-dashboard png" src="https://github.com/user-attachments/assets/2143954d-7873-493f-b607-f4d37fc90d96" />

---

## Saved Jobs

<img width="1431" height="467" alt="saved-jobs png" src="https://github.com/user-attachments/assets/dd1bf3a3-0056-40c1-8aeb-e3f514fc9590" />

---

## My Applications

<img width="1257" height="898" alt="my-applications png" src="https://github.com/user-attachments/assets/18648b3d-b692-4fa6-8424-2a16075a639c" />

---

## Employer Stats

<img width="1251" height="382" alt="employer-stats png" src="https://github.com/user-attachments/assets/b4fc4cc2-f21b-432e-bd57-e60ebb7678ac" />

---

## Employer Dashboard

<img width="918" height="928" alt="employer-dashboard png" src="https://github.com/user-attachments/assets/63b0124c-0d4b-454d-b3db-f12c475125f6" />

---

## Applications Received

<img width="1118" height="795" alt="applications-received png" src="https://github.com/user-attachments/assets/f40c9772-d382-414c-badb-668b5bdb0bf8" />

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Multer File Uploads

## Database & Caching
- PostgreSQL
- Redis

## DevOps & Security
- Rate Limiting
- Role-Based Access Control
- Environment Variables
- REST API Architecture

---

# Architecture Overview

```text
Browser / React Frontend
        ↓
Axios HTTP Requests
        ↓
Express.js REST API
        ↓
Prisma ORM
        ↓
PostgreSQL Database

Redis Cache Layer
```
---

## Database Models

- `User` - candidate or employer account with authentication data and role.
- `Company` - employer-managed company profile.
- `Job` - job posting linked to a company.
- `Application` - candidate application with resume, cover letter, and status.
- `SavedJob` - candidate bookmark for jobs they want to revisit.

## API Features

- Register and login with JWT
- Public job browsing
- Job search, filtering, sorting, and pagination
- Public company browsing
- Employer company creation and updates
- Employer job creation and updates
- Candidate application submission with PDF upload
- Candidate saved jobs
- Employer application review and status updates
- Public platform stats for the home page

---

## Project Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- api/           Frontend API helpers
|   |   |-- components/    Shared UI components
|   |   |-- context/       Auth context
|   |   |-- pages/         Route pages
|   |   `-- utils/         Frontend utilities
|   `-- package.json
|-- prisma/
|   |-- schema.prisma      Database schema
|   `-- seed.ts            Demo data
|-- src/
|   |-- config/            Environment and Redis config
|   |-- db/                Prisma client
|   |-- middleware/        API middleware
|   |-- modules/           Feature modules
|   |-- app.ts
|   `-- server.ts
|-- docker-compose.yml
|-- package.json
`-- README.md
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Sclable
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/job_board_db
JWT_SECRET=change-this-local-development-secret
USE_REDIS=false
REDIS_URL=redis://localhost:6379
JOBS_CACHE_TTL_SECONDS=60
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start PostgreSQL

Use your local PostgreSQL instance or Docker Compose:

```bash
docker compose up -d
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Seed demo data

```bash
npm run prisma:seed
```

### 7. Start the backend

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 8. Install frontend dependencies

```bash
cd client
npm install
```

### 9. Start the frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```
---

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | Backend API port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `USE_REDIS` | Enables Redis caching when set to `true` |
| `REDIS_URL` | Redis connection string |
| `JOBS_CACHE_TTL_SECONDS` | Cache duration for job listings |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per rate limit window |

---

## Useful Commands

```bash
# Backend
npm run dev
npm run build
npm run prisma:seed
npx prisma migrate dev

# Frontend
cd client
npm run dev
npm run build
```

---

## Deployment

Deployment details will be added here.

Suggested deployment path:

- Frontend: Vercel, Netlify, or static hosting
- Backend: Render, Railway, Fly.io, or container hosting
- Database: Managed PostgreSQL
- Resume uploads: Cloud storage

---

# Project Goals

This project was designed to simulate a production-style scalable hiring platform with real-world workflows for both candidates and employers.

The architecture focuses on:
- scalability
- modular backend structure
- reusable frontend components
- secure authentication
- efficient database handling
- optimized user experience

---

## Future Improvements

- Docker containerization
- Kubernetes deployment
- AWS deployment support
- Real-time notifications
- Email integration
- Interview scheduling
- AI-powered job recommendations
- Resume parsing
- Admin analytics dashboard
- WebSocket live updates

---
# Author

Prachi Bhavsar

MS Information Technology @ Arizona State University