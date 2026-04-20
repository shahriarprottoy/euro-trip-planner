<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EuroTrip | Planner</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body class="planner-bg">
    <nav class="navbar">
        <div class="nav-brand"><strong>EuroTrip</strong></div>
        <div class="nav-user">
            <span id="user-display"></span>
            <button onclick="logout()" class="logout-link">Logout</button>
        </div>
    </nav>

    <div class="container">
        <section class="card-panel">
            <div class="input-group">
                <label>Budget</label>
                <input type="number" id="budget" placeholder="e.g. 1000">
            </div>
            <div class="input-group">
                <label>Days</label>
                <input type="number" id="days" placeholder="e.g. 7">
            </div>
            <div class="input-group">
                <label>Currency</label>
                <select id="currency-select">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                </select>
            </div>
            <button id="search-btn">Find Destinations</button>
        </section>

        <div class="utility-bar">
            <button id="toggle-map-btn" class="sec-btn">📍 Show/Hide Map</button>
            <button id="toggle-feedback-btn" class="sec-btn">💬 Share Your Experience</button>
        </div>

        <div id="map-wrapper" class="hidden" style="margin-bottom: 20px;">
            <div id="map" style="height: 400px; border-radius: 12px;"></div>
        </div>

        <div id="results-container" class="results-grid"></div>

        <section id="feedback-section" class="hidden feedback-panel">
            <h3>Share Your Experiences to Help Us Grow</h3>
            <form id="feedback-form">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" id="visited-city" placeholder="City" style="flex:1" required>
                    <input type="text" id="visited-country" placeholder="Country" style="flex:1" required>
                </div>
                <input type="number" id="actual-cost" placeholder="Daily Cost Spent" style="width:100%; margin-bottom:10px;" required>
                <button type="submit" class="primary-btn" style="width:100%">Save Trip</button>
            </form>
            <ul id="history-list" class="history-list"></ul>
        </section>
    </div>

    <div id="comparison-tray" class="comparison-tray hidden">
        <span id="compare-count">0 selected</span>
        <button id="open-compare-btn">Compare Now</button>
    </div>

    <script src="auth.js"></script>
    <script src="app.js"></script>
</body>
</html>
