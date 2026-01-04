import { Server, Socket } from 'socket.io';

interface UserConnection {
  userId: string;
  socketId: string;
}

export class MessagingManager {
  private static instance: MessagingManager;
  private io: Server | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  private constructor() {}

  public static getInstance(): MessagingManager {
    if (!MessagingManager.instance) {
      MessagingManager.instance = new MessagingManager();
    }
    return MessagingManager.instance;
  }

  public init(io: Server) {
    this.io = io;
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`New client connected: ${socket.id}`);

      socket.on('register', (userId: string) => {
        console.log(`User ${userId} registered with socket ${socket.id}`);
        this.userSockets.set(userId, socket.id);
      });

      socket.on('location_update', (location: { latitude: number, longitude: number }) => {
        const userId = Array.from(this.userSockets.entries()).find(([, s]) => s === socket.id)?.[0];
        if (userId) {
          // Broadcast location to all other users
          this.broadcast('user_location', { userId, location });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Remove registration
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
      });
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
      console.log(`Sent ${event} to user ${userId}`);
      return true;
    }
    console.log(`User ${userId} not connected, could not send ${event}`);
    return false;
  }

  public broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Broadcasted ${event}`);
    }
  }
}
