import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { socialRouter } from './routes/social';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const port = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

// Inject io into request for routes to use
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

app.use('/api/social', socialRouter);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'social-service' });
});

io.on('connection', (socket) => {
    console.log('User connected to Social Socket:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from Social Socket');
    });
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
                console.log('Connected to MongoDB (Social Service)');
                connected = true;
            } catch (err) {
                retries--;
                console.error(`Failed to connect to MongoDB (Social), retrying... (${20 - retries}/20)`);
                await new Promise(res => setTimeout(res, 5000));
            }
        }

        if (!connected) {
            throw new Error('Failed to connect to MongoDB after multiple attempts');
        }

        server.listen(port, () => {
            console.log(`Social Service listening on port ${port}`);
        });
    } catch (err) {
        console.error(err);
    }
};

start();
