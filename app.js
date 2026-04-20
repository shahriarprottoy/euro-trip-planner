// Global State
let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// 1. Initialize Map
function initMap() {
    console.log("Initializing Map...");
    const mapElement = document.getElementById('map');
    if (mapElement && !map) {
        map = L.map('map').setView([48.8, 12.3], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }
}

// 2. Currency Logic
const currencySelect = document.getElementById('currency-select');
if (currencySelect) {
    currencySelect.addEventListener('change', async (e) => {
        currentCurrency = e.target.value;
        try {
            if (currentCurrency !== 'EUR') {
                const res = await fetch('https://open.er-api.com/v6/latest/EUR');
                const data = await res.json();
                exchangeRate = data.rates[currentCurrency];
            } else {
                exchangeRate = 1;
            }
            console.log("Currency changed to:", currentCurrency, "Rate:", exchangeRate);
            if (document.getElementById('budget').value) performSearch();
        } catch (err) {
            console.error("Currency API Error:", err);
        }
    });
}

// 3. Search Logic
const searchBtn = document.getElementById('search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

async function performSearch() {
    console.log("Searching...");
    const budgetInput = document.getElementById('budget').value;
    const daysInput = document.getElementById('days').value;
    const pref = document.getElementById('preference').value;
    const container = document.getElementById('results-container');

    if (!budgetInput || !daysInput) {
        alert("Enter budget and days!");
        return;
    }

    try {
        const res = await fetch('data.json');
        const cities = await res.json();

        // Convert the "Daily Limit" to match the database currency (EUR)
        const dailyLimitInEur = (budgetInput / daysInput) / exchangeRate;

        const filtered = cities.filter(c => 
            c.daily_cost <= dailyLimitInEur && (pref === 'any' || c.tags.includes(pref))
        );

        console.log("Filtered results count:", filtered.length);
        renderResults(filtered, container);
    } catch (err) {
        console.error("Search Logic Error:", err);
    }
}

// 4. Render results with correct Currency Symbols
function renderResults(data, container) {
    container.innerHTML = "";
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if (data.length === 0) {
        container.innerHTML = "<p>No results found. Increase your budget!</p>";
        return;
    }

    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

    data.forEach(city => {
        const displayPrice = (city.daily_cost * exchangeRate).toFixed(0);

        // Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.city}">
            <div class="card-body">
                <label><input type="checkbox" class="compare-cb" data-city='${JSON.stringify(city)}'> Compare</label>
                <h3>${city.city}</h3>
                <p><strong>${symbol}${displayPrice}</strong> / day</p>
            </div>
        `;
        
        card.querySelector('.compare-cb').addEventListener('change', (e) => {
            const cityData = JSON.parse(e.target.getAttribute('data-city'));
            toggleCompare(cityData, e.target.checked);
        });

        container.appendChild(card);

        // Map Marker
        const m = L.marker([city.lat, city.lng]).addTo(map)
                  .bindPopup(`<b>${city.city}</b>: ${symbol}${displayPrice}`);
        markers.push(m);
    });
}

// 5. Comparison Logic
function toggleCompare(city, isChecked) {
    if (isChecked) selectedCities.push(city);
    else selectedCities = selectedCities.filter(c => c.city !== city.city);

    const tray = document.getElementById('comparison-tray');
    if (tray) {
        tray.classList.toggle('hidden', selectedCities.length === 0);
        document.getElementById('compare-count').innerText = `${selectedCities.length} Selected`;
    }
}

// 6. Feedback & History Logic (FIXED)
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
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

        console.log("Trip saved to LocalStorage");
        e.target.reset();
        displayHistory(); // Refresh the list immediately
    });
}

function displayHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const history = JSON.parse(localStorage.getItem('userTrips')) || [];
    list.innerHTML = history.length === 0 ? "<li>No history yet.</li>" : "";

    history.forEach(trip => {
        const li = document.createElement('li');
        li.className = "history-item";
        li.innerHTML = `<strong>${trip.city}</strong> (${trip.country}) - Cost: ${trip.cost} <br> <small>${trip.date}</small>`;
        list.appendChild(li);
    });
}
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle('hidden');
    
    // Refresh map size if opening map
    if (sectionId === 'map-wrapper' && !section.classList.contains('hidden')) {
        setTimeout(() => { map.invalidateSize(); }, 200);
    }
}

// START EVERYTHING
window.onload = () => {
    initMap();
    displayHistory();
};
