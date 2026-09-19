import { Router } from 'express';
import { db } from '../db.js';
import { fail, ok } from '../utils.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', (req, res) => ok(res, db.prepare('SELECT * FROM categories ORDER BY name').all()));
router.get('/:id', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  return category ? ok(res, category) : fail(res, 'Category not found', 404);
});
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, description = '' } = req.body || {};
  if (!name?.trim()) return fail(res, 'Category name is required');
  const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name.trim(), description);
  return ok(res, db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid), 201);
});
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!current) return fail(res, 'Category not found', 404);
  db.prepare('UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.name?.trim() || current.name, req.body.description ?? current.description, req.params.id);
  return ok(res, db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id)) return fail(res, 'Category not found', 404);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  return ok(res, { message: 'Category deleted' });
});
export default router;