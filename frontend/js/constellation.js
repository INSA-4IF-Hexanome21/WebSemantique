async function getConstellations(obj) {
    obj.setAttribute("onclick", "");
    obj.replaceChildren();
    const response = await fetch("http://127.0.0.1:8000/api/get-constellations");
    const json = await response.json();
    var list = json["output"];
    list.forEach(function(item) {
        var option = document.createElement("option");
        option.value = item;
        option.text = item;
        obj.appendChild(option);
    });
}

async function getStarsInConstellation() {
    document.getElementById("divReponse").hidden = false;
    document.getElementById("divReponseGraphique").hidden = false;
    document.getElementById("divReponseTextuelle").hidden = false;
    var nomConstellation = document.getElementById("listConstellations").value;
    document.getElementById("constellationsButton").textContent = "";
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars-in-constellation?name=" + nomConstellation);
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");
    console.log(list)

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
                getStarGraph(item["name"]);
            };

            li.appendChild(link);
            li.appendChild(button)
            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }

    showConstellationGraph(list);

    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").textContent = "Trouvez les étoiles de votre constellation";
}

async function getStars() {
    document.getElementById("divReponse").hidden = false;
    document.getElementById("divReponseGraphique").hidden = true;
    document.getElementById("divReponseTextuelle").hidden = false;
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("starButton").replaceChildren();
    document.getElementById("starButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars");
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
            const button = document.createElement("button");

            link.href = item["uri"];
            link.textContent = item["name"]; // plus lisible
            link.title = item["name"];
            link.target = "_blank";
            
            button.id = item["name"];
            button.textContent = "+";
            button.className = "btn btn-sm btn-outline-primary mx-2";
            button.onclick = function() {
                getStarGraph(item["name"]);
            };

            li.appendChild(link);
            resultList.appendChild(li);
        });
    }

    document.getElementById("starButton").replaceChildren();
    document.getElementById("starButton").textContent = "Listez toutes les étoiles";
    getThermicGraph(list);
}

async function getStarsInSameConstellation() {
    document.getElementById("error").hidden = true;
    var nomEtoile = document.getElementById("inputStarInConstellation").value;
    if (nomEtoile === ""){
        document.getElementById("error").textContent = "Veuillez saisir un nom d'étoile";
        document.getElementById("error").hidden = false;
        return;
    }
    
    document.getElementById("divReponse").hidden = false;
    document.getElementById("divReponseGraphique").hidden = true;
    document.getElementById("divReponseTextuelle").hidden = false;
    document.getElementById("buttonStarInConstellation").textContent = "";
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("buttonStarInConstellation").replaceChildren();
    document.getElementById("buttonStarInConstellation").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars-in-same-constellation?name="+nomEtoile);
    const json = await response.json();
    var list = json["output"];

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");
    
    var text = "";
    if (list.length === 0) {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia`;
    }
    else{
        
        var constellationName = ""
        document.getElementById("result-header").innerHTML = ` Résultats DBpedia (${list.length} résultats)` ;
        resultList.innerHTML = "";
        
        list.forEach(item => {
            var newConstellationName = item["constellation"]
            if(newConstellationName != constellationName){

                constellationName = newConstellationName

                const li = document.createElement("li");
                const link = document.createElement("a");
                const button = document.createElement("button");

                link.href = item["uriConstellation"];
                link.textContent = constellationName + "(Constellation)"; // plus lisible
                link.title = constellationName;
                link.target = "_blank";

                li.appendChild(link);
                resultList.appendChild(li);

                
            }

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
                getStarGraph(item["name"]);
            };

            li.appendChild(link);
            li.appendChild(button)
            resultList.appendChild(li);
        });
    
    }

    document.getElementById("buttonStarInConstellation").replaceChildren();
    document.getElementById("buttonStarInConstellation").textContent = "Repérez ton étoile dans sa constellation";
}