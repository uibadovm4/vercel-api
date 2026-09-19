import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { fail } from '../utils.js';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'development-only-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return fail(res, 'Authentication token required', 401);
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'development-only-secret');
    req.user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.id);
    if (!req.user) return fail(res, 'User not found', 401);
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return fail(res, 'Admin access required', 403);
  next();
}