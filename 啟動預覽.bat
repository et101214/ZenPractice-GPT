@echo off
chcp 65001 >nul
cd /d "%~dp0"
python dev_server.py
pause
