let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// --- 1. CORE INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Loaded");
    
    // Initialize Map
    initMap();
    
    // Check Login Status
    const user = localStorage.getItem('userName');
    if (document.getElementById('user-display')) {
        document.getElementById('user-display').innerText = user || "Traveler";
    }

    // Attach Toggle Listeners for Map and Feedback
    setupToggles();
    
    // Load History from LocalStorage
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
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            map = L.map('map').setView([48.8, 12.3], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
        }
    }
}

document.getElementById('currency-select').addEventListener('change', async (e) => {
    currentCurrency = e.target.value;
    try {
        if (currentCurrency !== 'EUR') {
            const res = await fetch('https://open.er-api.com/v6/latest/EUR');
            const data = await res.json();
            exchangeRate = data.rates[currentCurrency];
        } else {
            exchangeRate = 1;
        }
        // Auto-refresh search if user has already entered data
        if (document.getElementById('budget').value) performSearch();
    } catch (err) {
        console.error("Currency conversion failed", err);
    }
});

// --- 4. SEARCH & RENDER (Now with Vibe Filter) ---
document.getElementById('search-btn').addEventListener('click', performSearch);

async function performSearch() {
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const preference = document.getElementById('preference').value; // Restored Vibe
    const container = document.getElementById('results-container');

    if (!budget || !days) return alert("Please enter both budget and number of days.");

    try {
        const res = await fetch('data.json');
        const cities = await res.json();
        
        // Convert user daily budget to EUR to compare with database
        const dailyLimitEur = (budget / days) / exchangeRate;

        // Filter by BOTH Cost and Vibe (Tag)
        const filtered = cities.filter(city => {
            const matchesCost = city.daily_cost <= dailyLimitEur;
            const matchesVibe = (preference === 'any' || city.tags.includes(preference));
            return matchesCost && matchesVibe;
        });

        render(filtered, container);
    } catch (err) {
        console.error("Search Error:", err);
        container.innerHTML = "<p>Error loading destinations. Please try again.</p>";
    }
}

function render(data, container) {
    container.innerHTML = "";
    
    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if (data.length === 0) {
        container.innerHTML = "<p class='no-results'>No destinations match your budget and choice. Try adjusting your vibe or budget!</p>";
        return;
    }

    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

    data.forEach(city => {
        const price = (city.daily_cost * exchangeRate).toFixed(0);
        
        // Map Marker
        const m = L.marker([city.lat, city.lng]).addTo(map)
                  .bindPopup(`<b>${city.city}</b><br>${symbol}${price} per day`);
        markers.push(m);

        // Result Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.city}">
            <div class="card-body">
                <h3>${city.city}, ${city.country}</h3>
                <p class="vibe-tags">${city.tags.map(t => `#${t}`).join(' ')}</p>
                <p><strong>${symbol}${price}</strong> / day</p>
                <p class="activities-text"><small>${city.activities.join(' • ')}</small></p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 5. FEEDBACK LOGIC ---
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const trip = {
            city: document.getElementById('visited-city').value,
            country: document.getElementById('visited-country').value,
            cost: document.getElementById('actual-cost').value,
            currency: currentCurrency,
            date: new Date().toLocaleDateString()
        };

        // Save to History
        let history = JSON.parse(localStorage.getItem('userTrips')) || [];
        history.unshift(trip); // Add to beginning of array
        localStorage.setItem('userTrips', JSON.stringify(history));
        
        // Reset and Update UI
        e.target.reset();
        alert("Thanks for sharing! Your experience helps our community grow.");
        displayHistory();
    });
}

function displayHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    
    const history = JSON.parse(localStorage.getItem('userTrips')) || [];
    
    if (history.length === 0) {
        list.innerHTML = "<li>No trips shared yet.</li>";
        return;
    }

    list.innerHTML = history.map(t => `
        <li class="history-item">
            <strong>${t.city}</strong> (${t.date})<br>
            Spent approx ${t.cost} ${t.currency} per day
        </li>
    `).join('');
}
