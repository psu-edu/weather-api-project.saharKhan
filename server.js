const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database'); // Database connection
const { fetchWeatherData } = require('./weather'); // Weather API function

const app = express();
app.use(bodyParser.json());

// CREATE: Add weather data to the database
app.post('/data', async (req, res) => {
    const { city } = req.body;

    try {
        const weatherData = await fetchWeatherData(city);
        const { name, main, weather } = weatherData;

        db.run(
            `INSERT INTO weather (city, temperature, description) VALUES (?, ?, ?)`,
            [name, main.temp, weather[0].description],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id: this.lastID, message: 'Weather data added successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ: Get all weather data
app.get('/data', (req, res) => {
    db.all('SELECT * FROM weather', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// READ: Get weather data by ID
app.get('/data/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM weather WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Data not found' });
        }
        res.json(row);
    });
});

// UPDATE: Update weather data by ID
app.put('/data/:id', (req, res) => {
    const { id } = req.params;
    const { city, temperature, description } = req.body;

    db.run(
        `UPDATE weather SET city = ?, temperature = ?, description = ? WHERE id = ?`,
        [city, temperature, description, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Weather data updated successfully' });
        }
    );
});

// DELETE: Delete weather data by ID
app.delete('/data/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM weather WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Weather data deleted successfully' });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});