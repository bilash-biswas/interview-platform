import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: String, required: true },
    username: { type: String, required: true },
    score: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // in seconds
    submissionTime: { type: Date, default: Date.now }
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

export const ExamResult = mongoose.model('ExamResult', examResultSchema);
