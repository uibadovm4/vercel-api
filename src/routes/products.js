import { Router } from 'express';
import { db } from '../db.js';
import { fail, ok } from '../utils.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const select = `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id`;
const getProduct = (id) => db.prepare(`${select} WHERE p.id = ?`).get(id);

router.get('/', (req, res) => {
  const { search, category_id: categoryId, min_price: minPrice, max_price: maxPrice, sort = 'newest' } = req.query;
  const conditions = [], values = [];
  if (search) { conditions.push('(p.name LIKE ? OR p.description LIKE ?)'); values.push(`%${search}%`, `%${search}%`); }
  if (categoryId) { conditions.push('p.category_id = ?'); values.push(categoryId); }
  if (minPrice) { conditions.push('p.price >= ?'); values.push(Number(minPrice)); }
  if (maxPrice) { conditions.push('p.price <= ?'); values.push(Number(maxPrice)); }
  const order = sort === 'price_asc' ? 'p.price ASC' : sort === 'price_desc' ? 'p.price DESC' : 'p.created_at DESC';
  return ok(res, db.prepare(`${select} ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY ${order}`).all(...values));
});
router.get('/:id', (req, res) => { const product = getProduct(req.params.id); return product ? ok(res, product) : fail(res, 'Product not found', 404); });
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, description = '', price, stock = 0, category_id: categoryId = null, image_url: imageUrl = null } = req.body || {};
  if (!name?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return fail(res, 'Name and a non-negative price are required');
  const result = db.prepare('INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)').run(name.trim(), description, Number(price), Number(stock), categoryId, imageUrl);
  return ok(res, getProduct(result.lastInsertRowid), 201);
});
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const current = getProduct(req.params.id); if (!current) return fail(res, 'Product not found', 404);
  const body = req.body || {};
  db.prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(body.name?.trim() || current.name, body.description ?? current.description, body.price ?? current.price, body.stock ?? current.stock, body.category_id ?? current.category_id, body.image_url ?? current.image_url, req.params.id);
  return ok(res, getProduct(req.params.id));
});
router.delete('/:id', requireAuth, requireAdmin, (req, res) => { if (!getProduct(req.params.id)) return fail(res, 'Product not found', 404); db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id); return ok(res, { message: 'Product deleted' }); });
export default router;