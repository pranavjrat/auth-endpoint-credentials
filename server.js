import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import db from './db/index.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import journalRoutes from './routes/journal.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/journals', journalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JWT Authentication and Journal API' });
});

// Start server
try {
  await db.connect();
  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
} catch (err) {
  console.error('Failed to connect to database', err);
  process.exit(1);
}

