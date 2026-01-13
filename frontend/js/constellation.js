async function getConstellations(obj) {
    obj.replaceChildren();
    const response = await fetch("http://127.0.0.1:8000/api/get-constellations");
    const json = await response.json();
    console.log(json)
}