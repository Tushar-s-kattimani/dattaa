import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from '../server/apiRouter.js';
import { connectDB } from '../server/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error:', err);
  }
  next();
});

// On Vercel, requests might be forwarded with or without the /api prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
