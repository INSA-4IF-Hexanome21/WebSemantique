async function askAI(content) {
    const response = await fetch("http://127.0.0.1:8000/api/ask-ai", {
        method: "POST",
        body: JSON.stringify({
            content: content
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    if (!response.ok) {
        console.error("Erreur HTTP : ", response.status);
        return;
    }

    const data = await response.json();
    console.log(data); 

    const resultArea = document.getElementById("divReponse");
    const resultList = document.getElementById("resultList");
    document.getElementById("searchButton-icon").style.display = "flex";
    document.getElementById("loader").style.display = "none";

    resultArea.style.display = "flex";
    resultArea.classList.add("fade-in");

    if (Array.isArray(data.output) && data.output.length !== 0 ) {
        document.getElementById("result-header").innerHTML += ` (${data.output.length} résultats)` ;
        const values = data.output.map(item => {
            const innerObject = Object.values(item)[0];
            return innerObject.value;
        });

        resultList.innerHTML = "";

        values.forEach(value => {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = value;
            link.textContent = value.split("/").pop(); // plus lisible
            link.title = value;
            link.target = "_blank";

            li.appendChild(link);
            resultList.appendChild(li);
        });
    } else {
        resultList.innerHTML = '<li style="color: #888; font-style: italic;">Aucune donnée trouvée.</li>';
    }
}

window.onload = function () {
    console.log("Page is fully loaded");

    document.getElementById("searchButton").addEventListener("click", () => {
        this.document.getElementById("searchButton-icon").style.display = "none";
        this.document.getElementById("loader").style.display = "flex";
        const content = document.getElementById("searchInput").value;
        askAI(content);
        console.log("Recherche IA:", content);
    });
};