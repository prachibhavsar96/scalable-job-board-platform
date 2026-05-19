# Job Board Frontend

React frontend for the Scalable Job Board Platform. It connects to the Express backend at `http://localhost:5000`.

## Features

- React + TypeScript + Vite
- Tailwind CSS styling
- React Router navigation
- Axios API requests
- Public Home, Jobs, and Job Details pages
- Job filters by title, location, and job type
- Pagination with Previous and Next buttons
- Login and Register pages
- Auth Context with JWT and user persistence in `localStorage`
- Protected routes
- Role-aware Navbar
- Candidate job application modal
- Candidate My Applications page
- Employer Dashboard with Company Profile and Create Job forms
- Loading, success, and error states

## Tech Stack

```text
React
TypeScript
Vite
Tailwind CSS
Axios
React Router
```

## Project Structure

```text
client/
|-- src/
|   |-- api/
|   |   |-- applications.ts
|   |   |-- auth.ts
|   |   |-- client.ts
|   |   |-- companies.ts
|   |   `-- jobs.ts
|   |-- components/
|   |   |-- ApplicationModal.tsx
|   |   |-- ErrorMessage.tsx
|   |   |-- JobCard.tsx
|   |   |-- Loading.tsx
|   |   |-- Navbar.tsx
|   |   `-- ProtectedRoute.tsx
|   |-- context/
|   |   `-- AuthContext.tsx
|   |-- pages/
|   |   |-- Dashboard.tsx
|   |   |-- Home.tsx
|   |   |-- JobDetails.tsx
|   |   |-- Jobs.tsx
|   |   |-- Login.tsx
|   |   |-- MyApplications.tsx
|   |   `-- Register.tsx
|   |-- App.tsx
|   |-- main.tsx
|   |-- styles.css
|   `-- types.ts
|-- index.html
|-- package.json
|-- tailwind.config.js
`-- vite.config.mjs
```

## Setup

Start the backend first from the project root:

```powershell
cd C:\Users\Admin\Desktop\Sclable
docker compose up -d
npm run dev
```

Install frontend dependencies:

```powershell
cd C:\Users\Admin\Desktop\Sclable\client
npm install
```

Run the frontend:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

Build:

```powershell
npm run build
```

## Pages

```text
/                    Home
/jobs                Public jobs list
/jobs/:id            Public job details and candidate apply flow
/login               Login form
/register            Register form
/dashboard           Employer dashboard, protected
/my-applications     Candidate applications, protected
```

## Authentication Flow

- Login and register call the backend auth APIs.
- The JWT token and user object are saved in `localStorage`.
- Auth state persists after page refresh.
- Logged-out users see `Login` and `Register`.
- Logged-in employers see `Dashboard`.
- Logged-in candidates see `My Applications`.
- Logout clears local auth state.

Seeded test users:

```text
Employer:  employer.acme@example.com / password123
Candidate: candidate.jane@example.com / password123
```

## Candidate Flow

Candidates can:

- Browse jobs.
- Open job details.
- Submit an application with `resumeUrl` and `coverLetter`.
- View submitted applications and statuses on `/my-applications`.

Guests are redirected to `/login` when trying to apply. Employers see a disabled apply button.

## Employer Flow

Employers can:

- Log in.
- Open `/dashboard`.
- Create a company profile with name, description, and location.
- Select that company from the Create Job dropdown.
- Create a job with title, description, location, salary range, and job type.
- View jobs posted by their companies from the database.

Candidates who visit `/dashboard` see a forbidden message.

Employer workflow:

```text
Register/Login as Employer -> Create Company -> Post Job
```

## Final Frontend Testing Checklist

- `npm install` completes in `client`.
- `npm run build` passes in `client`.
- `npm run dev` starts Vite.
- Home page loads.
- Jobs page fetches backend jobs.
- Filters and pagination work.
- Job details page loads by id.
- Login stores token and redirects to Jobs.
- Register stores token and redirects to Jobs.
- Candidate can apply from Job Details.
- Candidate can view My Applications.
- Employer can create a company from Dashboard.
- Employer can create a job from Dashboard without manually entering companyId.
- Candidate sees forbidden message on Dashboard.
- Logout clears auth state and updates Navbar.
