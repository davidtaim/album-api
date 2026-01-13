import { Database } from 'bun:sqlite';
import { env } from '../config/env';

export const db = new Database(env.DATABASE_URL);

db.run('PRAGMA journal_mode = WAL;');
db.run('PRAGMA foreign_keys = ON;');
