import os
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

# Redirect root to frontend server
@app.get("/")
async def root():
    frontend_ip = os.getenv("FRONTEND_IP")
    frontend_port = os.getenv("FRONTEND_PORT")
    if frontend_ip and frontend_port:
        return RedirectResponse(url=f"http://{frontend_ip}:{frontend_port}")
    else:
        return {"status": 0, "input": {}, "output": {}}

@app.get("/api/get-planet")
async def get_planet(name: str):
    return {"status": 1, "input": {"name": name}, "output": {}}