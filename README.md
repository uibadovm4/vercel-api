# E-commerce REST API

Beginner-friendly Node.js REST API for an e-commerce site. It uses Express, JavaScript, SQLite, JWT authentication, Nodemailer, and Swagger UI.

## Run locally

```bash
npm install
copy .env.example .env
npm run db:seed
npm run dev
```

Open:

- API home: http://localhost:3000/
- Interactive documentation: http://localhost:3000/docs

`npm test` runs the smoke test with an in-memory SQLite database.

## Environment

Copy `.env.example` to `.env` and change `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Contact email requires SMTP settings. For Gmail, create an App Password and use it as `SMTP_PASS`; never send these values to a browser or commit `.env`.

## API overview

All responses use one of these shapes:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Product not found" }
```

Use `Authorization: Bearer <token>` for protected routes. The seed command creates an admin account. Admin-only product, category, order-status, and user-management actions require the admin token.

Product listing supports `search`, `category_id`, `min_price`, `max_price`, `sort=price_asc`, and `sort=price_desc`.

## Database and Vercel

The schema is in `schema.sql`. The local `data/ecommerce.db` file is created automatically and is ignored by Git. `src/db.js` is a small adapter around SQLite, so a hosted database client can replace it later without rewriting the routes.

Vercel serverless functions do not provide reliable persistent writable disk storage. The local SQLite file is for learning and local development only. Before production deployment, replace the adapter with a hosted SQLite-compatible service such as Turso/libSQL, or another hosted relational database. Keep secrets in Vercel Environment Variables.

The included `vercel.json` exports the Express app from `src/server.js`. Deploy with the Vercel CLI or connect the repository in the Vercel dashboard after moving the database to hosted storage.

## Project structure

```text
src/
  app.js              Express app and route registration
  server.js           Local listener and Vercel export
  db.js               SQLite adapter and schema initialization
  swagger.js          OpenAPI document used by /docs
  seed.js             Admin bootstrap command
  middleware/auth.js  JWT authentication and admin authorization
  routes/             Auth, users, products, categories, cart, orders, ratings, contact
schema.sql             Relational schema and indexes
test/                  Local smoke test
```