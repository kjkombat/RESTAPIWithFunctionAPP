const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite3 database object
const db = new sqlite3.Database('.mydatabase.db');

// Create a table to store form data
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS form_data ( name TEXT, email TEXT PRIMARY KEY, comment TEXT, address TEXT)');
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Database created and initialized successfully!');
    }
});
