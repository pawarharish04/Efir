# E-FIR Portal (Efir)

A full-stack web application to file, track, and manage First Information Reports (FIRs) through role-based citizen and officer dashboards.

## Repository

- **GitHub:** https://github.com/pawarharish04/Efir
- **Owner:** [pawarharish04](https://github.com/pawarharish04)
- **Default Branch:** `main`
- **Primary Language:** JavaScript

## Language Composition

Based on repository analysis:

- **JavaScript:** 98.6%
- **Java:** 0.6%
- **CSS:** 0.3%
- **HTML:** 0.2%
- **TypeScript:** 0.1%
- **Batchfile:** 0.1%
- **Dockerfile:** 0.1%

## Project Overview

E-FIR Portal provides a digital workflow for FIR filing and case progress tracking.

- Citizens can register, log in, submit FIRs, and monitor case status.
- Officers can review submitted FIRs, filter records, update statuses, and view analytics.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security

- JWT (JSON Web Tokens)
- bcryptjs

## Core Features

### Citizen Portal

- Citizen registration and login
- FIR submission
- FIR status tracking
- User dashboard

### Officer Portal

- View all FIR submissions
- Filter by city, state, type, and status
- Update FIR status workflow:
  - Pending → In Progress → Resolved / Rejected
- Analytics dashboard with charts and summary stats

## Folder Structure (High-Level)

- `frontend/` — React + Vite client application
- `backend/` — Node.js + Express API and business logic
- `run.bat` — Windows helper script to run services

## Getting Started

### 1) Prerequisites

- Node.js installed
- MongoDB installed and running locally
  - Or configure a remote DB connection in `backend/.env` via `MONGO_URI`

### 2) Install Dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3) Run the Application

#### Option A: Windows helper script

Use `run.bat` from the project root to start both services.

#### Option B: Run manually

- Backend:

```bash
cd backend
npm start
```

Runs on: `http://localhost:5000`

- Frontend:

```bash
cd frontend
npm run dev
```

Runs on: `http://localhost:5173`

## Usage Notes

- Create a new account to use the Citizen portal.
- To test officer functionality, register with **"Register as Officer"** enabled (demo mode).

## Future Improvements (Suggested)

- Environment variable examples (`.env.example`)
- Docker Compose for one-command local setup
- CI/CD workflow for automated tests and linting
- API documentation (OpenAPI/Swagger)
- Production deployment guide

## License

No license file is currently defined in this repository.

---

If you want, I can also update `frontend/README.md` so both READMEs are consistent and project-specific.