include ../config.mk

.DEFAULT_GOAL := run
.PHONY: kill install dev run

kill:
	lsof -ti :$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true

install:
	@echo "No installation needed for frontend."

dev:
	run

run:
	python3 -m http.server $(FRONTEND_PORT) --bind $(IP)