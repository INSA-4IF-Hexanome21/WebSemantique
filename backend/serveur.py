# IMPORTS
# =======

import os
import json
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from intelligence.ai import ask_AI
from pydantic import BaseModel
from SPARQLWrapper import SPARQLWrapper, JSON



# CONFIGURATION
# =============

CACHE = True

FRONTEND_DIR = "./frontend"
FRONTEND_FILE = os.path.join(FRONTEND_DIR, "index.html")

DBPEDIA_SPARQL_ENDPOINT = "https://dbpedia.org/sparql"
DBPEDIA_RESOURCE_BASE = "http://dbpedia.org/resource/"
DBPEDIA_DATA_BASE = "https://dbpedia.org/data/"

SPARQL_PREFIX = """
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX gold: <http://purl.org/linguistics/gold/>
"""

app = FastAPI()

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
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



def load_cache(filename: str):
    if not os.path.exists(os.path.join("cache", filename)):
        return None
    with open(os.path.join("cache", filename), "r") as f:
        return json.load(f)



def save_cache(filename: str, data):
    os.makedirs("cache", exist_ok=True)
    with open(os.path.join("cache", filename), "w") as f:
        json.dump(data, f, indent=4)



# ROUTES - ROOT
# =============

@app.get("/")
async def root():
    if os.path.exists(FRONTEND_FILE):
        return FileResponse(FRONTEND_FILE)



# ROUTES - CONSTELLATIONS
# =======================

@app.get("/api/get-constellations")
def get_constellations(cache: bool = CACHE):
    cache_file = "get-constellations.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

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
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}

    result = [item["name"]["value"] for item in raw]
    result.sort()
    output = {"status": 1, "input": {"cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



@app.get("/api/get-stars-in-constellation")
def get_stars_in_constellation(name: str, cache: bool = CACHE):
    name = name.replace(" ", "_")
    cache_file = f"get-stars-in-constellation-{name}.json"

    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data
    
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
    if not raw: return {"status": 0, "input": {"name": name, "cache": cache}, "output": {}}

    result = [{"name": item["label"]["value"], "uri": item["star"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"name": name, "cache": cache}, "output": result}
    
    save_cache(cache_file, output)
    return output



@app.get("/api/get-star-details-in-constellation")
def get_star_details_in_constellation(name: str, cache: bool = CACHE):
    cache_file = f"get-star-details-in-constellation-{name}.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data
    
    stars = get_stars_in_same_constellation(name, cache=cache)["output"]["stars"]
    details = []
    for star in stars:
        detail = get_star_details(star["name"], cache=cache)["output"]
        details.append(detail)
    output = {"status": 1, "input": {"name": name, "cache": cache}, "output": details}
    
    save_cache(cache_file, output)
    return output



# ROUTES - STARS
# ==============

@app.get("/api/get-stars")
async def get_stars(cache: bool = CACHE):
    cache_file = "get-stars.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data
    
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
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}
    
    result = [{"name": item["label"]["value"], "uri": item["star"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



@app.get("/api/get-star-details")
def get_star_details(name: str, cache: bool = CACHE):
    cache_file = f"get-star-details-{name}.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data
    
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
    if not raw: return {"status": 0, "input": {"name": name, "cache": cache}, "output": {}}

    result = raw[0]["star"]["value"]
    data_url = result.replace(DBPEDIA_RESOURCE_BASE, DBPEDIA_DATA_BASE) + ".json"
    data = requests.get(data_url)
    output = {"status": 1, "input": {"name": name, "cache": cache}, "output": data.json()}
    
    save_cache(cache_file, output)
    return output



@app.get("/api/get-stars-in-same-constellation")
def get_stars_in_same_constellation(name: str, cache: bool = CACHE):
    cache_file = f"get-stars-in-same-constellation-{name}.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data
    
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
    if not raw: return {"status": 0, "input": {"name": name, "cache": cache}, "output": {}}

    # Retourne toutes les étoiles dont celle en entrée
    result = {}
    result["constellation"] = {"name": raw[0]["constellName"]["value"], "uri": raw[0]["constellation"]["value"]}
    result["stars"] = [{"name": item["siblingName"]["value"], "uri": item["sibling"]["value"]} for item in raw]
    result["stars"].sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"name": name, "cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



# ROUTES - PLANETS
# ================

@app.get("/api/get-planets")
async def get_planets(cache: bool = CACHE):
    cache_file = f"get-planets.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

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
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}
    
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
    output = {"status": 1, "input": {"cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



@app.get("/api/get-moons")
async def get_moons(type: str, cache: bool = CACHE):
    cache_file = f"get-moons-{type}.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

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
    if not raw: return {"status": 0, "input": {"type": type, "cache": cache}, "output": {}}
    result = []
    for object in raw :
        moon = {}
        moon["name"] = object["lune"]["value"].split("/")[-1]
        moon["planet"] = object["planet"]["value"].split("/")[-1]
        moon["uri"] = object["lune"]["value"]
        result.append(moon)
    result.sort(key=lambda x: (x["planet"],x["name"]))
    output = {"status": 1, "input": {"type": type, "cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



# ROUTES - SATELLITES
# ===================

@app.get("/api/get-satellites")
def get_satellites(cache: bool = CACHE):
    cache_file = f"get-satellites.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

    query = SPARQL_PREFIX + """
    SELECT DISTINCT ?satellite ?label
    WHERE {{
        ?satellite rdf:type dbo:CelestialBody ;
            rdfs:label ?label ;
            dbo:description ?description .
        FILTER(lang(?label) = "fr")
        FILTER(lang(?description) = "fr")
        FILTER(CONTAINS(LCASE(?description), "satellite"))
    }
    UNION
    {
        ?satellite gold:hypernym dbr:Satellite ;
            rdfs:label ?label .
        FILTER(lang(?label) = "fr")
    }}
    """
    raw = get_sparql_results(query)
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}
    
    result = [{"name": item["label"]["value"], "uri": item["satellite"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



@app.get("/api/get-natural-satellites")
def get_natural_satellites(cache: bool = CACHE):
    cache_file = f"get-natural-satellites.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

    query = SPARQL_PREFIX + """
    SELECT DISTINCT ?satellite ?label
       (EXISTS { ?satellite rdf:type dbo:CelestialBody } AS ?isNatural)
    WHERE {
        # Satellites détectés via description
        ?satellite rdf:type dbo:CelestialBody ;
                   rdfs:label ?label ;
                   dbo:description ?description .
        FILTER(lang(?label) = "fr")
        FILTER(lang(?description) = "fr")
        FILTER(CONTAINS(LCASE(?description), "satellite"))
        FILTER NOT EXISTS {?satellite gold:hypernym dbr:Satellite}
    }
    """
    raw = get_sparql_results(query)
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}
    
    result = [{"name": item["label"]["value"], "uri": item["satellite"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"cache": cache}, "output": result}

    save_cache(cache_file, output)
    return output



@app.get("/api/get-artificial-satellites")
def get_artificial_satellites(cache: bool = CACHE):
    cache_file = f"get-artificial-satellites.json"
    
    cache_data = load_cache(cache_file)
    if cache and cache_data: return cache_data

    query = SPARQL_PREFIX + """
    SELECT DISTINCT ?satellite ?label
    WHERE {
    ?satellite gold:hypernym dbr:Satellite ;
                rdfs:label ?label .

    FILTER(lang(?label) = "fr")
    FILTER NOT EXISTS { ?satellite rdf:type dbo:CelestialBody }
    }
    """
    raw = get_sparql_results(query)
    if not raw: return {"status": 0, "input": {"cache": cache}, "output": {}}
    
    result = [{"name": item["label"]["value"], "uri": item["satellite"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    output = {"status": 1, "input": {"cache": cache}, "output": result}
    save_cache(cache_file, output)
    return output



# ROUTES - AI
# ===========

@app.post("/api/ask-ai")
async def ask_ai(payload: AIRequest):
    response = ask_AI(payload.content)
    print(response)
    
    try:
        query = response
        results = get_sparql_results(query)
        return {"status": 1, "input": {"payload": payload.content}, "output": results}
    except Exception as e:
        print(f"Error executing AI-generated query: {e}")
        return {"status": 0, "input": {"payload": payload.content}, "output": {}}