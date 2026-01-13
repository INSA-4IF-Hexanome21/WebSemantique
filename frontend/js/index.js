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
    console.log(data)
}

window.onload = function () {
    console.log("Page is fully loaded");

    document.getElementById("searchButton").addEventListener("click", () => {
        const content = document.getElementById("searchInput").value;
        askAI(content);
        console.log("Recherche IA:", content);
    });
};