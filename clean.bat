@echo off
del /F /Q clean.sh index.js
rmdir /S /Q node_modules
rmdir /S /Q .git
start /b "" cmd /c del "%~f0"& exit /b