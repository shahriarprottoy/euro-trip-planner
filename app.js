document.getElementById('search-btn').addEventListener('click', async () => {
    const budget = parseFloat(document.getElementById('budget').value);
    const days = parseInt(document.getElementById('days').value);
    const preference = document.getElementById('preference').value;
    const container = document.getElementById('results-container');

    // 1. Basic Validation
    if (!budget || !days) {
        alert("Please enter both budget and duration!");
        return;
    }

    // 2. Fetch Data (Asynchronous Communication)
    try {
        const response = await fetch('data.json');
        const destinations = await response.json();

        // 3. Logic: Calculate Daily Limit
        const dailyLimit = budget / days;

        // 4. Logic: Filter and Score
        const filtered = destinations.filter(item => {
            const isAffordable = item.daily_cost <= dailyLimit;
            const matchesPref = preference === 'any' || item.tags.includes(preference);
            return isAffordable && matchesPref;
        });

        // 5. Update UI (DOM Manipulation)
        renderResults(filtered, container);

    } catch (error) {
        console.error("Error loading data:", error);
        container.innerHTML = "<p>Sorry, something went wrong.</p>";
    }
});

function renderResults(data, container) {
    container.innerHTML = ""; // Clear old results

    if (data.length === 0) {
        container.innerHTML = "<p>No matches found for your budget. Try saving more or staying fewer days!</p>";
        return;
    }

    data.forEach(place => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${place.image}" alt="${place.city}">
            <div class="card-content">
                <h3>${place.city}, ${place.country}</h3>
                <p><strong>Est. Cost:</strong> €${place.daily_cost}/day</p>
                <p><strong>Activities:</strong> ${place.activities.join(", ")}</p>
            </div>
        `;
        container.appendChild(card);
    });
}
