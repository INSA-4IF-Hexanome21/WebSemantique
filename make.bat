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
goto :eof

:: TARGETS
:: =======

:kill
echo Killing process on port %PORT%...
powershell -Command "Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force"
goto :eof

:install
echo Installing dependencies...
%PYTHON% -m venv %VENV_DIR%
"%VENV_DIR%\Scripts\pip" install -q --disable-pip-version-check -r requirements.txt
goto :eof

:dev
call :install
echo Starting development server...
"%VENV_DIR%\Scripts\fastapi" dev ./backend/serveur.py --host %IP% --port %PORT%
goto :eof

:run
call :install
echo Starting production server...
"%VENV_DIR%\Scripts\fastapi" run ./backend/serveur.py --host %IP% --port %PORT%
goto :eof