import mongoose from 'mongoose';

export enum TaskType {
  MCQ = 'mcq',
  CODING = 'coding',
  SYSTEM_DESIGN = 'system_design'
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(TaskType),
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const Task = mongoose.model('Task', taskSchema);

export { Task };
