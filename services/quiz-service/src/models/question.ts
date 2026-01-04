import mongoose from 'mongoose';

interface QuestionDoc extends mongoose.Document {
  text: string;
  options: string[];
  correctOptionIndex: number;
  category: string;
  difficulty: string;
}

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] }
}, {
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Question = mongoose.model<QuestionDoc>('Question', questionSchema);

export { Question };
