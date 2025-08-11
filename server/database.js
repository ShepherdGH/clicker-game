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

  return db;
}

module.exports = { setup };