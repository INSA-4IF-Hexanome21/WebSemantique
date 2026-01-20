.DEFAULT_GOAL := run
.PHONY: kill install dev run

# CONFIGURATION
# =============

IP := 127.0.0.1
PORT := 8000
VENV_BIN := venv/bin
PYTHON := python3

# TARGETS
# =======

kill:
	echo "Killing process on port $(PORT)..."
	-lsof -ti :$(PORT) | xargs kill -9 2>/dev/null || true

install:
	echo "Installing dependencies..."
	$(PYTHON) -m venv venv
	./$(VENV_BIN)/pip install -q --disable-pip-version-check -r requirements.txt

dev: install
	echo "Starting development server..."
	$(ENV_VARS) ./$(VENV_BIN)/fastapi dev ./backend/serveur.py --host $(IP) --port $(PORT)

run: install
	echo "Starting production server..."
	$(ENV_VARS) ./$(VENV_BIN)/fastapi run ./backend/serveur.py --host $(IP) --port $(PORT)