const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors()); // Allows frontend to access the backend
app.use(express.json());

// This is your API Route
app.get('/api/destinations', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read data" });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Backend API running at http://localhost:${PORT}`);
});
