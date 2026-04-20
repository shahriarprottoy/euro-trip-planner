let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// --- 1. CORE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Loaded");
    
    // Initialize Map (but it's hidden in CSS)
    initMap();
    
    // Check Login Status
    const user = localStorage.getItem('userName');
    if (document.getElementById('user-display')) {
        document.getElementById('user-display').innerText = user || "Guest";
    }

    // Attach Toggle Listeners
    setupToggles();
    
    // Load History
    displayHistory();
});

// --- 2. TOGGLE LOGIC ---
function setupToggles() {
    const mapBtn = document.getElementById('toggle-map-btn');
    const feedBtn = document.getElementById('toggle-feedback-btn');

    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('map-wrapper');
            wrapper.classList.toggle('hidden');
            // Leaflet fix: Map needs to recalculate size when unhidden
            if (!wrapper.classList.contains('hidden')) {
                setTimeout(() => { map.invalidateSize(); }, 200);
            }
        });
    }

    if (feedBtn) {
        feedBtn.addEventListener('click', () => {
            document.getElementById('feedback-section').classList.toggle('hidden');
        });
    }
}

// --- 3. MAP & CURRENCY ---
function initMap() {
    if (!map) {
        map = L.map('map').setView([48.8, 12.3], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
}

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

// --- 4. SEARCH & RENDER ---
document.getElementById('search-btn').addEventListener('click', performSearch);

async function performSearch() {
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const container = document.getElementById('results-container');

    if (!budget || !days) return alert("Please enter budget and days.");

    try {
        const res = await fetch('data.json');
        const cities = await res.json();
        const dailyLimitEur = (budget / days) / exchangeRate;

        const filtered = cities.filter(c => c.daily_cost <= dailyLimitEur);
        render(filtered, container);
    } catch (err) {
        console.error("Search Error:", err);
    }
}

function render(data, container) {
    container.innerHTML = "";
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

    data.forEach(city => {
        const price = (city.daily_cost * exchangeRate).toFixed(0);
        
        // Marker
        const m = L.marker([city.lat, city.lng]).addTo(map).bindPopup(`${city.city}: ${symbol}${price}`);
        markers.push(m);

        // Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}">
            <div class="card-body">
                <h3>${city.city}</h3>
                <p><strong>${symbol}${price}</strong> / day</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 5. FEEDBACK LOGIC ---
document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const trip = {
        city: document.getElementById('visited-city').value,
        country: document.getElementById('visited-country').value,
        cost: document.getElementById('actual-cost').value,
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
