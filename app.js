document.getElementById('search-btn').addEventListener('click', async () => {
    const budget = parseFloat(document.getElementById('budget').value);
    const days = parseInt(document.getElementById('days').value);
    const preference = document.getElementById('preference').value;
    const container = document.getElementById('results-container');

    if (!budget || !days) {
        alert("Please enter budget and days.");
        return;
    }

    // ARCHITECTURE: Checking if we are local or on GitHub
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal ? 'http://localhost:3000/api/destinations' : 'data.json';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const dailyBudget = budget / days;

        // DATA HANDLING: Filtering based on logic
        const filtered = data.filter(city => {
            const affordable = city.daily_cost <= dailyBudget;
            const matchVibe = preference === 'any' || city.tags.includes(preference);
            return affordable && matchVibe;
        });

        displayResults(filtered, container);
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = "<p>Data could not be loaded. Are you using a Live Server?</p>";
    }
});

function displayResults(cities, container) {
    container.innerHTML = "";
    
    if (cities.length === 0) {
        container.innerHTML = "<p>Try increasing your budget or shortening your trip!</p>";
        return;
    }

    cities.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.city}">
            <div class="card-body">
                <h3>${city.city}, ${city.country}</h3>
                <p><strong>Est. Cost:</strong> €${city.daily_cost}/day</p>
                <div>${city.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                <p><small>Activities: ${city.activities.join(", ")}</small></p>
            </div>
        `;
        container.appendChild(card);
    });
}
