import express from 'express';
import apiRouter from './apiRouter.js';

export function apiMiddleware() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(app);
    }
  };
}
