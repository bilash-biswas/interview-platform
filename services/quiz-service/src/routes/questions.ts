import express, { Request, Response } from 'express';
import { Question } from '../models/question';

const router = express.Router();

// GET all questions (with pagination)
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const questions = await Question.find(filter).skip(skip).limit(limit);
  const total = await Question.countDocuments(filter);

  res.json({
    questions,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

// GET one question
router.get('/:id', async (req: Request, res: Response) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json(question);
});

// CREATE question
router.post('/', async (req: Request, res: Response) => {
  const { text, options, correctOptionIndex, category, difficulty } = req.body;
  const question = new Question({ text, options, correctOptionIndex, category, difficulty });
  await question.save();
  res.status(201).json(question);
});

// UPDATE question
router.put('/:id', async (req: Request, res: Response) => {
  const { text, options, correctOptionIndex, category, difficulty } = req.body;
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { text, options, correctOptionIndex, category, difficulty },
    { new: true }
  );
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json(question);
});

// DELETE question
router.delete('/:id', async (req: Request, res: Response) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ message: 'Question deleted' });
});

// Get random questions for battle
router.get('/battle/random', async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const questions = await Question.aggregate([{ $sample: { size: limit } }]);
    res.json(questions);
});

export { router as questionRouter };
