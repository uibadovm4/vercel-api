import { Router } from 'express';
import { db } from '../db.js';
import { fail, ok } from '../utils.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const getCart = (userId) => db.prepare(`SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url, (ci.quantity * p.price) AS subtotal FROM cart_items ci JOIN carts c ON c.id = ci.cart_id JOIN products p ON p.id = ci.product_id WHERE c.user_id = ? ORDER BY p.name`).all(userId);
const cartId = (userId) => { let cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(userId); if (!cart) { const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(userId); cart = { id: result.lastInsertRowid }; } return cart.id; };

router.get('/', requireAuth, (req, res) => { const items = getCart(req.user.id); return ok(res, { items, total: items.reduce((sum, item) => sum + item.subtotal, 0) }); });
router.post('/', requireAuth, (req, res) => {
  const { product_id: productId, quantity = 1 } = req.body || {};
  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
  if (!product) return fail(res, 'Product not found', 404);
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > product.stock) return fail(res, 'Quantity is not available');
  const id = cartId(req.user.id);
  db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?) ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity').run(id, productId, quantity);
  return ok(res, getCart(req.user.id), 201);
});
router.put('/:productId', requireAuth, (req, res) => {
  const quantity = Number(req.body?.quantity); const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(req.params.productId);
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return fail(res, 'Product or quantity is invalid', 400);
  const result = db.prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?').run(quantity, cartId(req.user.id), req.params.productId);
  return result.changes ? ok(res, getCart(req.user.id)) : fail(res, 'Cart item not found', 404);
});
router.delete('/:productId', requireAuth, (req, res) => { const result = db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId(req.user.id), req.params.productId); return result.changes ? ok(res, { message: 'Item removed' }) : fail(res, 'Cart item not found', 404); });
router.delete('/', requireAuth, (req, res) => { db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId(req.user.id)); return ok(res, { message: 'Cart cleared' }); });
export default router;