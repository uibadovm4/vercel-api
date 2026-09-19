<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:0ea5e9&height=180&section=header&text=Commerce%20API&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Express%20%7C%20SQLite%20%7C%20Vercel&descAlignY=62&descSize=18" alt="Commerce API banner" width="100%" />

# E-commerce REST API

**A practical, documented backend for products, carts, orders, ratings, and admin workflows.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-16a34a?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-111827?logo=express&logoColor=white)](https://expressjs.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)
[![License](https://img.shields.io/badge/license-learning%20project-0ea5e9)](LICENSE)

<br />

[Live API](#deploy-to-vercel) · [Interactive docs](#api-docs) · [Local setup](#run-locally)

</div>

## What is inside

| Area | Routes | Purpose |
| --- | --- | --- |
| Auth | `/api/auth` | Register, login, and JWT tokens |
| Catalog | `/api/products`, `/api/categories` | Search, filter, sort, and manage products |
| Shopping | `/api/cart`, `/api/orders` | Cart operations and order lifecycle |
| Community | `/api/ratings` | Product ratings and reviews |
| Operations | `/api/users`, `/api/contact` | User management and contact email |

The API returns predictable response envelopes:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Product not found" }
```

## API docs

Run the app and open [`/docs`](http://localhost:3000/docs) for the Swagger UI. The root endpoint at [`/`](http://localhost:3000/) reports the API version and available sections.

Protected routes use:

```text
Authorization: Bearer <token>
```

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Useful commands:

```bash
npm start       # start the API
npm run dev     # start with Node's watch mode
npm test        # run the smoke tests
npm run db:seed # create the admin account and sample data
```

## Deploy to Vercel

This repository includes a Vercel function entrypoint at `api/index.js` and a rewrite in `vercel.json`.

### One-click setup

1. Push the repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Keep the detected framework as **Other** and the default build settings.
4. Add the variables from `.env.example` under **Project Settings -> Environment Variables**.
5. Deploy, then open `https://your-project.vercel.app/docs`.

### CLI setup

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

For a production deployment, set a long random `JWT_SECRET`, a strong admin password, and SMTP values in Vercel. Never commit `.env` or paste real credentials into the README.

### Enable contact email

The contact endpoint returns `503` until all four email variables are configured for the **Production** environment:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
CONTACT_EMAIL
```

In Vercel, open **Project Settings -> Environment Variables**, add or edit each value with **Production** selected, then redeploy. Gmail requires an App Password, not the normal account password. After changing a variable, deploy again with `npx vercel --prod`.

## Environment variables

Copy `.env.example` to `.env` for local work. `DB_PATH` is optional.

| Variable | Required | Example |
| --- | --- | --- |
| `PORT` | Local only | `3000` |
| `JWT_SECRET` | Yes | long random string |
| `JWT_EXPIRES_IN` | Yes | `7d` |
| `DB_PATH` | No | `./data/ecommerce.db` |
| `CONTACT_EMAIL` | For contact mail | `you@example.com` |
| `SMTP_HOST` / `SMTP_PORT` | For contact mail | `smtp.gmail.com` / `587` |
| `SMTP_USER` / `SMTP_PASS` | For contact mail | SMTP account and app password |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed command | admin credentials |

## Storage note

Local development uses `data/ecommerce.db`. On Vercel, the default is `/tmp/ecommerce.db`, which is writable but **ephemeral**: data can disappear when the function is recreated. Use a hosted SQLite-compatible service such as Turso/libSQL, or another managed relational database, before using this API for persistent production data.

## Project map

```text
api/index.js       Vercel function adapter
src/server.js      Local listener and Vercel export
src/app.js         Express app and route registration
src/db.js          sql.js adapter and persistence
src/seed.js        Admin and sample data bootstrap
src/routes/        Auth, users, catalog, cart, orders, ratings, contact
schema.sql         Relational schema and indexes
test/              Smoke and template tests
```

## License

This is a learning project. Adapt it to your own security, persistence, observability, and compliance requirements before production use.
