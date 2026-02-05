# E-FIR Portal

A complete full-stack web application for filing and managing First Information Reports (FIRs).

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs

## Features

- **Citizen Portal:**
  - Register/Login
  - File FIRs
  - View filed FIRs status
  - Dashboard

- **Officer Portal:**
  - View all FIRs
  - Filter by City, State, Type, Status
  - Update FIR Status (Pending -> In Progress -> Resolved/Rejected)
  - Analytics Dashboard (Charts & Stats)

## Setup & Run

1. **Prerequisites:**
   - Node.js installed
   - MongoDB installed and running locally (or update `MONGO_URI` in `backend/.env`)

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Run Application:**
   - You can use the provided `run.bat` file on Windows to start both servers.
   - Or run them manually:
     - Backend: `cd backend && npm start` (Runs on port 5000)
     - Frontend: `cd frontend && npm run dev` (Runs on port 5173)

## Default Credentials

- Register a new user as a Citizen.
- To test Officer features, check "Register as Officer" during registration (Demo mode).

