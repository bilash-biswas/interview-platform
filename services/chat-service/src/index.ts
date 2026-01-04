import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Message } from './models/message';
import { chatRouter } from './routes/chat';
import { rabbitWrapper } from './utils/rabbitmq';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/chat', chatRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3002;

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.RABBITMQ_URL) {
      throw new Error('RABBITMQ_URL must be defined');
    }

    await rabbitWrapper.connect(process.env.RABBITMQ_URL);
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

    // Redis Adapter Setup
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
      console.log(`Chat Service listening on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = new Message({
        content: data.content,
        senderId: data.senderId,
        senderName: data.senderName || 'Anonymous',
        recipientId: data.recipientId,
        roomId: data.roomId,
        status: 'sent'
      });
      console.log(`Message from ${data.senderName} in ${data.roomId}: ${data.content}`);
      await message.save();
      console.log(`Emitting receive_message to room ${data.roomId}`);
      io.to(data.roomId).emit('receive_message', message);
      
      // Publish to RabbitMQ for other services (notifications, etc)
      try {
        await rabbitWrapper.publish('chat_events', 'message.created', message);
      } catch (e) {
        console.error('RabbitMQ Publish Error:', e);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

start();
