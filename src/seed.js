import bcrypt from 'bcryptjs';
import { db } from './db.js';

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'change-this-password';
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (!existing) db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Administrator', email, bcrypt.hashSync(password, 12), 'admin');
console.log(`Admin ready: ${email}`);