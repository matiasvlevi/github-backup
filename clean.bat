@echo off
del /F /Q clean.sh index.js
del /F /Q node_modules
del /F /Q /A:H .git
echo "Cleaned all files"
pause
del clean.bat