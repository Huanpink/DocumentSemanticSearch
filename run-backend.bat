@echo off
cd apps\backend
uv run fastapi dev src/app/main.py
