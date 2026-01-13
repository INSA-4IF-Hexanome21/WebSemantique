import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from SPARQLWrapper import SPARQLWrapper, JSON

from intelligence.ia import ask_AI

app = FastAPI()
sparql = SPARQLWrapper("https://dbpedia.org/sparql")  

# BaseModel (Pydantic) : définit le schéma du body JSON attendu par l’API,
# valide automatiquement les données entrantes et les convertit en objet Python typé.
class AIRequest(BaseModel): 
    content: str
sparql = SPARQLWrapper("https://dbpedia.org/sparql")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Redirect root to frontend server
@app.get("/")
async def root():
    frontend_ip = os.getenv("FRONTEND_IP")
    frontend_port = os.getenv("FRONTEND_PORT")
    if frontend_ip and frontend_port:
        return RedirectResponse(url=f"http://{frontend_ip}:{frontend_port}")
    else:
        return {"status": 0, "input": {}, "output": {}}

@app.get("/api/get-constellations")
async def get_constellations():
    query = f"""
    SELECT DISTINCT ?nameConstellation
    WHERE {{
    ?etoile a dbo:Star.
    ?etoile dbp:constell ?constellation.
    ?etoile rdfs:label ?label.
    ?constellation dbp:name ?nameConstellation.
    FILTER (lang(?label) = "fr")
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    raw = sparql.query().convert()["results"]["bindings"]
    results = []
    for result in raw:
        results.append(result["nameConstellation"]["value"])
        results.sort()
    return {"status": 1, "input": {}, "output": raw}

@app.get("/api/get-stars-in-constellation")
async def get_stars_in_constellation(name: str):
    name = name.replace(" ", "_")
    query = f"""
    SELECT ?etoile ?constellation
    WHERE {{
    ?etoile a dbo:Star .
    ?etoile dbp:constell ?constellation.
    FILTER( ?constellation = dbr:{name} )
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    raw = sparql.query().convert()["results"]["bindings"]
    results = []
    for result in raw:
        results.append(result["etoile"]["value"])
        results.sort()
    return {"status": 1, "input": {"name": name}, "output": results}

@app.post("/api/ask-ai")
async def ask_ai(payload: AIRequest):
    response = ask_AI(payload.content)
    print(response)
    try :
        query = response
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        return {"status": 1, "input": {}, "output": {"response": results}}
    except Exception as e :
        print(e)
        return {"status": 0, "input": {}, "output": {}}