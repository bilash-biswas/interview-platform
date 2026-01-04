import mongoose from 'mongoose';
import { Question } from './models/question';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-db';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding');

        // Clear existing questions
        await Question.deleteMany({});
        console.log('Cleared existing questions');

        const categories = ['Javascript', 'React', 'Node.js', 'DevOps', 'System Design'];
        const difficulties = ['easy', 'medium', 'hard'];

        const questions = [];
        for (let i = 1; i <= 1000; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            
            questions.push({
                text: `Sample Question ${i} for ${category}: What is the output of X?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctOptionIndex: Math.floor(Math.random() * 4),
                category,
                difficulty
            });
        }

        await Question.insertMany(questions);
        console.log('Successfully seeded 1000 questions');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
