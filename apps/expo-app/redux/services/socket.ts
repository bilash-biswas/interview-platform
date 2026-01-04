import { io, Socket } from 'socket.io-client';

let socket: Socket;

const SOCKET_URL = 'http://192.168.10.235:8000'; // Gateway port with WS support

export const initSocket = (token: string) => {
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    path: '/socket-chat',
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    console.log('Connected to chat service');
  });
  socket.on('disconnect', () => {
    console.log('Disconnected from chat service');
  });
  return socket;
};

export const getSocket = () => {
    if (!socket) {
        return null;
    }
    return socket;
}
