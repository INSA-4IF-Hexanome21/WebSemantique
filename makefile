include config.mk

.DEFAULT_GOAL := run
.PHONY: kill install run

kill:
	(cd frontend && make kill)
	(cd backend && make kill)

install:
	(cd frontend && make install)
	(cd backend && make install)

run:
	(trap 'kill 0' SIGINT; \
	 cd frontend && make run & \
	 cd backend && make run & \
	 sleep 2 && python3 -c "import webbrowser; webbrowser.open('http://$(IP):$(FRONTEND_PORT)')" & \
	 wait)