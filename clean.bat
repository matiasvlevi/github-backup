del /F /Q clean.sh index.js
del /F /Q /S node_modules
del /F /Q /A:H .git
echo "Cleaned all files"
pause

call :deleteSelf&exit /b
:deleteSelf
start /b "" cmd /c del "%~f0"&exit /b