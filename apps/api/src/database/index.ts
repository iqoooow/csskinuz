import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/index.js';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbDir = path.dirname(CONFIG.DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(CONFIG.DATABASE_PATH, {
      verbose: CONFIG.NODE_ENV === 'development' ? undefined : undefined,
    });

    // Production SQLite sozlamalari
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('busy_timeout = 5000');
    dbInstance.pragma('synchronous = NORMAL');

    // Sxemani yuklash
    initSchema(dbInstance);
  }

  return dbInstance;
}

function initSchema(db: Database.Database) {
  const candidatePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../../src/database/schema.sql'),
    path.resolve(process.cwd(), 'apps/api/src/database/schema.sql'),
    path.resolve(process.cwd(), 'src/database/schema.sql'),
    path.resolve(process.cwd(), 'schema.sql'),
  ];

  let loaded = false;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const schemaSql = fs.readFileSync(p, 'utf8');
      db.exec(schemaSql);
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    throw new Error('Database schema.sql fayli topilmadi! Qidirilgan yo\'llar: ' + candidatePaths.join(', '));
  }
}

/**
 * Tranzaksiyani xavfsiz va atomik bajarish yordamchisi
 */
export function runTransaction<T>(callback: (db: Database.Database) => T): T {
  const db = getDatabase();
  const transaction = db.transaction(() => callback(db));
  return transaction();
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
