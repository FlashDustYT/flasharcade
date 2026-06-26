@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set PORT=8787
set BUNDLED_PYTHON=C:\Users\isaac\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe

if exist "%BUNDLED_PYTHON%" (
  set PYTHON=%BUNDLED_PYTHON%
) else (
  where python >nul 2>nul
  if %ERRORLEVEL%==0 (
    set PYTHON=python
  ) else (
    echo Python was not found.
    pause
    exit /b 1
  )
)

echo.
echo Legacy League mobile server
echo ---------------------------
echo Keep this window open while playing on your phone.
echo.
echo Desktop: http://localhost:%PORT%/index.html
echo Mobile:  use your computer's Wi-Fi IP, like http://YOUR-IP:%PORT%/index.html
echo.
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
  set IP=%%A
  set IP=!IP: =!
  echo Try mobile link: http://!IP!:%PORT%/index.html
)
echo.
"%PYTHON%" -m http.server %PORT% --bind 0.0.0.0
