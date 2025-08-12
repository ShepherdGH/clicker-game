const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setup() {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      gameData TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS registered_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_game_data (
      user_id INTEGER PRIMARY KEY,
      gameData TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES registered_users (id)
    );
  `);

  return db;
}

module.exports = { setup };