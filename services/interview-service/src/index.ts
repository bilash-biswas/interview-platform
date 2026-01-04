import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { taskRouter } from './routes/tasks';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'interview-service' });
});

const start = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI must be defined');
        }
        const mongoUri = process.env.MONGO_URI;

        let connected = false;
        let retries = 20;
        while (retries > 0 && !connected) {
            try {
                await mongoose.connect(mongoUri);
                console.log('Connected to MongoDB');
                connected = true;
            } catch (err) {
                retries--;
                console.error(`Failed to connect to MongoDB, retrying... (${20 - retries}/20)`);
                await new Promise(res => setTimeout(res, 5000));
            }
        }

        if (!connected) {
            throw new Error('Failed to connect to MongoDB after multiple attempts');
        }

        app.listen(port, () => {
            console.log(`Interview Service listening on port ${port}`);
        });
    } catch (err) {
        console.error(err);
    }
};

start();
