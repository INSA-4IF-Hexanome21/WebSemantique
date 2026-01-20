async function drawStarsGraph(constellationName, starsList) {
    const container = document.getElementById("graph");
    if (!container) return;

    // Limpiar lo que haya antes
    container.innerHTML = "";

    const width = container.clientWidth || 800;
    const height = 500;

    // 1. Transformar los datos de tu API al formato de D3
    // El nodo central es la Constelación
    const nodes = [{ id: constellationName, type: "constellation", label: constellationName }];
    const links = [];

    // Los nodos hijos son las estrellas de la lista
    starsList.forEach(starName => {
        nodes.push({ id: starName, type: "star", label: starName });
        links.append({ source: constellationName, target: starName });
    });

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("background", "#0b1020")
        .style("border-radius", "10px");

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .attr("stroke", "#444")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(d3.drag()
            .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle")
        .attr("r", d => d.type === "constellation" ? 15 : 6)
        .attr("fill", d => d.type === "constellation" ? "#ffcc00" : "#4fc3f7")
        .attr("stroke", "#fff");

    node.append("text")
        .attr("dy", d => d.type === "constellation" ? -20 : 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "10px")
        .text(d => d.label);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
}