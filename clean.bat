del /F /Q clean.sh index.js
rmdir /S /Q node_modules
rmdir /S /Q .git
echo "Cleaned all files"
pause

call :deleteSelf&exit /b
:deleteSelf
start /b "" cmd /c del "%~f0"&exit /b