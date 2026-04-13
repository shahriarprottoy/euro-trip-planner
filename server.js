const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/destinations', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error");
        res.json(JSON.parse(data));
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
