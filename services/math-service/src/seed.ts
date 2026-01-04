import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://user:password@localhost:5432/math-db',
});

const questions = [
  // === CALCULUS ===
  {
    text: 'Calculate the integral: $$\\int x^2 \\, dx$$',
    options: ['$$\\frac{x^3}{3} + C$$', '$$\\frac{x^2}{2} + C$$', '$$2x + C$$', '$$x^3 + C$$'],
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
    text: 'Evaluate: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$$',
    options: ['$$0$$', '$$1$$', '$$\\infty$$', 'undefined'],
    correct_option_index: 1,
    category: 'Calculus',
    difficulty: 'hard'
  },
  {
    text: 'What is $$\\frac{d}{dx} \\left( e^{2x} \\right)$$?',
    options: ['$$e^{2x}$$', '$$2e^{2x}$$', '$$2e^x$$', '$$e^x$$'],
    correct_option_index: 1,
    category: 'Calculus',
    difficulty: 'medium'
  },
  {
    text: 'Compute: $$\\int_0^1 x \\, dx$$',
    options: ['$$0$$', '$$\\frac{1}{2}$$', '$$1$$', '$$2$$'],
    correct_option_index: 1,
    category: 'Calculus',
    difficulty: 'easy'
  },

  // === ALGEBRA ===
  {
    text: 'Solve for $$x$$: $$2x + 5 = 15$$',
    options: ['$$4$$', '$$5$$', '$$10$$', '$$7.5$$'],
    correct_option_index: 1,
    category: 'Algebra',
    difficulty: 'easy'
  },
  {
    text: 'Factor: $$x^2 - 9$$',
    options: ['$$x(x - 9)$$', '$$(x - 3)^2$$', '$$(x - 3)(x + 3)$$', '$$(x + 9)(x - 1)$$'],
    correct_option_index: 2,
    category: 'Algebra',
    difficulty: 'medium'
  },
  {
    text: 'What are the roots of $$x^2 + 4x + 4 = 0$$?',
    options: ['$$-2$$', '$$2$$', '$$-4, 0$$', 'No real roots'],
    correct_option_index: 0,
    category: 'Algebra',
    difficulty: 'medium'
  },
  {
    text: 'Simplify: $$\\frac{x^2 - 1}{x - 1}$$ for $$x \\ne 1$$',
    options: ['$$x + 1$$', '$$x - 1$$', '$$x^2$$', '$$1$$'],
    correct_option_index: 0,
    category: 'Algebra',
    difficulty: 'medium'
  },
  {
    text: 'If $$f(x) = 3x + 2$$, what is $$f^{-1}(5)$$?',
    options: ['$$0$$', '$$1$$', '$$\\frac{7}{3}$$', '$$3$$'],
    correct_option_index: 1,
    category: 'Algebra',
    difficulty: 'hard'
  },

  // === GEOMETRY ===
  {
    text: 'Find the area of a circle with radius $$r$$',
    options: ['$$2\\pi r$$', '$$\\pi r^2$$', '$$\\frac{4}{3}\\pi r^3$$', '$$\\pi r$$'],
    correct_option_index: 1,
    category: 'Geometry',
    difficulty: 'easy'
  },
  {
    text: 'What is the volume of a sphere with radius $$r$$?',
    options: ['$$\\pi r^2$$', '$$\\frac{4}{3}\\pi r^3$$', '$$4\\pi r^2$$', '$$2\\pi r^3$$'],
    correct_option_index: 1,
    category: 'Geometry',
    difficulty: 'medium'
  },
  {
    text: 'In a right triangle, if legs are 3 and 4, what is the hypotenuse?',
    options: ['$$5$$', '$$6$$', '$$7$$', '$$\\sqrt{7}$$'],
    correct_option_index: 0,
    category: 'Geometry',
    difficulty: 'easy'
  },
  {
    text: 'The sum of interior angles of a hexagon is:',
    options: ['$$540^\\circ$$', '$$720^\\circ$$', '$$360^\\circ$$', '$$180^\\circ$$'],
    correct_option_index: 1,
    category: 'Geometry',
    difficulty: 'medium'
  },
  {
    text: 'What is the area of an equilateral triangle with side length $$s$$?',
    options: ['$$\\frac{\\sqrt{3}}{4}s^2$$', '$$\\frac{1}{2}s^2$$', '$$s^2$$', '$$\\frac{\\sqrt{2}}{2}s^2$$'],
    correct_option_index: 0,
    category: 'Geometry',
    difficulty: 'hard'
  },

  // === TRIGONOMETRY ===
  {
    text: 'What is $$\\sin^2(x) + \\cos^2(x)$$?',
    options: ['$$0$$', '$$1$$', '$$\\sin(2x)$$', '$$\\tan(x)$$'],
    correct_option_index: 1,
    category: 'Trigonometry',
    difficulty: 'easy'
  },
  {
    text: 'What is $$\\tan(45^\\circ)$$?',
    options: ['$$0$$', '$$1$$', '$$\\frac{\\sqrt{2}}{2}$$', '$$\\infty$$'],
    correct_option_index: 1,
    category: 'Trigonometry',
    difficulty: 'easy'
  },
  {
    text: 'Solve for $$x$$ in $$[0, 2\\pi)$$: $$\\cos(x) = 0$$',
    options: ['$$\\frac{\\pi}{2}, \\frac{3\\pi}{2}$$', '$$0, \\pi$$', '$$\\frac{\\pi}{4}, \\frac{5\\pi}{4}$$', '$$\\pi$$'],
    correct_option_index: 0,
    category: 'Trigonometry',
    difficulty: 'medium'
  },
  {
    text: 'What is the period of $$y = \\sin(2x)$$?',
    options: ['$$\\pi$$', '$$2\\pi$$', '$$\\frac{\\pi}{2}$$', '$$4\\pi$$'],
    correct_option_index: 0,
    category: 'Trigonometry',
    difficulty: 'medium'
  }
];

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Connected to DB');
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
    
    // Check if empty
    const { rows } = await client.query('SELECT count(*) FROM questions');
    if (parseInt(rows[0].count) > 0) {
        console.log('Database already has data, skipping seed.');
        return;
    }

    console.log('Seeding data...');
    for (const q of questions) {
      await client.query(
        'INSERT INTO questions (text, options, correct_option_index, category, difficulty) VALUES ($1, $2, $3, $4, $5)',
        [q.text, q.options, q.correct_option_index, q.category, q.difficulty]
      );
    }
    console.log('Seeded successfully');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
