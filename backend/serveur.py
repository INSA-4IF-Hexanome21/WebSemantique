import os
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from intelligence.ia import askAI

app = FastAPI()

# BaseModel (Pydantic) : définit le schéma du body JSON attendu par l’API,
# valide automatiquement les données entrantes et les convertit en objet Python typé.
class AIRequest(BaseModel): 
    content: str

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

@app.post("/api/ask-ai")
async def ask_ai(payload: AIRequest):
    response = askAI(payload.content)
    return {"status": 1, "input": {}, "output": {"response": response}}