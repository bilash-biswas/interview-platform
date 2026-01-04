import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MessagingManager } from './services/MessagingManager';

export const setupSocketServer = (port: number) => {
  const app = express();
  app.use(cors());
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  const messagingManager = MessagingManager.getInstance();
  messagingManager.init(io);

  httpServer.listen(port, () => {
    console.log(`Socket server running on port ${port}`);
  });

  return messagingManager;
};
