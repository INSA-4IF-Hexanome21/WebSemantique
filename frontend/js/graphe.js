
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

