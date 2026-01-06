import os
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

# Redirect root to frontend server
@app.get("/")
async def root():
    frontend_ip = os.getenv("FRONTEND_IP", "127.0.0.1")
    frontend_port = os.getenv("FRONTEND_PORT", "8080")
    return RedirectResponse(url=f"http://{frontend_ip}:{frontend_port}")

@app.get("/api/get-planet")
async def get_planet(name: str):
    return {
        "status": "success",
        "input": {"name": name},
        "output": {}
        }