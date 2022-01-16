del /F /Q clean.sh index.js
del /F /S /Q node_modules
del /F /S /Q /A .git
echo "Cleaned all files"
pause

call :deleteSelf&exit /b
:deleteSelf
start /b "" cmd /c del "%~f0"&exit /b