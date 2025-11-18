@echo off
REM Start the backend with error capture
cd /d "H:\PROJECTS\Dont Touch\perfect\KnitFinalTicketCompletion\backend"
echo Starting backend...
python -m uvicorn main:app --reload --log-level debug
pause
