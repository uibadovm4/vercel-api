import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
process.env.NODE_ENV = 'test'; process.env.DB_PATH = ':memory:'; process.env.JWT_SECRET = 'test-secret';
const { default: app } = await import('../src/app.js');

test('homepage, docs, registration, auth, and product listing work', async () => {
  const server = http.createServer(app); await new Promise((resolve) => server.listen(0, resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const home = await fetch(`${url}/`); assert.equal(home.status, 200); assert.equal((await home.json()).success, true);
  const docs = await fetch(`${url}/docs/`); assert.equal(docs.status, 200);
  const docsCss = await fetch(`${url}/docs/swagger-ui.css`); assert.equal(docsCss.status, 200); assert.match(docsCss.headers.get('content-type'), /text\/css/);
  const docsBundle = await fetch(`${url}/docs/swagger-ui-bundle.js`); assert.equal(docsBundle.status, 200); assert.match(docsBundle.headers.get('content-type'), /javascript/);
  const register = await fetch(`${url}/api/auth/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'secret123' }) });
  assert.equal(register.status, 201); const registered = await register.json(); assert.ok(registered.data.token);
  const me = await fetch(`${url}/api/auth/me`, { headers: { authorization: `Bearer ${registered.data.token}` } }); assert.equal(me.status, 200);
  const products = await fetch(`${url}/api/products`); assert.equal(products.status, 200); assert.deepEqual((await products.json()).data, []);
  await new Promise((resolve) => server.close(resolve));
});