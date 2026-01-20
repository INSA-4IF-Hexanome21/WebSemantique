async function getArtificialSatellites() {
    document.getElementById("divReponseGraphique").hidden = true;
    document.getElementById("divReponseTextuelle").hidden = false;
    document.getElementById("artificialSatellitesButton").innerHTML = '<span class="spinner-grow text-light" ></span>';
    const response = await fetch("http://127.0.0.1:8000/api/get-artificial-satellites");
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (list.length !== 0 ) {
        document.getElementById("result-header").innerHTML  = ` Résultats DBpedia (${list.length} résultats)` ;

        resultList.innerHTML = "";

        list.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            const button = document.createElement("button");

            link.href = item["uri"];
            link.textContent = item["name"]; // plus lisible
            link.title = item["name"];
            link.target = "_blank";

            button.id = item["name"];
            button.textContent = "+";
            button.className = "btn btn-sm btn-outline-primary mx-2";
            button.onclick = function() {
                getGraph(item["name"]);
            };

            li.appendChild(link);
            li.appendChild(button)
            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }
    document.getElementById("artificialSatellitesButton").innerHTML = "Listez tous les satellites artificiels";
    
}

async function getNaturalSatellites() {
    document.getElementById("divReponseGraphique").hidden = true;
    document.getElementById("divReponseTextuelle").hidden = false;
    document.getElementById("naturalSatellitesButton").innerHTML = '<span class="spinner-grow text-light" ></span>';

    const response = await fetch("http://127.0.0.1:8000/api/get-natural-satellites");
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (list.length !== 0 ) {
        document.getElementById("result-header").innerHTML  = ` Résultats DBpedia (${list.length} résultats)` ;

        resultList.innerHTML = "";

        list.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            const button = document.createElement("button");

            link.href = item["uri"];
            link.textContent = item["name"]; // plus lisible
            link.title = item["name"];
            link.target = "_blank";

            button.id = item["name"];
            button.textContent = "+";
            button.className = "btn btn-sm btn-outline-primary mx-2";
            button.onclick = function() {
                getGraph(item["name"]);
            };

            li.appendChild(link);
            li.appendChild(button)
            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }
    document.getElementById("naturalSatellitesButton").innerHTML = "Listez tous les satellites naturels";

}

async function getAllSatellites() {
    document.getElementById("divReponseGraphique").hidden = true;
    document.getElementById("divReponseTextuelle").hidden = false;
    document.getElementById("allSatellitesButton").innerHTML = '<span class="spinner-grow text-light" ></span>';

    const response = await fetch("http://127.0.0.1:8000/api/get-satellites");
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (list.length !== 0 ) {
        document.getElementById("result-header").innerHTML  = ` Résultats DBpedia (${list.length} résultats)` ;

        resultList.innerHTML = "";

        list.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            const button = document.createElement("button");

            link.href = item["uri"];
            link.textContent = item["name"]; // plus lisible
            link.title = item["name"];
            link.target = "_blank";

            button.id = item["name"];
            button.textContent = "+";
            button.className = "btn btn-sm btn-outline-primary mx-2";
            button.onclick = function() {
                getGraph(item["name"]);
            };

            li.appendChild(link);
            li.appendChild(button)
            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }

    document.getElementById("allSatellitesButton").innerHTML = "Listez tous les satellites";
}
