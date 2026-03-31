import Database from 'better-sqlite3';
import path from 'path';

// This initializes the local SQLite database in the root folder of the project
const dbPath = path.resolve(process.cwd(), 'odeagent.db');
const db = new Database(dbPath);

// Enable performance optimizations
db.pragma('journal_mode = WAL');

// Define the schema: we need at least a table for message context history
const initDb = () => {
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // You can create a "context" table later to store ongoing multi-turn task states if needed
  db.exec(createMessagesTable);
  console.log('[SQLite] Local database initialized to: ', dbPath);
};

initDb();

export default db;
