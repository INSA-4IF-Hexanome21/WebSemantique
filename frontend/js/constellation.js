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
    var nomConstellation = document.getElementById("listConstellations").value;
    document.getElementById("constellationsButton").textContent = "";
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars-in-constellation?name=" + nomConstellation);
    const json = await response.json();
    var list = json["output"];
    var resultArea = document.getElementById("divReponseTextuelle");
    var textarea = document.createElement("textarea");
    var text = "";
    if (list.length === 0) {
        text += "Aucune étoile trouvée dans cette constellation.";
    }
    else{
        text += `Étoiles dans la constellation ${nomConstellation}  :

`;
        text += "\nNombre total d'étoiles : " + (list.length - 1).toString() + "\n";
        list.forEach(function(item) {
            text += item["name"] + " : " + item["uri"] + "\n";
        }
        );
        
    }
    
    textarea.textContent = text;
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    resultArea.replaceChildren();
    resultArea.appendChild(textarea);
    resultArea.hidden = false;

    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").textContent = "Trouvez les étoiles de votre constellation";
}

async function getStars() {
    var span = document.createElement("span");
    span.className = "spinner-grow text-light";
    document.getElementById("starButton").replaceChildren();
    document.getElementById("starButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars");
    const json = await response.json();
    var list = json["output"];
    var resultArea = document.getElementById("divReponseTextuelle");
    var textarea = document.createElement("textarea");
    var text = "";
    if (list.length === 0) {
        text += "Aucune étoile trouvée, problème avec le serveur.";
    }
    else{
        text += `Étoiles :

`;
            text += "\nNombre total d'étoiles : " + (list.length - 1).toString() + "\n";
            list.forEach(function(item) {
            text += item["name"] + " : " + item["uri"] + "\n";
        }
        );
    }
    
    textarea.textContent = text;
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    resultArea.replaceChildren();
    resultArea.appendChild(textarea);
    resultArea.hidden = false;

    document.getElementById("starButton").replaceChildren();
    document.getElementById("starButton").textContent = "Listez toutes les étoiles";
}