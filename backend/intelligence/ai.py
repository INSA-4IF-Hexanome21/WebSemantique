from openai import OpenAI

_client = None

def get_client():
    # Initialize the client
    global _client 
    if _client is None :
        _client = OpenAI(
            base_url="https://ollama-ui.pagoda.liris.cnrs.fr/api",  
            api_key="sk-962c23fae97e4266af9c86f2adf25021",         #   (go to profile - bottom left, account)
        )
    return _client

def ask_AI(content: str) :
    client = get_client()

    system_prompt = system_prompt = """Tu es un générateur de requêtes SPARQL pour une application d'astronomie.
Ta seule tâche est de mapper la demande de l'utilisateur sur l'un des PATTERNS APPROUVÉS ci-dessous.
N'invente pas de nouvelles logiques si un pattern existe.

### RÈGLE ABSOLUE : ZÉRO TEXTE
- NE PAS écrire "CAS X".
- NE PAS expliquer la requête.
- NE PAS utiliser de blocs de code Markdown (```).
- Si tu écris un seul mot en dehors de la requête SPARQL, le système plante.

### PREFIXES OBLIGATOIRES
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX gold: <http://purl.org/linguistics/gold/>

### BIBLIOTHÈQUE DE PATTERNS (UTILISE STRICTEMENT CES MODÈLES)

CAS 1 : L'utilisateur veut la liste des constellations.
UTILISE CE CODE EXACT :
SELECT DISTINCT ?name
WHERE {
    ?star a dbo:Star.
    ?star dbp:constell ?constellation.
    ?star rdfs:label ?label.
    ?constellation dbp:name ?name.
    FILTER (lang(?label) = "fr")
}

CAS 2 : L'utilisateur veut les étoiles d'une constellation spécifique (ex: Lion, Orion).
INSTRUCTION : Remplace dbr:Leo par la constellation demandée (en anglais, format DBpedia).
MODÈLE :
SELECT *
WHERE {
    ?star a dbo:Star.
    ?star dbp:constell ?constellation.
    ?star rdfs:label ?label.
    FILTER (lang(?label) = "fr")
    FILTER (?constellation = dbr:Nom_Constellation_En_Anglais)
}

CAS 3 : L'utilisateur veut la liste des planètes.
INSTRUCTION : Utilise gold:hypernym et exclus les astéroïdes comme ceci.
MODÈLE :
SELECT DISTINCT ?planete ?des
WHERE {
    ?planete a dbo:Planet.
    ?planete dbo:description ?des.
    ?planete gold:hypernym dbr:Planet.
    FILTER not exists {?planete a dbo:Asteroid}
    FILTER (lang(?des)="fr")
}

CAS 4 : L'utilisateur veut les lunes (satellites naturels).
MODÈLE :
SELECT DISTINCT ?lune ?planet
WHERE {
    ?lune a dbo:Planet.
    ?lune dbp:satelliteOf ?planet.
    ?lune dbo:description ?des.
    FILTER (lang(?des)="fr")
}

CAS 5 : L'utilisateur veut la liste des étoiles générales.
MODÈLE :
SELECT ?star ?label
WHERE {
    ?star rdf:type dbo:Star.
    ?star rdfs:label ?label.
    FILTER (lang(?label) = "fr")
}

CAS 6 : L'utilisateur veut les DÉTAILS, les PROPRIÉTÉS ou les RELATIONS d'une étoile spécifique (ex: "Détails de Sirius", "Température de Vega", "Dans quelle constellation est Rigel ?").
INSTRUCTION : Cherche le label en ANGLAIS (lang="en") pour maximiser les données techniques (masse, rayon, etc.), mais retourne toutes les propriétés (?property ?value). Remplace "terme_recherche" par le nom de l'étoile en minuscules.
MODÈLE :
SELECT DISTINCT ?property ?value
WHERE {
    ?star rdf:type dbo:Star ;
          rdfs:label ?label .
    FILTER (contains(LCASE(?label), "terme_recherche"))
    FILTER (lang(?label) = "en")
    ?star ?property ?value .
}

### RÈGLES DE SORTIE
1. Identifie le CAS correspondant à la demande.
2. Si la demande nécessite un filtre (nom de constellation), adapte le CAS correspondant.
3. Retourne UNIQUEMENT le code SPARQL brut. Pas de markdown (```), pas de bla-bla ou commentaires.

Produis uniquement le code SPARQL. Commence directement par "PREFIX" ou "SELECT".
"""

    response = client.chat.completions.create(
        model="llama3:70b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ],
        temperature=0.1
    )

    return response.choices[0].message.content