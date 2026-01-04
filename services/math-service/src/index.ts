import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Initialize DB
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        options TEXT[] NOT NULL,
        correct_option_index INT NOT NULL,
        category VARCHAR(50),
        difficulty VARCHAR(20)
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    // Retry logic could be added here, but for MVP we log and continue
  } finally {
    client.release();
  }
};

// Retry connection logic
const connectWithRetry = () => {
  pool.connect()
    .then(() => {
      console.log('Connected to Postgres');
      initDb();
    })
    .catch((err) => {
      console.error('Failed to connect to Postgres, retrying...', err);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.get('/api/math/questions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed endpoint for convenience (optional)
app.post('/api/math/seed', async (req, res) => {
    try {
        const questions = [
            {
              text: 'Calculate the integral: $$\\int x^2 dx$$',
              options: ['$$x^3/3 + C$$', '$$x^2/2 + C$$', '$$2x + C$$', '$$x^3 + C$$'],
              correct_option_index: 0,
              category: 'Calculus',
              difficulty: 'medium',
            },
            {
              text: 'What is the derivative of $$\\sin(x)$$?',
              options: ['$$-\\cos(x)$$', '$$\\cos(x)$$', '$$\\tan(x)$$', '$$-\\sin(x)$$'],
              correct_option_index: 1,
              category: 'Calculus',
              difficulty: 'easy',
            },
            {
                text: 'Evaluate: $$\\frac{d}{dx}(e^{2x})$$',
                options: ['$$e^{2x}$$', '$$2e^{2x}$$', '$$e^x$$', '$$2e^x$$'],
                correct_option_index: 1,
                category: 'Calculus',
                difficulty: 'medium'
            },
            {
                text: 'Solve for x: $$x^2 - 4 = 0$$',
                options: ['$$2, -2$$', '$$2$$', '$$-2$$', '$$4, -4$$'],
                correct_option_index: 0,
                category: 'Algebra',
                difficulty: 'easy'
            }
          ];
          
          for (const q of questions) {
            await pool.query(
              'INSERT INTO questions (text, options, correct_option_index, category, difficulty) VALUES ($1, $2, $3, $4, $5)',
              [q.text, q.options, q.correct_option_index, q.category, q.difficulty]
            );
          }
          res.json({ message: 'Seeded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Math service listening on port ${PORT}`);
});
