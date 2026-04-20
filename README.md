🌍 EuroTrip Planner
EuroTrip Planner is a modern web application designed to help travelers discover European destinations that fit their specific budget and lifestyle preferences. By combining real-time currency conversion with interactive mapping, it removes the guesswork from travel planning.

🚀 Key Features
Intelligent Search: Calculate your daily allowance instantly by inputting your total budget and trip duration.

Vibe Filtering: Filter cities based on "Vibes" such as History, Nightlife, Nature, or Food.

Live Currency Conversion: Toggle between EUR, USD, and GBP using real-time exchange rates.

Interactive Map: Explore suggested cities on an integrated Leaflet.js map with custom pop-ups.

City Comparison: Select multiple cities to view a side-by-side comparison of costs and activities.

Traveler History: A community-driven feedback system where users can save their actual trip spending to their profile.

🎨 Design Philosophy: "Modern European Elegance"
The project utilizes a Glassmorphism UI trend, characterized by:

Translucency: Semi-transparent panels (rgba) that let the beautiful European background imagery peek through.

Background Blurs: Using backdrop-filter: blur() to create depth and focus.

Immersive Backgrounds: Fixed-position, high-resolution photography with linear-gradient overlays to ensure 100% text readability.

🛠️ Technical Stack
Frontend: HTML5, CSS3 (Custom Variables, Flexbox, Grid)

Logic: Vanilla JavaScript (ES6+)

Map Engine: Leaflet.js & OpenStreetMap

APIs: Open Exchange Rates API for live financial data.

Storage: Browser LocalStorage for user session and history persistence.

📁 Project Structure
Plaintext
EuroTrip-Planner/
│
├── index.html          # Landing page with hero section & login
├── planner.html        # Main application dashboard
├── style.css           # Custom styles (Glassmorphism & Layout)
├── app.js              # Core application logic & Map initialization
├── auth.js             # Basic authentication & Session handling
└── data.json           # Local database of European cities & coordinates
⚙️ How It Works (The Logic)
Budget Normalization: The app converts your input budget into Euro (EUR) using the current exchange rate to match the internal database.

Tag Filtering: It scans the tags array in the data.json file to match the user's selected "Vibe."

Coordinate Mapping: For every city that passes the filter, a Leaflet marker is generated using the lat and lng properties.

Persistence: When a user submits feedback, the data is pushed into an array and stringified into LocalStorage, allowing the data to remain even after the browser is closed.

📸 Screenshots & Preview
Landing Page: A fixed-background hero section with a frosted-glass login card.

Planner View: A clean, dual-panel layout featuring a top-bar search and a full-width interactive map.

Comparison Modal: A dynamic table that pulls data from selected checkboxes for cost analysis.

📝 Installation
Clone the repository:



Note: For the Currency API to work without CORS issues, it is recommended to run the project via a local server (e.g., Live Server extension in VS Code).

🤝 Contribution
Contributions are welcome! If you'd like to add more cities to data.json or improve the CSS animations, please feel free to fork the repo and submit a pull request.

Designed with ❤️ for travelers everywhere.
