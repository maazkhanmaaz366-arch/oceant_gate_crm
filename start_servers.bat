@echo off
title OceanGate Servers
echo Starting OceanGate Backend and Frontend simultaneously...

:: Use npx concurrently to run both servers in the same terminal. 
:: This perfectly binds them together so pressing Ctrl+C once kills both cleanly!
npx concurrently -n "BACKEND,FRONTEND" -c "bgBlue.bold,bgGreen.bold" "cd Backend_app && npm run dev" "cd frontend_app && npm run dev"
