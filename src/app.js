import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import './db.js';
import swaggerSpec from './swagger.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import ratingRoutes from './routes/ratings.js';
import contactRoutes from './routes/contact.js';

import { fail } from './utils.js';


// ============================================================
// EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);


// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin: true,
    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Authorization'
    ],
    optionsSuccessStatus: 204,
    credentials: true
  })
);


// ============================================================
// BODY PARSER
// ============================================================

app.use(
  express.json({
    limit: '1mb'
  })
);


// ============================================================
// API INFORMATION
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'E-commerce REST API',
      version: '1.0.0',
      description:
        'Local SQLite API ready for a future hosted database migration.',

      sections: [
        'authentication',
        'users',
        'products',
        'categories',
        'cart',
        'orders',
        'ratings',
        'contact',
        'admin'
      ],

      documentation: '/docs'
    }
  });
});


// ============================================================
// SWAGGER UI
// ============================================================

// Swagger documentation page

const swaggerHtml = swaggerUi
  .generateHTML(swaggerSpec, {
    customSiteTitle: 'E-commerce REST API docs'
  })
  .replace(
    './swagger-ui.css',
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.0/swagger-ui.css'
  )
  .replace(
    './swagger-ui-bundle.js',
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.0/swagger-ui-bundle.js'
  )
  .replace(
    './swagger-ui-standalone-preset.js',
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.0/swagger-ui-standalone-preset.js'
  )
  .replace(
    '<script src="./swagger-ui-init.js"> </script>',
    `<script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          spec: ${JSON.stringify(swaggerSpec)},
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: 'StandaloneLayout'
        });
      };
    </script>`
  );

app.use(
  '/docs',
  (req, res) => res.send(swaggerHtml)
);


// ============================================================
// API ROUTES
// ============================================================

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/products',
  productRoutes
);

app.use(
  '/api/categories',
  categoryRoutes
);

app.use(
  '/api/cart',
  cartRoutes
);

app.use(
  '/api/orders',
  orderRoutes
);

app.use(
  '/api/ratings',
  ratingRoutes
);

app.use(
  '/api/contact',
  contactRoutes
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    return fail(
      res,
      'Route not found',
      404
    );
  }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (error, req, res, next) => {
    console.error(error);

    if (
      error.code === 'SQLITE_CONSTRAINT_UNIQUE'
    ) {
      return fail(
        res,
        'A record with that value already exists',
        409
      );
    }

    return fail(
      res,
      'Internal server error',
      500
    );
  }
);


// ============================================================
// EXPORT
// ============================================================

export default app;