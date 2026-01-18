# IMPORTS
# =======
import os
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from intelligence.ai import ask_AI
from pydantic import BaseModel
from SPARQLWrapper import SPARQLWrapper, JSON



# CONFIGURATION
# =============

FRONTEND_IP = os.getenv("FRONTEND_IP")
FRONTEND_PORT = os.getenv("FRONTEND_PORT")
FRONTEND_URL = (f"http://{FRONTEND_IP}:{FRONTEND_PORT}" if FRONTEND_IP and FRONTEND_PORT else None )

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
    SELECT DISTINCT ?name
    WHERE {{
        ?star a dbo:Star.
        ?star dbp:constell ?constellation.
        ?star rdfs:label ?label.
        ?constellation dbp:name ?name.
        FILTER (lang(?label) = "fr")
    }}
    """
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {}, "output": {}}

    result = [item["name"]["value"] for item in raw]
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
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {"name": name}, "output": {}}

    result = [{"name": item["label"]["value"], "uri": item["star"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    return {"status": 1, "input": {"name": name}, "output": result}



# ROUTES - STARS
# ==============

@app.get("/api/get-stars")
async def get_stars():
    query = f"""
    {SPARQL_PREFIX}
    SELECT ?star ?label
    WHERE {{
        ?star rdf:type dbo:Star.
        ?star rdfs:label ?label.
        FILTER (lang(?label) = "fr")
    }}
    """
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {}, "output": {}}
    
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
    query = f"""
    {SPARQL_PREFIX}
    SELECT DISTINCT ?constellation ?constellName ?sibling ?siblingName
    WHERE {{
        ?star a dbo:Star.
        ?star dbp:constell ?constellation.
        ?star rdfs:label ?name.
        ?sibling a dbo:Star.
        ?sibling dbp:constell ?siblingConstell.
        ?sibling rdfs:label ?siblingName.
        ?constellation dbp:name ?constellName.
        FILTER (?constellation = ?siblingConstell)
        FILTER (lang(?siblingName)="en")
        FILTER contains (?name, "{name}")
    }}
    """
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {"name": name}, "output": {}}

    # retourne toutes les étoiles dont celle en entrée
    result = {}
    result["constellation"] = {"name": raw[0]["constellName"]["value"], "uri": raw[0]["constellation"]["value"]}
    result["stars"] = [{"name": item["siblingName"]["value"], "uri": item["sibling"]["value"]} for item in raw]
    result["stars"].sort(key=lambda x: x["name"])
    return {"status": 1, "input": {"name": name}, "output": result}

# ROUTES - PLANETS
# ==============

@app.get("/api/get-planets")
async def get_planets():
    query = f"""
    {SPARQL_PREFIX}
    SELECT DISTINCT ?planete  ?des
    WHERE {{
    ?planete a dbo:Planet.
    ?planete dbo:description ?des.
    ?planete gold:hypernym dbr:Planet.
    FILTER not exists {{?planete a dbo:Asteroid}}
    FILTER (lang(?des)="fr")
    }} 
    """
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {}, "output": {}}
    
    result = []
    systeme_solaire = []
    for object in raw :
        planet = {}
        planet["name"] = object["planete"]["value"].split("/")[-1]
        planet["type"] = object["des"]["value"]
        planet["uri"] = object["planete"]["value"]
        
        if "Système solaire".upper() in planet["type"].upper() :
           systeme_solaire.append(planet) 
        else :
            result.append(planet)
    
    result.sort(key=lambda x: (x["type"],x["name"]))
    systeme_solaire.sort(key=lambda x: x["name"])
    result = systeme_solaire + result

    return {"status": 1, "input": {}, "output": result}

@app.get("/api/get-moons")
async def get_moons(type: str):
    print("entrée dans la fonction")
    if type == "Système Solaire" :
        query = f"""
        {SPARQL_PREFIX}
        SELECT DISTINCT ?lune  ?planet
        WHERE {{
        ?lune a dbo:Planet.
        ?lune dbp:satelliteOf ?planet.
        ?lune dbo:description ?des.
        ?lune gold:hypernym dbr:Satellite.
        FILTER (lang(?des)="fr")
        }}
        """     
    
    else :
        query = f"""
        {SPARQL_PREFIX}
        SELECT DISTINCT ?lune  ?planet
        WHERE {{
        ?lune a dbo:Planet.
        ?lune dbp:satelliteOf ?planet.
        ?lune dbo:description ?des.
        FILTER (lang(?des)="fr")
        }}
        """
    
    raw = get_sparql_results(query)
    if not raw:
        return {"status": 0, "input": {}, "output": {}}
    result = []
    for object in raw :
        moon = {}
        moon["name"] = object["lune"]["value"].split("/")[-1]
        moon["planet"] = object["planet"]["value"].split("/")[-1]
        moon["uri"] = object["lune"]["value"]
        
        result.append(moon)
    
    result.sort(key=lambda x: (x["planet"],x["name"]))

    return {"status": 1, "input": {}, "output": result}

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