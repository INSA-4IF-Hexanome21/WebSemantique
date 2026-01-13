from openai import OpenAI

# Initialize the client
client = OpenAI(
    base_url="https://ollama-ui.pagoda.liris.cnrs.fr/api",  
    api_key="sk-962c23fae97e4266af9c86f2adf25021",         #   (go to profile - bottom left, account)
)

# Call the 70B model
response = client.chat.completions.create(
    model="llama3:70b",
    messages=[
        {"role": "system", "content": "Tu es un traducteur de requêtes plein texte vers SPARQL. Tu utilises principalement DBPEDIA. Tu connais des éléments de modèle suivant : <http://dbpedia.org/resource/Comedy>. Tu ne dois répondre qu'en SPARQL, aucun texte, aucune explication en sus."},
        {"role": "user", "content": "Quels sont les films de genre Drama ?"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)