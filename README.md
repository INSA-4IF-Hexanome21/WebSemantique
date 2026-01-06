# WebSemantique - Espace
Ce projet vise à concevoir une application intelligente capable de naviguer dans le Web de données (Linked Data), d'en extraire des structures complexes et d'utiliser l'IA générative pour offrir une expérience utilisateur augmentée.

# Objectifs:
1. Objectif général

Créer une interface d’exploration sémantique et relationnelle des corps célestes à partir de DBpedia, permettant à l’utilisateur de comprendre, naviguer et analyser les relations astronomiques au-delà d’une simple recherche textuelle.
La page doit valoriser la richesse du Web de données (Linked Open Data) en révélant :
  -les types de corps célestes,
  -leurs propriétés physiques et astronomiques,
  -leurs relations hiérarchiques et spatiales
  -les liens sémantiques entre entités.

2. Ce que la page web cherche à classer

  La page vise à organiser et classifier les entités de type dbo:CelestialBody, selon plusieurs axes :
  
  2.1 Classification hiérarchique 
  
    Exploiter la hiérarchie DBpedia :
    
    Corps Céléste
    Etoiles
    Planettes
    Satellites
    Asteroïdes
    Galaxies
    Nebuleuse
    Constellations
    Essaims
  
  2.2 Classification par propriétés physiques et astronomiques
  
    Regrouper et filtrer les corps célestes selon leurs attributs DBpedia, par exemple :
      Magnitude (absolue / apparente)
      Excentricité orbitale
      Distance focale (periapsis / apoapsis)
      Classification stellaire
      Constellation d’appartenance
      Date de découverte

3. Relations que la page web souhaite mettre en évidence
  3.1 Relations hiérarchiques

    rdfs:subClassOf → lien entre types de corps célestes

  3.2 Relations spatiales et astronomiques
  
    Appartenance à une constellation
    Lien entre étoile et exoplanète
    Satellite ↔ planète
    Corps céleste ↔ galaxie / nébuleuse

  3.3 Relations de similarité
  
    Similarité entre étoiles (classification, magnitude)
    Similarité entre exoplanètes (orbite, étoile hôte)
    Similarité entre galaxies (type, taille, distance)

4. Ce que la page web présente concrètement

  4.1 Vue “Exploration”
  
  Liste interactive de corps célestes
  Filtres par type (Star, Planet, etc.)
  Recherche sémantique (par propriétés, pas seulement par nom)

  4.2 Vue “Détails d’un corps céleste”
  
  Pour une entité donnée (ex : Kepler-47c) :
  Type ontologique
  Propriétés physiques
  Relations avec d’autres corps célestes
  Liens DBpedia/Wikipedia

  4.3 Vue “Graphes & réseaux”
  
  Visualisation sous forme de graphe :
  Nœuds : corps célestes
  Arêtes : relations (orbite, appartenance, similarité)


5. Objectifs analytiques (Web sémantique & Data Analysis)

  Exploiter des requêtes SPARQL complexes
  agrégations (nombre de planètes par étoile)
  filtres numériques
  chemins de propriétés
  Construire un modèle de données compréhensible
  Transformer des données brutes en connaissances interprétables

6. Objectif pédagogique et utilisateur

  La page web doit :
  Montrer comment le Web sémantique structure la connaissance astronomique
  Aider un utilisateur non expert à explorer un graphe de connaissances
  Illustrer l’intérêt de DBpedia face à une base de données classique


# Lien corps céleste
https://dbpedia.org/ontology/CelestialBody
