import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

let connection: Database.Database | undefined
export function getDb(): Database.Database {
  if (connection) return connection
  const path = resolve(process.env.SQLITE_PATH || './data/paywall.sqlite')
  mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path, { timeout: 5000 })
  try {
    // Initial schema: additive creation only; journal uses the same persistent directory.
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        offer_id TEXT NOT NULL,
        device_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        price_minor INTEGER NOT NULL CHECK(price_minor > 0),
        currency TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(device_id, request_id)
      );
      CREATE INDEX IF NOT EXISTS purchases_device_created ON purchases(device_id, created_at);
    `)
    connection = db
    return db
  } catch (error) {
    db.close()
    throw error
  }
}
