const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database('./weather.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS weather (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL,
            temperature REAL NOT NULL,
            description TEXT NOT NULL
        )`);
    }
});

module.exports = db;