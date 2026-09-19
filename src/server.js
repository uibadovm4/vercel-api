import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';

const port = Number(
  process.env.PORT || 3000
);

if (
  !process.env.VERCEL &&
  process.env.NODE_ENV !== 'test'
) {
  app.listen(
    port,
    () => {
      console.log(
        `API running at http://localhost:${port}`
      );
    }
  );
}

export default app;