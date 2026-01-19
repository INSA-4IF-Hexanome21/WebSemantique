async function getPlanets() {
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("planeteButton").replaceChildren();
    document.getElementById("planeteButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-planets");
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (list.length === 0) {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }
    else{
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia (${list.length} résultats)`;
        resultList.innerHTML = "";
        
         list.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = item["uri"];
            link.textContent = `${item["name"]} (${item["type"]})`; // plus lisible
            link.title = `${item["name"]} (${item["type"]})`;
            link.target = "_blank";

            li.appendChild(link);
            resultList.appendChild(li);
        });
    }

    document.getElementById("planeteButton").replaceChildren();
    document.getElementById("planeteButton").textContent = "Listez toutes les planètes";
}

async function getMoons() {

    var type = document.getElementById("listLune").value;
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("luneButton").replaceChildren();
    document.getElementById("luneButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-moons?type="+type);
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (list.length === 0) {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }
    else{
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia (${list.length} résultats)`;
        resultList.innerHTML = "";
        
         list.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = item["uri"];
            link.textContent = `${item["name"]} (${item["planet"]})`; // plus lisible
            link.title = `${item["name"]} (${item["planet"]})`;
            link.target = "_blank";

            li.appendChild(link);
            resultList.appendChild(li);
        });
    }

    document.getElementById("luneButton").replaceChildren();
    document.getElementById("luneButton").textContent = "Listez toutes les lunes";
}