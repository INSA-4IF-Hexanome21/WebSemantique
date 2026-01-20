# IMPORTS
# =======

import os
import sys
import subprocess
import platform



# CONFIGURATION
# =============

IP = "127.0.0.1"
PORT = 8000
VENV_DIR = "venv"
BACKEND_FILE = "./backend/serveur.py"

IS_WINDOWS = platform.system() == "Windows"
VENV_BIN = os.path.join(VENV_DIR, "Scripts" if IS_WINDOWS else "bin")
PYTHON_EXE = os.path.join(VENV_BIN, "python" if not IS_WINDOWS else "python.exe")
FASTAPI_EXE = os.path.join(VENV_BIN, "fastapi")



# FUNCTIONS
# =========

def kill():
    print(f"Stopping process on port {PORT}...")
    if IS_WINDOWS:
        cmd = f"powershell -Command \"Get-NetTCPConnection -LocalPort {PORT} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force\""
        subprocess.run(cmd, shell=True)
    else:
        cmd = f"lsof -ti :{PORT} | xargs kill -9 2>/dev/null || true"
        subprocess.run(cmd, shell=True)

def install():
    if not os.path.exists(VENV_DIR):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", VENV_DIR], check=True)
    
    print("Installing dependencies...")
    pip_exe = os.path.join(VENV_BIN, "pip")
    subprocess.run([pip_exe, "install", "-q", "--disable-pip-version-check", "-r", "requirements.txt"], check=True)

def start(mode="run"):
    install()
    print(f"Starting server in {mode} mode...")
    cmd = [FASTAPI_EXE, mode, BACKEND_FILE, "--host", IP, "--port", str(PORT)]
    subprocess.run(cmd, shell=False)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py [install|kill|dev|run]")
        sys.exit(1)

    command = sys.argv[1]
    if command == "install":
        install()
    elif command == "kill":
        kill()
    elif command == "dev":
        start(mode="dev")
    elif command == "run":
        start(mode="run")
    else:
        print("Usage: python main.py [install|kill|dev|run]")