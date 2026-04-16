/**
 * EUROTRIP PLANNER - MAIN LOGIC
 * Handles searching, filtering, and user feedback history.
 */

// --- 1. INITIALIZATION & SESSION ---
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('userName') || 'Guest';
    const display = document.getElementById('user-display');
    const status = document.getElementById('user-info-display');
    
    if (display) display.innerText = user;
    if (status) status.innerText = `Logged in as: ${user}`;
    
    displayTripHistory();
});

// --- 2. SEARCH & FILTER LOGIC ---
document.getElementById('search-btn').addEventListener('click', async () => {
    const budget = parseFloat(document.getElementById('budget').value);
    const days = parseInt(document.getElementById('days').value);
    const preference = document.getElementById('preference').value;
    const container = document.getElementById('results-container');

    // Validation
    if (!budget || !days || budget <= 0 || days <= 0) {
        alert("Please enter valid budget and duration values.");
        return;
    }

    container.innerHTML = "<div class='loader'>Searching destinations...</div>";

    // Architecture Check: Determine if fetching from Local Server or Local File
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal ? 'http://localhost:3000/api/destinations' : 'data.json';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Data source unreachable");
        
        const allDestinations = await response.json();

        // Core Algorithm: Calculate Daily Allowance
        const dailyAllowance = budget / days;

        // Filter Logic
        const filtered = allDestinations.filter(place => {
            const isAffordable = place.daily_cost <= dailyAllowance;
            const matchesVibe = preference === 'any' || place.tags.includes(preference);
            return isAffordable && matchesVibe;
        });

        renderCityCards(filtered, container);
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = "<p class='error'>Unable to load data. Please ensure you are using a Live Server or check data.json.</p>";
    }
});

// --- 3. UI RENDERING ---
function renderCityCards(data, container) {
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p class='no-results'>No cities match your criteria. Try increasing your budget!</p>";
        return;
    }

    data.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${city.image}" alt="${city.city}" loading="lazy">
                <span class="price-badge">€${city.daily_cost}/day</span>
            </div>
            <div class="card-body">
                <h3>${city.city}, ${city.country}</h3>
                <div class="tags">
                    ${city.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
                </div>
                <p><strong>Top Activities:</strong> ${city.activities.join(", ")}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. FEEDBACK & HISTORY LOGIC ---
document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const newTrip = {
        city: document.getElementById('visited-city').value,
        country: document.getElementById('visited-country').value,
        cost: document.getElementById('actual-cost').value,
        notes: document.getElementById('trip-notes').value,
        date: new Date().toLocaleDateString()
    };

    // Store in LocalStorage (Simulating a database)
    let history = JSON.parse(localStorage.getItem('userTrips')) || [];
    history.push(newTrip);
    localStorage.setItem('userTrips', JSON.stringify(history));

    e.target.reset();
    displayTripHistory();
    alert("Trip saved to your profile history!");
});

function displayTripHistory() {
    const list = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('userTrips')) || [];
    
    if (history.length === 0) {
        list.innerHTML = "<li class='empty-msg'>No trip history yet.</li>";
        return;
    }

    list.innerHTML = history.map(trip => `
        <li class="history-item">
            <div class="history-meta">
                <strong>${trip.city}, ${trip.country}</strong>
                <span>€${trip.cost}/day</span>
            </div>
            <p class="history-notes">${trip.notes}</p>
            <span class="history-date">Visited on: ${trip.date}</span>
        </li>
    `).join('');
}

// --- 5. LOGOUT FUNCTION ---
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}
