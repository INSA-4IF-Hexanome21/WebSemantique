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
    const response = await fetch("http://127.0.0.1:8000/api/get-stars-in-constellation?name=" + nomConstellation);
    const json = await response.json();
    var list = json["output"];
    var resultArea = document.getElementById("divReponse");
    var textarea = document.createElement("textarea");
    textarea.value = list.join("\n");
    resultArea.replaceChildren();
    resultArea.appendChild(textarea);
}