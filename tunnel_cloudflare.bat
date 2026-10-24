@echo off
title OceanGate Cloudflare Worldwide Tunnel
echo ================================================================
echo       OCEANGATE CRM - CLOUDFLARE WORLDWIDE ACCESS GATEWAY
echo ================================================================
echo Connecting unified server (http://localhost:5000) to Cloudflare...
echo.
cloudflared tunnel --url http://127.0.0.1:5000
pause
