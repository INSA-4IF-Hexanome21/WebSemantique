include ../config.mk

.DEFAULT_GOAL := run
.PHONY: kill run

kill:
	lsof -ti :$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true

run:
	python3 -m http.server $(FRONTEND_PORT) --bind $(IP)