.DEFAULT_GOAL := run
.PHONY: kill install dev run clean

# Configuration
IP := 127.0.0.1
PORT := 8000
VENV_NAME := venv

# -------------------------------------------------------------------------
# OS Detection & Command Setup
# -------------------------------------------------------------------------
ifeq ($(OS),Windows_NT)
    # Windows Settings
    PYTHON := python
    VENV_BIN := $(VENV_NAME)/Scripts
    
    KILL_CMD := powershell -Command "Get-NetTCPConnection -LocalPort $(PORT) -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force"
    CLEAN_CMD := rmdir /s /q $(VENV_NAME)
else
    # macOS / Linux Settings
    PYTHON := python3
    VENV_BIN := $(VENV_NAME)/bin

    KILL_CMD := lsof -ti :$(PORT) | xargs kill -9 2>/dev/null || true
    CLEAN_CMD := rm -rf $(VENV_NAME)
endif

# -------------------------------------------------------------------------
# Targets
# -------------------------------------------------------------------------

kill:
	@echo "Stopping process on port $(PORT)..."
	-$(KILL_CMD)

install:
	@echo "Creating virtual environment and installing dependencies..."
	$(PYTHON) -m venv $(VENV_NAME)
	$(VENV_BIN)/pip install -q --disable-pip-version-check -r requirements.txt

dev: install
	@echo "Starting development server..."
	$(ENV_VARS) $(VENV_BIN)/fastapi dev ./backend/serveur.py --host $(IP) --port $(PORT)

run: install
	@echo "Starting production server..."
	$(ENV_VARS) $(VENV_BIN)/fastapi run ./backend/serveur.py --host $(IP) --port $(PORT)

clean:
	@echo "Cleaning up..."
	-$(CLEAN_CMD)