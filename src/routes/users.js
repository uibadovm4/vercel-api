import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { fail, ok } from '../utils.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const findUser = (id) => db.prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?').get(id);
const canManage = (req, id) => req.user.role === 'admin' || req.user.id === Number(id);

router.get('/:id', requireAuth, (req, res) => canManage(req, req.params.id) ? ok(res, findUser(req.params.id)) : fail(res, 'You can only view your own profile', 403));
router.put('/:id', requireAuth, (req, res) => {
  if (!canManage(req, req.params.id)) return fail(res, 'You can only update your own profile', 403);
  const existing = findUser(req.params.id);
  if (!existing) return fail(res, 'User not found', 404);
  const { name, email, password, role } = req.body || {};
  const nextRole = req.user.role === 'admin' && role ? role : existing.role;
  if (!['customer', 'admin'].includes(nextRole)) return fail(res, 'Invalid role');
  db.prepare('UPDATE users SET name = ?, email = ?, password_hash = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name?.trim() || existing.name, email?.trim().toLowerCase() || existing.email, password ? bcrypt.hashSync(password, 12) : db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.params.id).password_hash, nextRole, req.params.id);
  return ok(res, findUser(req.params.id));
});
router.delete('/:id', requireAuth, (req, res) => {
  if (!canManage(req, req.params.id)) return fail(res, 'You can only delete your own account', 403);
  if (!findUser(req.params.id)) return fail(res, 'User not found', 404);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  return ok(res, { message: 'User deleted' });
});

export default router;