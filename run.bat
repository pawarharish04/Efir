@echo off
echo Starting E-FIR Portal...
start "Backend Server" cmd /k "cd backend && npm start"
start "Frontend Client" cmd /k "cd frontend && npm run dev"
echo Servers started!
