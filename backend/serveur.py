from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

# Redirect root to frontend server
@app.get("/")
async def root():
    return RedirectResponse(url="http://127.0.0.1:8080")

@app.get("/api/get-planet")
async def get_planet(name: str):
    return {
        "status": "success",
        "input": {"name": name},
        "output": {}
        }