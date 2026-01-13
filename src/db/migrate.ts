import { readFileSync } from 'node:fs';
import { db } from './client';

export function migrate() {
    const sql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf-8');
    db.run(sql);
}
