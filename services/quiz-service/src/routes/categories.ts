import express, { Request, Response } from 'express';
import { Category } from '../models/category';

const router = express.Router();

// GET all categories
router.get('/', async (req: Request, res: Response) => {
  const categories = await Category.find();
  res.json(categories);
});

// GET one category
router.get('/:id', async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// CREATE category
router.post('/', async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  const category = new Category({ name, description, icon });
  await category.save();
  res.status(201).json(category);
});

// UPDATE category
router.put('/:id', async (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, icon },
    { new: true }
  );
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// DELETE category
router.delete('/:id', async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json({ message: 'Category deleted' });
});

export { router as categoryRouter };
