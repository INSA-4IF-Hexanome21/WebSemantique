# IMPORTS
# =======
import os
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from intelligence.ia import ask_AI
from pydantic import BaseModel
from SPARQLWrapper import SPARQLWrapper, JSON



# CONFIGURATION
# =============

FRONTEND_IP = os.getenv("FRONTEND_IP")
FRONTEND_PORT = os.getenv("FRONTEND_PORT")
FRONTEND_URL = (
    f"http://{FRONTEND_IP}:{FRONTEND_PORT}"
    if FRONTEND_IP and FRONTEND_PORT
    else None
)

DBPEDIA_SPARQL_ENDPOINT = "https://dbpedia.org/sparql"
DBPEDIA_RESOURCE_BASE = "http://dbpedia.org/resource/"
DBPEDIA_DATA_BASE = "https://dbpedia.org/data/"

SPARQL_PREFIX = """
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
"""

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



# MODELS
# ======

class AIRequest(BaseModel):
    content: str



# UTILITAIRES
# ===========

def get_sparql_results(query: str):
    sparql = SPARQLWrapper(DBPEDIA_SPARQL_ENDPOINT)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()["results"]["bindings"]



# ROUTES - ROOT
# =============

@app.get("/")
async def root():
    if FRONTEND_URL:
        return RedirectResponse(url=FRONTEND_URL)
    return {"status": 0, "input": {}, "output": {}}



# ROUTES - CONSTELLATIONS
# =======================

@app.get("/api/get-constellations")
def get_constellations():
    query = f"""
    {SPARQL_PREFIX}
    SELECT DISTINCT ?nameConstellation
    WHERE {{
        ?etoile a dbo:Star.
        ?etoile dbp:constell ?constellation.
        ?etoile rdfs:label ?label.
        ?constellation dbp:name ?nameConstellation.
        FILTER (lang(?label) = "fr")
    }}
    """
    raw = get_sparql_results(query)

    result = [item["nameConstellation"]["value"] for item in raw]
    result.sort()
    return {"status": 1, "input": {}, "output": result}



@app.get("/api/get-stars-in-constellation")
def get_stars_in_constellation(name: str):
    name = name.replace(" ", "_")
    query = f"""
    {SPARQL_PREFIX}
    SELECT *
    WHERE {{
        ?star a dbo:Star.
        ?star dbp:constell ?constellation.
        ?star rdfs:label ?label.
        FILTER (lang(?label) = "fr")
        FILTER (?constellation = dbr:{name})
    }}
    """



# ROUTES - STARS
# ==============

@app.get("/api/get-stars")
async def get_stars():
    query = f"""
    {SPARQL_PREFIX}
    SELECT ?star ?label
    WHERE {{
        ?star rdf:type dbo:Star ;
              rdfs:label ?label .
        FILTER (lang(?label) = "fr")
    }}
    """
    raw = get_sparql_results(query)
    
    result = [{"name": item["label"]["value"], "uri": item["star"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    return {"status": 1, "input": {}, "output": result}


@app.get("/api/get-star-details")
def get_star_details(name: str):
    query = f"""
    {SPARQL_PREFIX}
    SELECT *
    WHERE {{
        ?star rdf:type dbo:Star.
        ?star rdfs:label ?label.
        FILTER (lang(?label)="en")
        FILTER contains (?label, "{name}")
    }}
    """
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {"name": name}, "output": {}}

    result = raw[0]["star"]["value"]
    data_url = result.replace(DBPEDIA_RESOURCE_BASE, DBPEDIA_DATA_BASE) + ".json"
    data = requests.get(data_url)
    return {"status": 1, "input": {"name": name}, "output": data.json()}


@app.get("/api/get-stars-in-same-constellation")
def get_stars_in_same_constellation(name: str):
    name = name.replace(" ", "_")
    query = f"""
    {SPARQL_PREFIX}
    SELECT DISTINCT ?etoile ?name ?constellation ?star 
    WHERE {{
        ?etoile a dbo:Star .
        ?star a dbo:Star.
        ?star dbp:constell ?constellation.
        ?etoile dbp:constell ?constellation.
        ?star rdfs:label ?name.
        FILTER (?constellation = ?const)
        FILTER (lang(?name)="en")
        FILTER (?star != ?etoile)
        FILTER contains (?name, "{name}")
    }}
    """
    raw = get_sparql_results(query)

    result = {"constellation": {}, "stars": []}

    if raw:
        constellation_uri = raw[0]["constellation"]["value"]
        result["constellation"] = {"name": constellation_uri.split("/")[-1], "uri": constellation_uri}
        for item in raw:
            star = {"name": item["etoile"]["value"].split("/")[-1], "uri": item["etoile"]["value"]}
            result["stars"].append(star)
        result["stars"].sort(key=lambda x: x["name"])
        
    return {"status": 1, "input": {"name": name}, "output": result}



# ROUTES - AI
# ===========

@app.post("/api/ask-ai")
async def ask_ai(payload: AIRequest):
    response = ask_AI(payload.content)
    print(response)
    
    try:
        query = response
        results = get_sparql_results(query)
        return {"status": 1, "input": {}, "output": results}
    except Exception as e:
        print(f"Error executing AI-generated query: {e}")
        return {"status": 0, "input": {}, "output": {}}