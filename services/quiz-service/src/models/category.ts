import mongoose from 'mongoose';

interface CategoryDoc extends mongoose.Document {
  name: string;
  description: string;
  icon?: string;
}

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String }
}, {
  toJSON: {
    transform(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Category = mongoose.model<CategoryDoc>('Category', categorySchema);

export { Category };
