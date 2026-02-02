# WebSemantique - Espace

## Description

Ce projet vise à concevoir une application intelligente capable de naviguer dans le Web de données (Linked Data), d'en extraire des structures complexes et d'utiliser l'IA générative pour offrir une expérience utilisateur augmentée.

## Technologies

**Backend :**
- FastAPI (serveur web Python)
- SPARQLWrapper (requêtes SPARQL vers DBpedia)
- OpenAI API (IA générative pour traduction texte → SPARQL)
- Python 3.9+

**Frontend :**
- HTML/CSS/JavaScript
- Fichiers statiques servis par FastAPI

**Base de connaissances :**
- DBpedia (ontologie [CelestialBody](https://dbpedia.org/ontology/CelestialBody))

## Installation

### Prérequis
- Python 3.9 ou supérieur
- pip

### Installation automatique (multi-plateforme)

```bash
# Cloner le projet
git clone https://github.com/INSA-4IF-Hexanome21/WebSemantique-Espace.git
cd WebSemantique-Espace

# Installation et lancement
python3 main.py run
```

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `python3 main.py install` | Installe uniquement les dépendances |
| `python3 main.py dev` | Installe les dépendances et lance le serveur en mode développement avec auto-reload |
| `python3 main.py run` | Installe les dépendances et lance le serveur en mode production |
| `python3 main.py kill` | Tue le serveur |
| `Ctrl+C` | Arrête le serveur |

## Utilisation

Une fois le serveur démarré, accédez à :
- **Application web :** http://127.0.0.1:8000
- **Documentation API :** http://127.0.0.1:8000/docs
- **API alternative :** http://127.0.0.1:8000/redoc

## API Endpoints

### Format de réponse

Réponse valide :
```json
{
  "status": 1,
  "input": {...},
  "output": {...}
}
```

Erreur :
```json
{
  "status": 0,
  "input": {...},
  "output": {}
}
```

## Objectifs pédagogiques

## Objectifs pédagogiques

### 1. Objectif général
Créer une interface d’exploration sémantique et relationnelle des corps célestes à partir de **DBpedia**, permettant à l’utilisateur de comprendre, naviguer et analyser les relations astronomiques au-delà d’une simple recherche textuelle.

La page doit valoriser la richesse du **Web de données** (*Linked Open Data*) en révélant :
* Les types de corps célestes ;
* Leurs propriétés physiques et astronomiques ;
* Leurs relations hiérarchiques et spatiales ;
* Les liens sémantiques entre entités.

### 2. Ce que la page web cherche à classer
La page vise à organiser et classifier les entités de type `dbo:CelestialBody` selon plusieurs axes :

#### 2.1 Classification hiérarchique
Exploiter la hiérarchie DBpedia :
* Corps célestes
* Étoiles
* Planètes
* Satellites
* Astéroïdes
* Galaxies
* Nébuleuses
* Constellations
* Amas d'étoiles

#### 2.2 Classification par propriétés physiques et astronomiques
Regrouper et filtrer les corps célestes selon leurs attributs DBpedia, par exemple :
* **Magnitude** (absolue / apparente)
* **Excentricité orbitale**
* **Distance focale** (périapsis / apoapsis)
* **Classification stellaire**
* **Constellation d’appartenance**
* **Date de découverte**

### 3. Relations que la page web souhaite mettre en évidence

#### 3.1 Relations hiérarchiques
* `rdfs:subClassOf` : lien entre types de corps célestes.

#### 3.2 Relations spatiales et astronomiques
* Appartenance à une constellation ;
* Lien entre étoile et exoplanète ;
* Relation Satellite ↔ Planète ;
* Relation Corps céleste ↔ Galaxie / Nébuleuse.

#### 3.3 Relations de similarité
* **Entre étoiles :** classification, magnitude ;
* **Entre exoplanètes :** orbite, étoile hôte ;
* **Entre galaxies :** type, taille, distance.

### 4. Ce que la page web présente concrètement

#### 4.1 Vue « Exploration »
* Liste interactive de corps célestes ;
* Filtres par type (`Star`, `Planet`, etc.) ;
* Recherche sémantique (par propriétés et non seulement par nom).

#### 4.2 Vue « Détails d’un corps céleste »
Pour une entité donnée (ex : *Kepler-47c*) :
* Type ontologique ;
* Propriétés physiques ;
* Relations avec d’autres corps célestes ;
* Liens DBpedia / Wikipedia.

#### 4.3 Vue « Graphes & réseaux »
Visualisation sous forme de graphe :
* **Nœuds :** corps célestes ;
* **Arêtes :** relations (orbite, appartenance, similarité).

### 5. Objectifs analytiques (Web sémantique & Data Analysis)
* **Exploiter des requêtes SPARQL complexes :**
    * Agrégations (ex : nombre de planètes par étoile) ;
    * Filtres numériques ;
    * Chemins de propriétés.
* **Construire un modèle de données compréhensible :** transformer des données brutes en connaissances interprétables.

### 6. Objectif pédagogique et utilisateur
La page web doit :
* Montrer comment le Web sémantique structure la connaissance astronomique ;
* Aider un utilisateur non expert à explorer un graphe de connaissances ;
* Illustrer l’intérêt de DBpedia face à une base de données classique.
