import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';
const databaseDirectory = path.dirname(config.DATABASE_URL);
fs.mkdirSync(databaseDirectory, { recursive: true });
export const db = new Database(config.DATABASE_URL);
db.pragma('journal_mode = WAL');
