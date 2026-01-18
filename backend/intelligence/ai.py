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

    response = client.chat.completions.create(
        model="llama3:70b",
        messages=[
            {"role": "system", "content": "Tu es un traducteur de requêtes plein texte vers SPARQL. Tu n'utilises que DBPEDIA. Tu connais que des éléments de modèle suivant : <https://dbpedia.org/ontology/CelestialBody>. Tu ne dois répondre qu'en SPARQL, aucun texte, aucune explication en sus. Assure toi que la requête SPARQL est syntaxiquement juste."},
            {"role": "user", "content": content}
        ],
        temperature=0.7
    )

    return response.choices[0].message.content

# print(ask_AI("Quels sont les films de genre Drama ?"))