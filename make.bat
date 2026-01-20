@echo off
SETLOCAL

:: Configuration
:: =============

set IP=127.0.0.1
set PORT=8000
set VENV_DIR=venv
set PYTHON=python

if "%1"=="" goto run
if "%1"=="kill" goto kill
if "%1"=="install" goto install
if "%1"=="dev" goto dev
if "%1"=="run" goto run

echo Command not found. Use: install, dev, run, or kill.
goto :eof

:: TARGETS
:: =======

:kill
powershell -Command "Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force"
goto :eof

:install
if not exist "%VENV_DIR%" (
    %PYTHON% -m venv %VENV_DIR%
)
"%VENV_DIR%\Scripts\pip" install -q --disable-pip-version-check -r requirements.txt
goto :eof

:dev
call :install
"%VENV_DIR%\Scripts\fastapi" dev ./backend/serveur.py --host %IP% --port %PORT%
goto :eof

:run
call :install
"%VENV_DIR%\Scripts\fastapi" run ./backend/serveur.py --host %IP% --port %PORT%
goto :eof