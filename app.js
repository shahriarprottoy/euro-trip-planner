let map, markers = [], selectedCities = [], exchangeRate = 1, currentCurrency = 'EUR';

// Initialize Map
function initMap() {
    map = L.map('map').setView([48.8, 12.3], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// Currency API
document.getElementById('currency-select').addEventListener('change', async (e) => {
    currentCurrency = e.target.value;
    if (currentCurrency !== 'EUR') {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        const data = await res.json();
        exchangeRate = data.rates[currentCurrency];
    } else { exchangeRate = 1; }
    document.getElementById('search-btn').click();
});

// Search Logic
document.getElementById('search-btn').addEventListener('click', async () => {
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const pref = document.getElementById('preference').value;
    
    if(!budget || !days) return alert("Fill in fields");

    const res = await fetch('data.json');
    const cities = await res.json();
    const dailyLimit = budget / days;

    const filtered = cities.filter(c => 
        c.daily_cost <= dailyLimit && (pref === 'any' || c.tags.includes(pref))
    );

    render(filtered);
});

function render(data) {
    const container = document.getElementById('results-container');
    container.innerHTML = "";
    markers.forEach(m => map.removeLayer(m));
    
    data.forEach(city => {
        const price = (city.daily_cost * exchangeRate).toFixed(0);
        
        // Map Marker
        const m = L.marker([city.lat, city.lng]).addTo(map).bindPopup(`${city.city}: ${price}${currentCurrency}`);
        markers.push(m);

        // Card
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <img src="${city.image}">
            <div class="card-body">
                <label><input type="checkbox" onchange='toggleCompare(${JSON.stringify(city)})'> Compare</label>
                <h3>${city.city}</h3>
                <p><strong>${price} ${currentCurrency}</strong> / day</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleCompare(city) {
    const idx = selectedCities.findIndex(c => c.city === city.city);
    if(idx > -1) selectedCities.splice(idx, 1);
    else selectedCities.push(city);

    document.getElementById('comparison-tray').classList.toggle('hidden', selectedCities.length === 0);
    document.getElementById('compare-count').innerText = `${selectedCities.length} Selected`;
}

document.getElementById('open-compare-btn').onclick = () => {
    const modal = document.getElementById('compare-modal');
    const tableDiv = document.getElementById('compare-table-container');
    modal.classList.remove('hidden');

    let html = `<table><tr><th>Feature</th>${selectedCities.map(c => `<th>${c.city}</th>`).join('')}</tr>`;
    html += `<tr><td>Daily Cost</td>${selectedCities.map(c => `<td>${(c.daily_cost * exchangeRate).toFixed(2)} ${currentCurrency}</td>`).join('')}</tr>`;
    html += `<tr><td>Activities</td>${selectedCities.map(c => `<td>${c.activities.join(', ')}</td>`).join('')}</tr></table>`;
    tableDiv.innerHTML = html;
};

initMap();
