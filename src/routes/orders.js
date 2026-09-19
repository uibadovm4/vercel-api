import { Router } from 'express';
import { db, transaction } from '../db.js';
import { fail, ok } from '../utils.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const orderWithItems = (id) => { const order = db.prepare('SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?').get(id); if (!order) return null; return { ...order, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) }; };

router.post('/', requireAuth, (req, res) => {
  try {
    const order = transaction(() => {
      const cart = db.prepare('SELECT id FROM carts WHERE user_id = ?').get(req.user.id); const items = cart ? db.prepare('SELECT ci.*, p.name, p.price, p.stock FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ?').all(cart.id) : [];
      if (!items.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });
      if (items.some((item) => item.quantity > item.stock)) throw Object.assign(new Error('One or more products are out of stock'), { status: 400 });
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const result = db.prepare('INSERT INTO orders (user_id, total) VALUES (?, ?)').run(req.user.id, total);
      const add = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)'); const reduce = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      for (const item of items) { add.run(result.lastInsertRowid, item.product_id, item.name, item.price, item.quantity); reduce.run(item.quantity, item.product_id); }
      db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id); return orderWithItems(result.lastInsertRowid);
    }); return ok(res, order, 201);
  } catch (error) { if (error.status) return fail(res, error.message, error.status); throw error; }
});
router.get('/', requireAuth, (req, res) => { const orders = req.user.role === 'admin' ? db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() : db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id); return ok(res, orders.map((order) => orderWithItems(order.id))); });
router.get('/:id', requireAuth, (req, res) => { const order = orderWithItems(req.params.id); if (!order) return fail(res, 'Order not found', 404); if (req.user.role !== 'admin' && order.user_id !== req.user.id) return fail(res, 'You cannot view this order', 403); return ok(res, order); });
router.put('/:id/status', requireAuth, requireAdmin, (req, res) => { const allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']; if (!allowed.includes(req.body?.status)) return fail(res, 'Invalid order status'); const result = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.body.status, req.params.id); return result.changes ? ok(res, orderWithItems(req.params.id)) : fail(res, 'Order not found', 404); });
router.post('/:id/cancel', requireAuth, (req, res) => { const order = orderWithItems(req.params.id); if (!order) return fail(res, 'Order not found', 404); if (req.user.role !== 'admin' && order.user_id !== req.user.id) return fail(res, 'You cannot cancel this order', 403); if (!['pending', 'paid', 'processing'].includes(order.status)) return fail(res, 'This order can no longer be cancelled', 409); db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id); return ok(res, orderWithItems(req.params.id)); });
export default router;