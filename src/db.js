import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = root;
const dbPath = process.env.DB_PATH || path.join(projectRoot, 'data', 'ecommerce.db');
if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

const SQL = await initSqlJs({
  locateFile: (file) => path.join(projectRoot, 'node_modules', 'sql.js', 'dist', file)
});
const existing = dbPath !== ':memory:' && fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : undefined;
const sqlite = new SQL.Database(existing);
sqlite.run('PRAGMA foreign_keys = ON');
sqlite.run(fs.readFileSync(path.join(root, 'schema.sql'), 'utf8'));

function normalize(value) {
  return value === undefined ? null : value;
}

function statement(sql, parameters = []) {
  const prepared = sqlite.prepare(sql);
  prepared.bind(parameters.map(normalize));
  return prepared;
}

export const db = {
  prepare(sql) {
    return {
      get(...parameters) {
        const prepared = statement(sql, parameters); const row = prepared.step() ? prepared.getAsObject() : undefined; prepared.free(); return row;
      },
      all(...parameters) {
        const prepared = statement(sql, parameters); const rows = []; while (prepared.step()) rows.push(prepared.getAsObject()); prepared.free(); return rows;
      },
      run(...parameters) {
        const prepared = statement(sql, parameters); prepared.step(); prepared.free();
        const changes = sqlite.getRowsModified();
        const id = sqlite.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0];
        persist(); return { changes, lastInsertRowid: id };
      }
    };
  }
};

function persist() {
  if (dbPath !== ':memory:') fs.writeFileSync(dbPath, Buffer.from(sqlite.export()));
}

export function transaction(callback) {
  sqlite.run('BEGIN');
  try { const result = callback(); sqlite.run('COMMIT'); persist(); return result; }
  catch (error) { sqlite.run('ROLLBACK'); throw error; }
}

process.on('exit', persist);