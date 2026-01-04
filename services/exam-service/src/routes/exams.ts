import express, { Request, Response } from 'express';
import axios from 'axios';
import { Exam } from '../models/exam';
import { ExamResult } from '../models/exam_result';
import { publishNotification } from '../utils/rabbitmq';

const router = express.Router();

// Create Exam
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, category, questionCount, startTime, totalTime, negativeMarkingValue, creatorId } = req.body;

        // Fetch questions from quiz-service
        const quizServiceUrl = process.env.QUIZ_SERVICE_INTERNAL_URL || 'http://quiz-service:3005/api/quiz';
        const response = await axios.get(`${quizServiceUrl}?category=${category}&limit=${questionCount}`);
        
        const questions = response.data.questions.map((q: any) => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            difficulty: q.difficulty,
            categoryId: q.categoryId
        }));

        const exam = new Exam({
            title,
            description,
            category,
            questionCount,
            startTime,
            totalTime,
            negativeMarkingValue,
            creatorId,
            questions
        });

        await exam.save();

        // Notify all (simulated - in real app would target specific users or segments)
        publishNotification('exam.invited', {
            title: exam.title,
            description: exam.description,
            examId: (exam as any)._id,
            startTime: exam.startTime
        });

        res.status(201).json(exam);
    } catch (err: any) {
        console.error('Error creating exam:', err.message);
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

// List Exams
router.get('/', async (req: Request, res: Response) => {
    try {
        const exams = await Exam.find({}, '-questions').sort({ startTime: 1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Get Exam Details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const exam = await Exam.findById(req.params.id, '-questions');
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exam details' });
    }
});

// Get Shuffled Questions for Participant
router.get('/:id/questions', async (req: Request, res: Response) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        // Shuffle questions
        const shuffled = [...exam.questions].sort(() => Math.random() - 0.5);
        
        // Remove correct answers from the response for students
        const questionsForStudent = shuffled.map(q => ({
            text: q.text,
            options: q.options,
            difficulty: q.difficulty,
            categoryId: q.categoryId,
            _id: (q as any)._id
        }));

        res.json(questionsForStudent);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Submit Exam Result
router.post('/:id/submit', async (req: Request, res: Response) => {
    try {
        const { studentId, username, answers, timeSpent } = req.body;
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        let correctCount = 0;
        let wrongCount = 0;

        // "answers" is an object { questionId: selectedIndex }
        exam.questions.forEach((q: any) => {
            const studentAnswer = answers[q._id.toString()];
            if (studentAnswer !== undefined) {
                if (studentAnswer === q.correctOptionIndex) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        });

        const score = (correctCount * 1) - (wrongCount * (Number(exam.negativeMarkingValue) || 0));

        const result = new ExamResult({
            examId: exam._id,
            studentId,
            username,
            score,
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            timeSpent
        });

        await result.save();
        res.status(201).json(result);
    } catch (err) {
        console.error('Error submitting result:', err);
        res.status(500).json({ error: 'Failed to submit result' });
    }
});

// Get Rankings
router.get('/:id/rankings', async (req: Request, res: Response) => {
    try {
        const rankings = await ExamResult.find({ examId: req.params.id })
            .sort({ score: -1, timeSpent: 1 })
            .limit(100);
        res.json(rankings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rankings' });
    }
});

export { router as examRouter };
