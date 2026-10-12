import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './apiRouter.js';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MongoDB API Server running at http://localhost:${PORT}`);
  });
});

export default app;
