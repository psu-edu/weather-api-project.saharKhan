const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./test.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Close the connection
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the SQLite database connection.');
});