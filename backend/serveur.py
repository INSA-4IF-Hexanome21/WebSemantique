from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

app = FastAPI()

# Redirect root to 127.0.0.1:8080
@app.get("/")
async def root():
    return RedirectResponse(url="http://127.0.0.1:8080")

@app.get("/api/getPlanet")
async def getPlanet(name: str):
    return {
        "status": "success",
        "input": {"name": name},
        "output": {}
        }