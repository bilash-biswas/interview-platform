import { io, Socket } from 'socket.io-client';

let socket: Socket;

const SOCKET_URL = process.env.NEXT_PUBLIC_QUIZ_SOCKET_URL || 'http://localhost:8000';

export const initQuizSocket = (token: string) => {
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    path: '/socket-quiz',
    transports: ['websocket'],
  });
  return socket;
};

export const getQuizSocket = () => {
    if (!socket) {
        throw new Error('Quiz Socket not initialized');
    }
    return socket;
}
