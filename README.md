# Scalable Job Board Platform

A full-stack job board platform built with a TypeScript Express backend, PostgreSQL, Prisma, Redis, and a React Vite frontend.

The application supports public job browsing, employer job creation, candidate applications, JWT authentication, role-based authorization, Redis caching, global rate limiting, and seeded demo data.

## Overview

This project models a scalable job board where:

- Employers can register, log in, create company profiles, and create job posts under those companies.
- Candidates can register, log in, browse jobs, apply for jobs, and view their applications.
- Public users can browse jobs, companies, and users.
- The backend protects write operations with JWT authentication and role checks.
- Redis improves read performance for job listing requests.

## Live Architecture Explanation

```text
Browser / React Client
  |
  | Axios HTTP requests
  v
Express API Server
  |
  | Prisma ORM
  v
PostgreSQL Database

Express API Server
  |
  | Redis client
  v
Redis Cache
```

The frontend lives in `client/` and talks to the backend at `http://localhost:5000`. The backend exposes REST endpoints, validates requests with Zod, stores data through Prisma, caches job list responses in Redis, and enforces authentication and authorization with JWT middleware.

## Backend Features

- Express REST API with TypeScript
- PostgreSQL database with Prisma ORM
- JWT register/login authentication
- bcrypt password hashing
- Role-based authorization for `EMPLOYER` and `CANDIDATE`
- Zod validation for request bodies and query params
- Job search, filtering, pagination, and sorting
- Redis caching for `GET /api/jobs`
- Cache invalidation after job creation
- Global rate limiting with `express-rate-limit`
- Morgan request logging
- Response time logging
- Centralized environment configuration
- Docker Compose for PostgreSQL and Redis
- Rerunnable Prisma seed script

## Frontend Features

- React + TypeScript + Vite
- Tailwind CSS styling
- React Router pages
- Axios API calls
- Public job list and job details pages
- Title, location, and job type filters
- Pagination controls
- Login and register forms
- Auth context with localStorage persistence
- Protected routes
- Candidate application modal
- Candidate My Applications page
- Employer Dashboard with company profile and job creation forms
- Role-aware navbar links
- Loading, success, and error states

## Tech Stack

```text
Frontend:       React, TypeScript, Vite, Tailwind CSS, Axios, React Router
Backend:        Node.js, Express, TypeScript
Database:       PostgreSQL
ORM:            Prisma
Cache:          Redis
Auth:           JWT, bcrypt
Validation:     Zod
Logging:        Morgan
Rate limiting:  express-rate-limit
Infra:          Docker Compose
```

## Project Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- api/                 Frontend Axios API helpers
|   |   |-- components/          Reusable UI components
|   |   |-- context/             Auth context
|   |   |-- pages/               React Router pages
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- README.md
|   `-- package.json
|-- prisma/
|   |-- migrations/              Prisma migrations
|   |-- schema.prisma            Database schema
|   `-- seed.ts                  Demo seed data
|-- src/
|   |-- config/                  Env and Redis config
|   |-- db/                      Prisma client
|   |-- middleware/              Rate limit and response time middleware
|   |-- modules/
|   |   |-- applications/
|   |   |-- auth/
|   |   |-- companies/
|   |   |-- jobs/
|   |   `-- users/
|   |-- app.ts
|   `-- server.ts
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Environment Variables

Create `.env` in the project root:

```powershell
@"
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/job_board_db
JWT_SECRET=change-this-local-development-secret
REDIS_URL=redis://localhost:6379
JOBS_CACHE_TTL_SECONDS=60
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@ | Set-Content .env
```

Use a strong `JWT_SECRET` outside local development.

## Setup Instructions

Start PostgreSQL and Redis:

```powershell
docker compose up -d
```

Install backend dependencies:

```powershell
npm install
```

Run database migrations:

```powershell
npx prisma migrate dev
```

Seed demo data:

```powershell
npm run prisma:seed
```

Start the backend:

```powershell
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd client
npm install
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

Backend base URL:

```text
http://localhost:5000
```

## Seeded Accounts

All seeded users use:

```text
password123
```

Employer accounts:

```text
employer.acme@example.com
employer.northstar@example.com
```

Candidate accounts:

```text
candidate.jane@example.com
candidate.miguel@example.com
candidate.aisha@example.com
```

## API Endpoints

```text
GET  /health

POST /api/auth/register
POST /api/auth/login

POST /api/users
GET  /api/users

POST /api/companies         EMPLOYER token required
GET  /api/companies         Public

POST /api/jobs              EMPLOYER token required
GET  /api/jobs/employer/my-jobs
GET  /api/jobs              Public, Redis cached
GET  /api/jobs/:id          Public

POST /api/applications      CANDIDATE token required
GET  /api/applications
GET  /api/applications/user/:userId
```

## Authentication And Authorization

Register and login return a JWT token and safe user object.

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Jane Candidate",
    "email": "candidate.jane@example.com",
    "role": "CANDIDATE"
  }
}
```

Protected requests use:

```text
Authorization: Bearer JWT_TOKEN
```

Authorization rules:

- `EMPLOYER` users can create jobs.
- `EMPLOYER` users can create companies.
- `EMPLOYER` users can view jobs posted by their companies.
- `CANDIDATE` users can apply for jobs.
- Public users can browse jobs, companies, and users.

Employer flow:

```text
Register/Login as Employer -> Create Company -> Post Job
```

## Scalability Features

- Redis caches `GET /api/jobs` responses for 60 seconds.
- Job cache keys include the full query string, so different filters and pages are cached separately.
- Creating a job clears the jobs cache.
- Rate limiting protects the API from repeated requests.
- Prisma indexes support common job queries by title, location, job type, company, creation date, and salary.
- Morgan and response time logs make API behavior easier to inspect during development.
- Docker Compose keeps PostgreSQL and Redis setup repeatable.

## Screenshots

Add screenshots here before publishing:

```text
screenshots/home.png
screenshots/jobs.png
screenshots/job-details.png
screenshots/login.png
screenshots/employer-dashboard.png
screenshots/my-applications.png
```

## Final Testing Checklist

- `docker compose up -d` starts PostgreSQL and Redis.
- `npm install` completes in the root project.
- `npx prisma migrate dev` runs successfully.
- `npm run prisma:seed` creates demo data.
- `npm run build` passes for the backend.
- `npm run dev` starts the backend on `http://localhost:5000`.
- `cd client && npm install` completes.
- `cd client && npm run build` passes.
- `cd client && npm run dev` starts the frontend on `http://localhost:5173`.
- Public users can view jobs and job details.
- A candidate can log in, apply for a job, and view My Applications.
- An employer can log in, create a company profile, and create a job from the Dashboard.
- A candidate cannot create jobs.
- An employer cannot apply for jobs.
- Redis cache returns `X-Cache: HIT` on repeated `GET /api/jobs` requests.

## Resume Bullet Points

- Built a full-stack job board platform with React, TypeScript, Express, PostgreSQL, Prisma, Redis, and Docker Compose.
- Implemented JWT authentication, bcrypt password hashing, protected routes, and role-based authorization for employer and candidate workflows.
- Added employer company profile creation, employer job creation, candidate application flow, public job browsing, filtering, pagination, and job details pages.
- Improved backend scalability with Redis caching, cache invalidation, global rate limiting, database indexes, and response time logging.
- Created a rerunnable Prisma seed script with demo companies, employers, candidates, jobs, and applications.
- Organized the codebase into beginner-friendly backend feature modules and reusable frontend components.

## Useful Commands

```powershell
docker compose up -d
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
npm run build
cd client
npm install
npm run dev
npm run build
```
