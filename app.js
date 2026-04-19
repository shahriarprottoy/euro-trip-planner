let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// --- 1. INITIALIZE MAP ---
function initMap() {
    // Only initialize if the map div exists and isn't already initialized
    if (document.getElementById('map') && !map) {
        map = L.map('map').setView([48.8, 12.3], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }
}

// --- 2. CURRENCY CONVERSION LOGIC ---
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
        // Automatically refresh search results with new currency if budget is present
        if (document.getElementById('budget').value) {
            performSearch();
        }
    } catch (err) {
        console.error("Currency API failed:", err);
        alert("Could not update currency. Using Euros.");
    }
});

// --- 3. SEARCH LOGIC ---
document.getElementById('search-btn').addEventListener('click', performSearch);

async function performSearch() {
    const budgetInput = document.getElementById('budget').value;
    const daysInput = document.getElementById('days').value;
    const pref = document.getElementById('preference').value;
    const container = document.getElementById('results-container');
    
    if(!budgetInput || !daysInput) {
        alert("Please enter both budget and days.");
        return;
    }

    try {
        const res = await fetch('data.json');
        const cities = await res.json();
        
        // Convert the user's budget back to EUR for filtering against the DB
        // or compare using the exchange rate. 
        // Logic: Daily cost in DB (EUR) vs (User Budget / Days / Exchange Rate)
        const dailyLimitInEur = (budgetInput / daysInput) / exchangeRate;

        const filtered = cities.filter(c => 
            c.daily_cost <= dailyLimitInEur && (pref === 'any' || c.tags.includes(pref))
        );

        renderResults(filtered, container);
    } catch (err) {
        console.error("Search failed:", err);
    }
}

// --- 4. RENDERING RESULTS (Fixed Price Display) ---
function renderResults(data, container) {
    container.innerHTML = "";
    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    if (data.length === 0) {
        container.innerHTML = "<p>No destinations found for this budget. Try increasing it!</p>";
        return;
    }

    data.forEach(city => {
        // Calculate the display price based on exchange rate
        const displayPrice = (city.daily_cost * exchangeRate).toFixed(0);
        const currencySymbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

        // Add Marker
        const m = L.marker([city.lat, city.lng]).addTo(map)
                  .bindPopup(`<b>${city.city}</b><br>${currencySymbol}${displayPrice} / day`);
        markers.push(m);

        // Add Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}" alt="${city.city}">
            <div class="card-body">
                <label><input type="checkbox" class="compare-cb" data-id="${city.city}"> Compare</label>
                <h3>${city.city}, ${city.country}</h3>
                <p class="price-text"><strong>${currencySymbol}${displayPrice}</strong> per day</p>
                <p><small>${city.activities.slice(0,2).join(', ')}</small></p>
            </div>
        `;
        
        // Add event listener to checkbox for comparison
        card.querySelector('.compare-cb').addEventListener('change', (e) => {
            toggleCompare(city, e.target.checked);
        });

        container.appendChild(card);
    });
}

// --- 5. COMPARISON & FEEDBACK LOGIC ---
function toggleCompare(city, isChecked) {
    if (isChecked) {
        selectedCities.push(city);
    } else {
        selectedCities = selectedCities.filter(c => c.city !== city.city);
    }

    const tray = document.getElementById('comparison-tray');
    tray.classList.toggle('hidden', selectedCities.length === 0);
    document.getElementById('compare-count').innerText = `${selectedCities.length} Selected`;
}

document.getElementById('open-compare-btn').onclick = () => {
    const modal = document.getElementById('compare-modal');
    const tableDiv = document.getElementById('compare-table-container');
    modal.classList.remove('hidden');

    const symbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'GBP' ? '£' : '€';

    let html = `<table><tr><th>Feature</th>${selectedCities.map(c => `<th>${c.city}</th>`).join('')}</tr>`;
    html += `<tr><td>Daily Cost</td>${selectedCities.map(c => `<td>${symbol}${(c.daily_cost * exchangeRate).toFixed(2)}</td>`).join('')}</tr>`;
    html += `<tr><td>Activities</td>${selectedCities.map(c => `<td>${c.activities.join(', ')}</td>`).join('')}</tr></table>`;
    tableDiv.innerHTML = html;
};

// Feedback Form persistence
document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const trip = {
        city: document.getElementById('visited-city').value,
        cost: document.getElementById('actual-cost').value,
        currency: currentCurrency
    };
    let history = JSON.parse(localStorage.getItem('trips')) || [];
    history.push(trip);
    localStorage.setItem('trips', JSON.stringify(history));
    alert("Trip Saved!");
    e.target.reset();
});

// Initialize on load
window.onload = initMap;
