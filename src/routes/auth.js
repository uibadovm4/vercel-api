import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { fail, ok, publicUser } from '../utils.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) return fail(res, 'Name, valid email, and password of at least 6 characters are required');
  try {
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name.trim(), email.trim().toLowerCase(), bcrypt.hashSync(password, 12));
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    return ok(res, { user, token: signToken(user) }, 201);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return fail(res, 'Email is already registered', 409);
    throw error;
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) return fail(res, 'Invalid email or password', 401);
  return ok(res, { user: publicUser(user), token: signToken(user) });
});

router.get('/me', requireAuth, (req, res) => ok(res, req.user));

export default router;