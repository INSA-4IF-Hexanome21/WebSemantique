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
    span.className = "spinner-border text-light";
    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").appendChild(span);
    const response = await fetch("http://127.0.0.1:8000/api/get-stars-in-constellation?name=" + nomConstellation);
    const json = await response.json();
    var list = json["output"];
    var resultArea = document.getElementById("divReponseTextuelle");
    var textarea = document.createElement("textarea");
    if (list.length === 0) {
        list.push("Aucune étoile trouvée dans cette constellation.");
    }
    else{
        list.unshift("");
        list.unshift("Étoiles dans la constellation " + nomConstellation + " :");
        list.push("");
        list.push("Nombre total d'étoiles : " + (list.length - 1).toString());
    }
    textarea.textContent = list.join("\n");
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    resultArea.replaceChildren();
    resultArea.appendChild(textarea);
    resultArea.hidden = false;
    document.getElementById("constellationsButton").replaceChildren();
    document.getElementById("constellationsButton").textContent = "Trouvez les étoiles de votre constellation";
}