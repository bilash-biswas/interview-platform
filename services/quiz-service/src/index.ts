import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { questionRouter } from './routes/questions';
import { categoryRouter } from './routes/categories';
import { Question } from './models/question';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/quiz/categories', categoryRouter);
app.use('/api/quiz', questionRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3005;

// Matchmaking Queue
let waitingPlayer: { socketId: string, userId: string, username: string, questionCount: number } | null = null;
const battles: Map<string, any> = new Map();

const start = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI must be defined');
        }
        const mongoUri = process.env.MONGO_URI;
        const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

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

        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();
        
        retries = 20;
        connected = false;
        while (retries > 0 && !connected) {
            try {
                await Promise.all([pubClient.connect(), subClient.connect()]);
                io.adapter(createAdapter(pubClient, subClient));
                console.log('Redis Adapter connected');
                connected = true;
            } catch (err) {
                retries--;
                console.error(`Failed to connect to Redis, retrying... (${20 - retries}/20)`);
                await new Promise(res => setTimeout(res, 5000));
            }
        }

        httpServer.listen(port, () => {
            console.log(`Quiz Service listening on port ${port}`);
        });
    } catch (err) {
        console.error(err);
    }
};

io.on('connection', (socket) => {
    console.log('User connected to quiz-service:', socket.id);

    socket.on('join_battle_queue', async (data: { userId: string, username: string, questionCount: number }) => {
        if (waitingPlayer && waitingPlayer.userId !== data.userId) {
            // Match found
            const battleId = `battle_${Date.now()}`;
            const player1 = waitingPlayer;
            const player2 = { socketId: socket.id, ...data };
            
            waitingPlayer = null;

            // Fetch random questions
            const questions = await Question.aggregate([{ $sample: { size: data.questionCount } }]);
            
            const battleState = {
                id: battleId,
                questions,
                players: {
                    [player1.socketId]: { userId: player1.userId, username: player1.username, score: 0 },
                    [player2.socketId]: { userId: player2.userId, username: player2.username, score: 0 }
                },
                currentIdx: 0,
                turnLocked: false,
                status: 'active'
            };

            battles.set(battleId, battleState);
            
            // Notify players
            io.to(player1.socketId).emit('battle_start', { battleId, opponent: player2.username, questions });
            io.to(player2.socketId).emit('battle_start', { battleId, opponent: player1.username, questions });
            
            // Both players join the battle room for broadcasted updates
            io.in(player1.socketId).socketsJoin(battleId);
            socket.join(battleId);
        } else {
            waitingPlayer = { socketId: socket.id, ...data };
            socket.emit('waiting_for_opponent');
        }
    });

    socket.on('submit_battle_answer', (data: { battleId: string, questionIdx: number, answerIdx: number }) => {
        const battle = battles.get(data.battleId);
        if (!battle || battle.status !== 'active') return;

        // Skip if this question was already answered or turn is locked
        if (battle.currentIdx !== data.questionIdx || battle.turnLocked) return;

        const player = battle.players[socket.id];
        if (!player) return;

        // Lock turn to prevent other player from answering
        battle.turnLocked = true;

        const question = battle.questions[battle.currentIdx];
        const isCorrect = question.correctOptionIndex === data.answerIdx;
        
        if (isCorrect) {
            player.score += 10;
        }

        const responderSocketId = socket.id;

        // Notify everyone about this turn's result
        io.to(data.battleId).emit('battle_update', { 
            players: battle.players,
            lastAnswer: {
                socketId: responderSocketId,
                isCorrect,
                correctIdx: question.correctOptionIndex
            }
        });

        // Small delay before next question to show result
        setTimeout(() => {
            battle.currentIdx++;
            battle.turnLocked = false;

            if (battle.currentIdx >= battle.questions.length) {
                battle.status = 'finished';
                io.to(data.battleId).emit('battle_end', { players: battle.players });
                battles.delete(data.battleId);
            } else {
                io.to(data.battleId).emit('battle_update', { 
                    players: battle.players,
                    currentIdx: battle.currentIdx
                });
            }
        }, 1500);
    });

    socket.on('disconnect', () => {
        if (waitingPlayer?.socketId === socket.id) {
            waitingPlayer = null;
        }
    });
});

start();
