import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Use host IP for mobile devices to connect to local services
const NOTIFICATION_SOCKET_URL = 'http://192.168.10.235:3008'; 

export const initNotificationSocket = (userId: string) => {
  if (socket) return socket;

  socket = io(NOTIFICATION_SOCKET_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to notification service (Expo)');
    if (socket) {
      socket.emit('register', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notification service (Expo)');
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
