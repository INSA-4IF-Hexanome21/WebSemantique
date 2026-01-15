import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from SPARQLWrapper import SPARQLWrapper, JSON

app = FastAPI()

FRONTEND_IP = os.getenv("FRONTEND_IP")
FRONTEND_PORT = os.getenv("FRONTEND_PORT")
FRONTEND_URL = f"http://{FRONTEND_IP}:{FRONTEND_PORT}" if FRONTEND_IP and FRONTEND_PORT else None

query_prefix = """
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
"""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)



def get_sparql_results(query: str):
    sparql = SPARQLWrapper("https://dbpedia.org/sparql")
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()["results"]["bindings"]



# Redirect root to frontend server
@app.get("/")
async def root():
    if FRONTEND_URL:
        return RedirectResponse(url=FRONTEND_URL)
    return {"status": 0, "input": {}, "output": {}}

##CONSTELLATIONS AND STARS##
@app.get("/api/get-constellations")
def get_constellations():
    query = f"""
    {query_prefix}
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
    {query_prefix}
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

    result = [{"name": item["label"]["value"], "uri": item["star"]["value"]} for item in raw]
    result.sort(key=lambda x: x["name"])
    return {"status": 1, "input": {"name": name}, "output": result}



@app.get("/api/get-star-details")
def get_star_details(name: str):
    query = f"""
    {query_prefix}
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
    data_url = result.replace("http://dbpedia.org/resource/", "https://dbpedia.org/data/") + ".json"
    data = requests.get(data_url)
    return {"status": 1, "input": {"name": name}, "output": data.json()}

@app.get("/api/get-stars")
async def get_stars():
    query = f"""
    {query_prefix}
    SELECT ?star ?label
    WHERE {{
    ?star rdf:type dbo:Star ;
            rdfs:label ?label .
    FILTER (lang(?label) = "fr")
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    raw = sparql.query().convert()["results"]["bindings"]
    result = []
    for item in raw:
        star = {}
        star["name"] = item["label"]["value"]
        star["uri"] = item["star"]["value"]
        result.append(star)
        result.sort(key=lambda x: x["name"])
    return {"status": 1, "input": {}, "output": result}