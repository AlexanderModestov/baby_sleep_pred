const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || './database.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        telegram_id INTEGER PRIMARY KEY,
        username TEXT,
        first_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS children (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        birth_date DATE NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (telegram_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS sleep_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_id INTEGER,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        quality TEXT CHECK(quality IN ('Slept well', 'Average sleep', 'Poor sleep', 'Very poor sleep')),
        is_ongoing BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES children (id)
      )
    `);
  });
}

module.exports = db;