/**
 * graphe.js - Visualisation RDF avec D3.js Force Simulation
 */

let simulation = null;
let svg = null;
let g = null;
let currentData = null;
let activeFilters = new Set();
let renderer = null;

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
    label: "Base",
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

  container.innerHTML = `
    <div class="d-flex flex-wrap gap-3 align-items-center">
      <div class="fw-bold text-white">Filtres :</div>
      <div class="d-flex flex-wrap gap-3" id="filterCheckboxes"></div>
      <div class="ms-auto d-flex align-items-center gap-2">
        <label class="text-white small mb-0">Séparation:</label>
        <input type="range" class="form-range" style="width: 150px;" 
               id="distanceSlider" min="50" max="300" value="150" step="10">
        <span class="text-white small" id="distanceValue">150</span>
      </div>
    </div>
  `;

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

  const slider = document.getElementById("distanceSlider");
  const valueDisplay = document.getElementById("distanceValue");

  if (slider && valueDisplay) {
    slider.addEventListener("input", (e) => {
      valueDisplay.textContent = e.target.value;
      if (simulation) {
        simulation.force("link").distance(parseInt(e.target.value));
        simulation.alpha(0.3).restart();
      }
    });
  }
}

/**
 * Applique les filtres sur le graphe
 */
function appliquerFiltres() {
  if (!currentData || !svg) return;

  svg.selectAll(".node").style("display", (d) => {
    const categorie = d.categorie || "autres";
    return activeFilters.has(categorie) ? "none" : "block";
  });

  svg.selectAll(".link").style("display", (d) => {
    const sourceCategorie = d.source.categorie || "autres";
    const targetCategorie = d.target.categorie || "autres";
    return activeFilters.has(sourceCategorie) ||
      activeFilters.has(targetCategorie)
      ? "none"
      : "block";
  });
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
async function getStarGraph(name) {
  document.getElementById("divReponseGraphique").hidden = false;
  const container = document.getElementById("graph-container");
  const titleTxt = document.getElementById("starTitle");
  const descTxt = document.getElementById("starDescription");

  if (!container) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/get-star-details?name=${encodeURIComponent(
        name
      )}`
    );
    const json = await response.json();
    const rdfData = json["output"];

    let foundThumb = null;
    let foundDesc = null;
    let shortDesc = null;

    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    Object.entries(rdfData).forEach(([subject, predicates]) => {
      if (!nodeMap.has(subject)) {
        const node = {
          id: subject,
          label: nettoyerLabel(subject),
          size: 30,
          color: "#e74c3c",
          categorie: "identite",
          nodePrincipal: true,
        };
        nodes.push(node);
        nodeMap.set(subject, node);
      }

      Object.entries(predicates).forEach(([predicate, objects]) => {
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

          if (!nodeMap.has(objectId)) {
            const isUri = obj.type === "uri";
            const node = {
              id: objectId,
              label: nettoyerLabel(obj.value, 45),
              size: isUri ? 18 : 12,
              color: isUri ? "#3498db" : "#95a5a6",
              categorie: categorie,
              estUri: isUri,
            };
            nodes.push(node);
            nodeMap.set(objectId, node);
          }

          links.push({
            source: subject,
            target: objectId,
            label: predLabel,
            color: categorieConfig.color,
            categorie: categorie,
          });
        });
      });
    });

    currentData = { nodes, links };

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

    container.innerHTML = "";

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#fff");

    svg
      .append("defs")
      .selectAll("marker")
      .data(Object.values(PREDICAT_CATEGORIES))
      .enter()
      .append("marker")
      .attr("id", (d) => `arrow-${d.color.substring(1)}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", (d) => d.color);

    g = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => d.size + 10));

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", (d) => `url(#arrow-${d.color.substring(1)})`);

    const linkLabel = g
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("class", "link-label")
      .attr("font-size", 10)
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .text((d) => d.label);

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    node
      .append("text")
      .attr("dx", (d) => d.size + 5)
      .attr("dy", 5)
      .attr("font-size", 14)
      .attr("font-weight", "600")
      .attr("fill", "#000")
      .text((d) => d.label)
      .style("pointer-events", "none");

    node.on("mouseenter", function (event, d) {
      d3.select(this).select("circle").attr("stroke-width", 4);
    });

    node.on("mouseleave", function (event, d) {
      d3.select(this).select("circle").attr("stroke-width", 2);
    });

    node.on("click", function (event, d) {
      console.log("Nœud cliqué:", d);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      linkLabel
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const resetBtn = document.getElementById("resetZoomButton");
    if (resetBtn) {
      resetBtn.onclick = () => {
        svg
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      };
    }

    const fullscreenBtn = document.getElementById("fullscreenButton");
    const graphWrapper = document.querySelector(".graph-wrapper");
    if (fullscreenBtn && graphWrapper) {
      fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
          graphWrapper.requestFullscreen().catch((err) => {
            console.error(`Erreur fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      };
    }
  } catch (error) {
    console.error("Erreur lors du chargement du graphe:", error);
    if (descTxt) {
      descTxt.textContent =
        "Erreur lors du chargement des données DBpedia.";
    }
  }
}

/**
 * Graphe des lunes (Sigma.js)
 */
async function getLunesGraph(list) {
  document.getElementById("divReponseGraphique").hidden = false;
  console.log("Entrée dans le graph");

  const graph = new graphology.Graph();

  Object.entries(list).forEach(([id, lune]) => {
    if (!graph.hasNode(lune.name)) {
      graph.addNode(lune.name, {
        label: lune.name,
        x: Math.random(),
        y: Math.random(),
        size: 5,
        color: "#2ECC40",
      });
    }

    if (!graph.hasNode(lune.planet)) {
      graph.addNode(lune.planet, {
        label: lune.planet,
        x: Math.random(),
        y: Math.random(),
        size: 10,
        color: "#2e55ccff",
      });
    }

    if (!graph.hasEdge(lune.planet, lune.name)) {
      graph.addEdge(lune.planet, lune.name);
    }
  });

  const container = document.getElementById("graph-container");
  if (renderer) {
    container.innerHTML = "";
  }
  renderer = new Sigma(graph, container);
}

/**
 * Graphe d'une constellation (Sigma.js)
 */
async function showConstellationGraph(stars) {
  const container = document.getElementById("graph-container");
  container.innerHTML = "";

  const graph = new graphology.Graph({ multi: true });

  const centerX = 0;
  const centerY = 0;
  const radius = 10;
  const angleStep = (2 * Math.PI) / stars.length;

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const starId = star.uri;
    const angle = i * angleStep;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    graph.addNode(starId, {
      label: star.name,
      x,
      y,
      size: 8,
      color: "#FFD700",
    });

    const response = await fetch(
      `http://127.0.0.1:8000/api/get-star-details?name=${encodeURIComponent(
        star.name
      )}`
    );
    const json = await response.json();

    if (!json.output) continue;

    const rdfData = json.output;

    Object.entries(rdfData).forEach(([subject, predicates]) => {
      Object.entries(predicates).forEach(([predicate, objects]) => {
        objects.forEach((obj, index) => {
          const objId =
            obj.type === "uri"
              ? obj.value
              : `${starId}-${predicate}-${index}`;

          if (!graph.hasNode(objId)) {
            graph.addNode(objId, {
              label:
                obj.type === "uri"
                  ? obj.value.split("/").pop()
                  : obj.value,
              x: x + Math.random() * 2 - 1,
              y: y + Math.random() * 2 - 1,
              size: obj.type === "uri" ? 5 : 3,
              color: obj.type === "uri" ? "#2ECC40" : "#FF851B",
            });
          }

          graph.addEdge(starId, objId, {
            label: predicate.split("/").pop(),
          });
        });
      });
    });
  }

  renderer = new Sigma(graph, container);
  console.log("Constellation RDF graph rendered");
}

/**
 * Bouton viewAllGraph
 */
const viewAllGraphButton = document.getElementById("viewAllGraphButton");
if (viewAllGraphButton) {
  viewAllGraphButton.addEventListener("click", () => {
    if (renderer) {
      renderer.getCamera().animatedReset({ duration: 500 });
    } else {
      console.error("Renderer is not initialized.");
    }
  });
}
