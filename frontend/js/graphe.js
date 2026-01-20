/**
 * graphe.js - Gestion avancée de la visualisation RDF avec Sigma.js
 */

let renderer = null;
let currentGraph = null;
let activeFilters = new Set();

// Configuration des catégories de prédicats
const PREDICAT_CATEGORIES = {
  identite: {
    label: "Identité",
    color: "#e74c3c",
    predicats: [
      "name",
      "label",
      "title",
      "givenName",
      "familyName",
      "designation",
    ],
  },
  astronomie: {
    label: "Astronomie",
    color: "#3498db",
    predicats: [
      "constellation",
      "magnitude",
      "distance",
      "temperature",
      "apparentMagnitude",
      "celestialBody",
      "spectralType",
    ],
  },
  classification: {
    label: "Classification",
    color: "#2ecc71",
    predicats: ["type", "category", "class", "subject", "isPartOf"],
  },
  description: {
    label: "Description",
    color: "#f39c12",
    predicats: ["comment", "abstract", "description", "summary"],
  },
  relations: {
    label: "Relations",
    color: "#9b59b6",
    predicats: [
      "sameAs",
      "seeAlso",
      "relatedTo",
      "wikiPageWikiLink",
      "isPrimaryTopicOf",
    ],
  },
  autres: {
    label: "Autres",
    color: "#95a5a6",
    predicats: [],
  },
};

/**
 * Détermine la catégorie d'un prédicat
 */
function getCategoriePredicat(predicat) {
  const pred = String(predicat).toLowerCase();
  for (const [key, cat] of Object.entries(PREDICAT_CATEGORIES)) {
    if (
      key !== "autres" &&
      cat.predicats.some((p) => pred.includes(p.toLowerCase()))
    ) {
      return key;
    }
  }
  return "autres";
}

/**
 * Crée les contrôles de filtrage horizontaux
 */
function creerControlesFiltre() {
  const container = document.getElementById("graphControls");
  if (!container) return;

  container.innerHTML =
    '<div class="fw-bold mb-2 text-white">Filtres :</div><div class="d-flex flex-wrap gap-3" id="filterCheckboxes"></div>';

  const checkboxContainer = document.getElementById("filterCheckboxes");

  Object.entries(PREDICAT_CATEGORIES).forEach(([key, cat]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-check form-switch";

    const checkbox = document.createElement("input");
    checkbox.className = "form-check-input";
    checkbox.type = "checkbox";
    checkbox.id = `filter-${key}`;
    checkbox.checked = true;
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        activeFilters.delete(key);
      } else {
        activeFilters.add(key);
      }
      appliquerFiltres();
    });

    const label = document.createElement("label");
    label.className = "form-check-label text-white small";
    label.htmlFor = `filter-${key}`;
    label.innerHTML = `<span class="d-inline-block rounded-circle me-1" style="width: 10px; height: 10px; background: ${cat.color};"></span> ${cat.label}`;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    checkboxContainer.appendChild(wrapper);
  });
}

/**
 * Applique les filtres sur le graphe
 */
function appliquerFiltres() {
  if (!currentGraph || !renderer) return;

  currentGraph.forEachNode((node, attributes) => {
    const categorie = attributes.categorie || "autres";
    const estCache = activeFilters.has(categorie);
    currentGraph.setNodeAttribute(node, "hidden", estCache);
  });

  currentGraph.forEachEdge((edge, attributes, source, target) => {
    const sourceCache = currentGraph.getNodeAttribute(source, "hidden");
    const targetCache = currentGraph.getNodeAttribute(target, "hidden");
    currentGraph.setEdgeAttribute(edge, "hidden", sourceCache || targetCache);
  });

  renderer.refresh();
}

/**
 * Nettoie et formate un label
 */
function nettoyerLabel(texte, maxLength = 50) {
  let label = String(texte || "");

  if (label.includes("/")) {
    label = label.split("/").pop();
  }
  if (label.includes("#")) {
    label = label.split("#").pop();
  }

  label = label.replace(/_/g, " ");
  label = label.replace(/([a-z])([A-Z])/g, "$1 $2");

  if (label.length > 0) {
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  if (label.length > maxLength) {
    label = label.substring(0, maxLength - 3) + "...";
  }

  return label;
}

/**
 * Gère l'affichage de l'image
 */
function gererAffichageImage(thumbnailUrl) {
  const thumbImg = document.getElementById("starThumbnail");
  const imageContainer = document.getElementById("starImageContainer");

  if (thumbnailUrl && thumbImg) {
    thumbImg.src = thumbnailUrl;
    thumbImg.style.display = "block";
    if (imageContainer) {
      imageContainer.style.display = "block";
    }
  } else {
    if (thumbImg) {
      thumbImg.style.display = "none";
    }
    if (imageContainer) {
      imageContainer.style.display = "none";
    }
  }
}

/**
 * Fonction principale pour récupérer et afficher le graphe
 */
async function getGraph(name) {
  const container = document.getElementById("graph-container");
  const titleTxt = document.getElementById("starTitle");
  const descTxt = document.getElementById("starDescription");

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/get-star-details?name=${encodeURIComponent(
        name
      )}`
    );
    const json = await response.json();
    const rdfData = json["output"];

    const graph = new graphology.Graph({ multi: true });
    currentGraph = graph;

    let foundThumb = null;
    let foundDesc = null;
    let shortDesc = null;

    // Construction du graphe
    Object.entries(rdfData).forEach(([subject, predicates]) => {
      if (!graph.hasNode(subject)) {
        graph.addNode(subject, {
          label: nettoyerLabel(subject),
          x: Math.random() * 1000 - 500,
          y: Math.random() * 1000 - 500,
          size: 25,
          color: "#e74c3c",
          categorie: "identite",
          nodePrincipal: true,
        });
      }

      Object.entries(predicates).forEach(([predicate, objects]) => {
        // Gestion thumbnail
        if (String(predicate).includes("thumbnail")) {
          const thumbValue = objects[0]?.value;
          if (thumbValue) {
            foundThumb = String(thumbValue).replace(
              "width=300",
              "width=1000"
            );
          }
          return;
        }

        // Gestion descriptions
        const predicatLower = String(predicate).toLowerCase();
        if (predicatLower.includes("description")) {
          const d =
            objects.find((o) => o.lang === "fr") ||
            objects.find((o) => o.lang === "en") ||
            objects[0];
          if (d?.value) shortDesc = String(d.value);
        }

        if (
          predicatLower.includes("abstract") ||
          predicatLower.includes("comment")
        ) {
          const d =
            objects.find((o) => o.lang === "fr") ||
            objects.find((o) => o.lang === "en") ||
            objects[0];
          if (
            d?.value &&
            (!foundDesc || String(d.value).length > foundDesc.length)
          ) {
            foundDesc = String(d.value);
          }
          return;
        }

        // Déterminer catégorie
        const categorie = getCategoriePredicat(predicate);
        const categorieConfig = PREDICAT_CATEGORIES[categorie];

        const predLabel = nettoyerLabel(
          String(predicate).split("/").pop().split("#").pop(),
          35
        );

        objects.forEach((obj, index) => {
          const objectId =
            obj.type === "uri"
              ? obj.value
              : `${subject}-${predicate}-${index}`;

          if (!graph.hasNode(objectId)) {
            let label = nettoyerLabel(obj.value, 45);

            const isUri = obj.type === "uri";
            const nodeSize = isUri ? 15 : 10;
            const nodeColor = isUri ? "#3498db" : "#95a5a6";

            graph.addNode(objectId, {
              label: label,
              x: Math.random() * 1000 - 500,
              y: Math.random() * 1000 - 500,
              size: nodeSize,
              color: nodeColor,
              categorie: categorie,
              estUri: isUri,
            });
          }

          try {
            graph.addEdge(subject, objectId, {
              label: predLabel,
              size: 1.5,
              color: categorieConfig.color,
              categorie: categorie,
            });
          } catch (e) {
            // Arête déjà existante
          }
        });
      });
    });

    // Mise à jour UI
    if (titleTxt) titleTxt.textContent = name;
    if (descTxt) {
      descTxt.textContent =
        foundDesc ||
        shortDesc ||
        "Aucune description disponible sur DBpedia.";
    }

    gererAffichageImage(foundThumb);
    creerControlesFiltre();
    activeFilters.clear();

    // Centrer le nœud principal avant ForceAtlas2
    const mainNode = graph.nodes().find(
      (n) => graph.getNodeAttribute(n, "nodePrincipal") === true
    );
    if (mainNode) {
      graph.setNodeAttribute(mainNode, "x", 0);
      graph.setNodeAttribute(mainNode, "y", 0);
    }

    // Application du layout ForceAtlas2 avec PLUS D'ESPACE
    if (window.graphologyLibrary && window.graphologyLibrary.layout) {
      graphologyLibrary.layout.forceatlas2.assign(graph, {
        iterations: 500,
        settings: {
          gravity: 0.3,
          scalingRatio: 200,
          strongGravityMode: false,
          barnesHutOptimize: true,
          barnesHutTheta: 0.5,
          slowDown: 8,
          linLogMode: false,
          adjustSizes: true,
          edgeWeightInfluence: 0.5,
          outboundAttractionDistribution: true,
        },
      });
    }

    // Rendu avec Sigma
    if (renderer) renderer.kill();
    renderer = new Sigma(graph, container, {
      renderEdgeLabels: true,
      labelSize: 16,
      labelWeight: "600",
      edgeLabelSize: 11,
      labelFont: "Inter, Arial, sans-serif",
      labelColor: { color: "#000" },
      labelRenderedSizeThreshold: 0.1,
      defaultNodeColor: "#999",
      defaultEdgeColor: "#ccc",
      minCameraRatio: 0.05,
      maxCameraRatio: 15,
      zoomDuration: 600,
    });

    setTimeout(() => {
      const nodes = graph.nodes();
      if (nodes.length === 0) return;

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      graph.forEachNode((node, attr) => {
        if (attr.x < minX) minX = attr.x;
        if (attr.x > maxX) maxX = attr.x;
        if (attr.y < minY) minY = attr.y;
        if (attr.y > maxY) maxY = attr.y;
      });

      renderer.getCamera().animate(
        {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
          ratio: 1.2,
        },
        { duration: 1000 }
      );
    }, 200);

    // Eventos de contrôle
    const resetBtn = document.getElementById("resetZoomButton");
    if (resetBtn) {
      resetBtn.onclick = () => {
        renderer.getCamera().animate(
          { x: 0, y: 0, ratio: 0.8 },
          { duration: 800 }
        );
      };
    }

    const fullscreenBtn = document.getElementById("fullscreenButton");
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => {
        const elem = container.parentElement.parentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      };
    }

    // Interaction au clic sur un nœud
    renderer.on("clickNode", ({ node }) => {
      const attrs = graph.getNodeAttributes(node);
      console.log("Nœud cliqué:", node, attrs);

      const nodeDisplayData = renderer.getNodeDisplayData(node);
      if (nodeDisplayData) {
        renderer.getCamera().animate(
          {
            x: nodeDisplayData.x,
            y: nodeDisplayData.y,
            ratio: 0.15,
          },
          { duration: 500 }
        );
      }
    });

    // Hover effect
    renderer.on("enterNode", ({ node }) => {
      container.style.cursor = "pointer";
    });

    renderer.on("leaveNode", () => {
      container.style.cursor = "default";
    });
  } catch (error) {
    console.error("Erreur lors du chargement du graphe:", error);
    if (descTxt) {
      descTxt.textContent =
        "Erreur lors du chargement des données DBpedia.";
    }
  }
}