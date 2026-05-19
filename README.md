# Scalable Job Board Platform

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A polished full-stack job board built with React, TypeScript, Express, PostgreSQL, and Prisma.

Scalable Job Board Platform supports two core workflows: candidates can discover and apply for jobs, while employers can manage companies, post jobs, and review applicants.

The project demonstrates production-minded patterns such as JWT authentication, role-based authorization, file uploads, search and filtering, protected routes, and a responsive dashboard experience.

## Highlights

- Full-stack TypeScript application
- Candidate and employer role flows
- PDF resume upload for applications
- Employer application review workflow
- PostgreSQL schema managed with Prisma ORM
- JWT auth with protected frontend routes
- Responsive UI styled with Tailwind CSS
- Optional Redis caching layer for future scaling

## Features

### Candidate Features

- Browse public job listings
- Search and filter jobs
- Apply with PDF resume upload
- Track submitted applications
- Save and unsave jobs

### Employer Features

- Create and manage companies
- Post and edit jobs
- Review submitted applications
- View and download resumes
- Manage application statuses

### Platform Features

- JWT authentication
- Role-based authorization
- Responsive UI
- Search and filtering
- Public company and job pages
- Protected dashboards
- Toast notifications for key user actions

## Screenshots

# Screenshots

## Home Page

![Home Page](./frontend/public/screenshots/home-page.png)

---

## Smart Job Search

![Job Search](./frontend/public/screenshots/job-search.png)

---

## Jobs Page

![Jobs Page](./frontend/public/screenshots/jobs-page.png)

---

## Companies Page

![Companies Page](./frontend/public/screenshots/companies-page.png)

---

## Candidate Dashboard

![Candidate Dashboard](./frontend/public/screenshots/candidate-dashboard.png)

---

## Saved Jobs

![Saved Jobs](./frontend/public/screenshots/saved-jobs.png)

---

## My Applications

![My Applications](./frontend/public/screenshots/my-applications.png)

---

## Employer Stats

![Employer Stats](./frontend/public/screenshots/employer-stats.png)

---

## Employer Dashboard

![Employer Dashboard](./frontend/public/screenshots/employer-dashboard.png)

---

## Applications Received

![Applications Received](./frontend/public/screenshots/applications-received.png)

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Axios
- React Router
- React Hot Toast
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer for resume uploads
- Zod validation

## Architecture

```text
+--------------------------+
|       React Client       |
|  React Router + Axios    |
+------------+-------------+
             |
             | HTTP / JSON
             v
+--------------------------+
|       Express API        |
| Auth, Validation, REST   |
+------------+-------------+
             |
             | Prisma ORM
             v
+--------------------------+
|      PostgreSQL DB       |
| Users, Jobs, Companies   |
+--------------------------+

Optional:
+--------------------------+
|       Redis Cache        |
| Disabled locally by env  |
+--------------------------+
```

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

## Demo Accounts

Seeded users use:

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

## Deployment

Deployment details will be added here.

Suggested deployment path:

- Frontend: Vercel, Netlify, or static hosting
- Backend: Render, Railway, Fly.io, or container hosting
- Database: Managed PostgreSQL
- Resume uploads: Cloud storage

## Future Improvements

- Admin dashboard
- Real-time notifications
- Email integration
- Docker deployment
- Cloud storage for uploaded resumes
- Advanced analytics for employers
- Saved searches and job alerts

## Portfolio Notes

This project is designed to show end-to-end product thinking: data modeling, API design, authentication, authorization, file uploads, frontend routing, form handling, error states, and role-specific dashboards.

It is suitable for demonstrating full-stack engineering skills to recruiters and technical reviewers.
