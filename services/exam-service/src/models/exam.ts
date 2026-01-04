import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    questionCount: { type: Number, required: true },
    startTime: { type: Date, required: true },
    totalTime: { type: Number, required: true }, // in minutes
    negativeMarkingValue: { type: Number, default: 0 }, // 0 to 1
    creatorId: { type: String, required: true },
    questions: [{
        text: String,
        options: [String],
        correctOptionIndex: Number,
        difficulty: String,
        categoryId: String
    }]
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            const result = ret as any;
            result.id = result._id;
            delete result._id;
            delete result.__v;
            return result;
        }
    }
});

export const Exam = mongoose.model('Exam', examSchema);
