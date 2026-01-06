include config.mk

.DEFAULT_GOAL := run

.PHONY: run

run:
	(trap 'kill 0' SIGINT; \
	 cd frontend && make run & \
	 cd backend && make run & \
	 sleep 2 && open http://$(IP):$(FRONTEND_PORT) & \
	 wait)