include config.mk

.DEFAULT_GOAL := run

.PHONY: run

# Detect OS for opening browser
ifeq ($(OS),Windows_NT)
OPEN_CMD := start
else
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
OPEN_CMD := open
else ifeq ($(UNAME_S),Linux)
OPEN_CMD := xdg-open
else
OPEN_CMD := echo "Please open manually:"
endif
endif

run:
	(trap 'kill 0' SIGINT; \
	 cd frontend && make run & \
	 cd backend && make run & \
	 sleep 2 && $(OPEN_CMD) http://$(IP):$(FRONTEND_PORT) & \
	 wait)