import express, { Request, Response } from 'express';
import { Task } from '../models/task';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const tasks = await Task.find({});
  res.send(tasks);
});

router.post('/', async (req: Request, res: Response) => {
  const { title, description, type, difficulty, content } = req.body;
  
  const task = new Task({ title, description, type, difficulty, content });
  await task.save();

  res.status(201).send(task);
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.send(task);
    } catch (err) {
        res.status(500).send({ message: 'Error fetching task' });
    }
});

export { router as taskRouter };
