
const fullscreenButton = document.getElementById("fullscreenButton");
const viewAllGraphButton = document.getElementById("viewAllGraphButton");
const graphWrapper = document.querySelector(".graph-wrapper");
let renderer = null;

fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        graphWrapper.requestFullscreen().catch(err => {
            console.error(`Erreur fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

viewAllGraphButton.addEventListener("click", () => {
    if (renderer) {
        renderer.getCamera().animatedReset({ duration: 500 });
    } else {
        console.error("Renderer is not initialized.");
    }
});

async function getSatellitesGraph() {
    const satellites = await fetch("http://127.0.0.1:8000/api/get-satellites").then(res => res.json());

    const graph = new graphology.Graph();

    Object.entries(satellites["output"]).forEach(([id, satellite]) => {
        if (!graph.hasNode(satellite.uri)) {
            graph.addNode(satellite.uri, {
                label: satellite.uri,
                x: Math.random(),
                y: Math.random(),
                size: 5,
                color: "#2ECC40"
            });
        }

        if (!graph.hasNode(satellite.name)) {
            graph.addNode(satellite.name, {
                label: satellite.name,
                x: Math.random(),
                y: Math.random(),
                size: 5,
                color: "#2e55ccff"
            });
        }

        if (!graph.hasEdge(satellite.uri, satellite.name)) {
            graph.addEdge(satellite.uri, satellite.name);
        }
    });

    const container = document.getElementById("graph-container");
    if (renderer) {
        container.innerHTML = "";
    }
    renderer = new Sigma(graph, container);
}

async function getGraph(name) {
    const data = await fetch("http://127.0.0.1:8000/api/get-star-details?name="+name)
        .then(res => res.json());

    const graph = new graphology.Graph({ multi: true });
    const rdfData = data["output"];
    console.log(rdfData);

    Object.entries(rdfData).forEach(([subject, predicat]) => {
        console.log("Subject:", subject);
        if (!graph.hasNode(subject)){
            graph.addNode(subject, {
                label: subject.split("/").pop(),
                x: Math.random(),
                y: Math.random(),
                size: 8,
                color: "#FF4136"
            });
        }
        Object.entries(predicat).forEach(([predicate, objects]) => {
            objects.forEach( (obj, index) => {
                const objectId = obj.type === "uri" ? obj.value : `${subject}-${predicate}-${index}`;
                if (!graph.hasNode(objectId)) {
                    graph.addNode(objectId, {
                        label: obj.value,
                        x: Math.random(),
                        y: Math.random(),
                        size: obj.type === "uri" ? 6 : 4,
                        color: obj.type === "uri" ? "#2ECC40" : "#FF851B"
                    });
                }
                graph.addEdge(subject, objectId, { label: predicate.split("/").pop() });
            });;
        });
  
    });

    const container = document.getElementById("graph-container");
    if (renderer) {
        container.innerHTML = "";
    }
    renderer = new Sigma(graph, container);
    console.log("Graph rendered");
};

async function getLunesGraph(list) {

    console.log("Entrée dans le graph")
    const graph = new graphology.Graph();

    Object.entries(list).forEach(([id, lune]) => {
        if (!graph.hasNode(lune.name)) {
            graph.addNode(lune.name, {
                label: lune.name,
                x: Math.random(),
                y: Math.random(),
                size: 5,
                color: "#2ECC40"
            });
        }

        if (!graph.hasNode(lune.planet)) {
            graph.addNode(lune.planet, {
                label: lune.planet,
                x: Math.random(),
                y: Math.random(),
                size: 10,
                color: "#2e55ccff"
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