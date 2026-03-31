import db from './db';

// Message type for local representations
export interface ChatMessage {
  id?: number;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

/**
 * Persists a new message in the database.
 */
export const saveMessage = (sessionId: string, role: string, content: string): void => {
  const stmt = db.prepare(`
    INSERT INTO messages (sessionId, role, content) 
    VALUES (?, ?, ?)
  `);
  stmt.run(sessionId, role, content);
};

/**
 * Retrieves the history of a session, ordered by time.
 */
export const getHistory = (sessionId: string, limit: number = 30): ChatMessage[] => {
  const stmt = db.prepare(`
    SELECT * FROM (
      SELECT * FROM messages 
      WHERE sessionId = ? 
      ORDER BY timestamp DESC
      LIMIT ?
    )
    ORDER BY timestamp ASC
  `);
  return stmt.all(sessionId, limit) as ChatMessage[];
};

/**
 * Clears history for a specific session
 */
export const clearHistory = (sessionId: string): void => {
  const stmt = db.prepare('DELETE FROM messages WHERE sessionId = ?');
  stmt.run(sessionId);
}
