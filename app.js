let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// 1. Initialize Everything
window.onload = () => {
    initMap();
    displayHistory();
    const user = localStorage.getItem('userName');
    if(document.getElementById('user-display')) {
        document.getElementById('user-display').innerText = user || "Traveler";
    }
};

function initMap() {
    map = L.map('map').setView([48.8, 12.3], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// 2. Currency Change
document.getElementById('currency-select').addEventListener('change', async (e) => {
    currentCurrency = e.target.value;
    if (currentCurrency !== 'EUR') {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        const data = await res.json();
        exchangeRate = data.rates[currentCurrency];
    } else {
        exchangeRate = 1;
    }
    if (document.getElementById('budget').value) performSearch();
});

// 3. Search & Filter (Vibe and Budget)
document.getElementById('search-btn').addEventListener('click', performSearch);

async function performSearch() {
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const preference = document.getElementById('preference').value;
    const container = document.getElementById('results-container');

    if (!budget || !days) return alert("Please enter budget and days.");

    try {
        const res = await fetch('data.json');
        const cities = await res.json();
        const dailyLimitEur = (budget / days) / exchangeRate;

        const filtered = cities.filter(c => {
            const matchesCost = c.daily_cost <= dailyLimitEur;
            const matchesVibe = (preference === 'any' || c.tags.includes(preference));
            return matchesCost && matchesVibe;
        });

        renderResults(filtered, container);
    } catch (err) {
        console.error("Search failed:", err);
    }
}

// 4. Render Cards and Map
function renderResults(data, container) {
    container.innerHTML = "";
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

    if (data.length === 0) {
        container.innerHTML = "<p>No destinations found for this vibe/budget.</p>";
        return;
    }

    data.forEach(city => {
        const price = (city.daily_cost * exchangeRate).toFixed(0);

        // Marker
        const m = L.marker([city.lat, city.lng]).addTo(map).bindPopup(`${city.city}: ${symbol}${price}`);
        markers.push(m);

        // Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.city}">
            <div class="card-body">
                <label><input type="checkbox" class="compare-cb"> Compare</label>
                <h3>${city.city}</h3>
                <p><strong>${symbol}${price}</strong> / day</p>
                <p><small>${city.tags.join(', ')}</small></p>
            </div>
        `;

        card.querySelector('.compare-cb').addEventListener('change', (e) => {
            toggleCompare(city, e.target.checked);
        });

        container.appendChild(card);
    });
}

// 5. Compare Logic
function toggleCompare(city, isChecked) {
    if (isChecked) selectedCities.push(city);
    else selectedCities = selectedCities.filter(c => c.city !== city.city);

    const tray = document.getElementById('comparison-tray');
    tray.classList.toggle('hidden', selectedCities.length === 0);
    document.getElementById('compare-count').innerText = `${selectedCities.length} Selected`;
}

document.getElementById('open-compare-btn').onclick = () => {
    const modal = document.getElementById('compare-modal');
    const tableDiv = document.getElementById('compare-table-container');
    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';
    
    modal.classList.remove('hidden');
    let html = `<table border="1" style="width:100%; border-collapse:collapse;"><tr><th>City</th><th>Daily Cost</th></tr>`;
    selectedCities.forEach(c => {
        html += `<tr><td>${c.city}</td><td>${symbol}${(c.daily_cost * exchangeRate).toFixed(2)}</td></tr>`;
    });
    html += `</table>`;
    tableDiv.innerHTML = html;
};

// 6. Feedback & History
document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const trip = {
        city: document.getElementById('visited-city').value,
        cost: document.getElementById('actual-cost').value,
        currency: currentCurrency,
        date: new Date().toLocaleDateString()
    };
    let history = JSON.parse(localStorage.getItem('userTrips')) || [];
    history.push(trip);
    localStorage.setItem('userTrips', JSON.stringify(history));
    e.target.reset();
    displayHistory();
});

function displayHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const history = JSON.parse(localStorage.getItem('userTrips')) || [];
    list.innerHTML = history.map(t => `<li>${t.city} - ${t.cost} (${t.date})</li>`).join('');
}
