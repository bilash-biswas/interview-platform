import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const NOTIFICATION_SOCKET_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL || 'http://localhost:3008';

export const initNotificationSocket = (userId: string) => {
  if (socket) return socket;

  socket = io(NOTIFICATION_SOCKET_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to notification service');
    if (socket) {
      socket.emit('register', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notification service');
  });

  return socket;
};

export const getNotificationSocket = () => {
  return socket;
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
