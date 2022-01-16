del /F /Q clean.sh index.js
rmdir /F /S /Q node_modules
rmdir /F /S /Q /A .git
echo "Cleaned all files"
pause

call :deleteSelf&exit /b
:deleteSelf
start /b "" cmd /c del "%~f0"&exit /b