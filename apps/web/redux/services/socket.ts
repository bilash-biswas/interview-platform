import { io, Socket } from 'socket.io-client';

let socket: Socket;

// Connect to Chat Service directly or via Gateway (gateway is better but needs ws support)
// For simplicity, we might connect directly to chat service port 3002 locally
// or use the proxy path. Since proxy path for WS can be tricky with express-http-proxy,
// let's assume direct connection for dev or correct Gateway config later.
// We'll try Gateway path first: http://localhost:8000 (with path rewrites if configured)
// But standard socket.io client expects specific path.
// Let's use direct port 3002 for the MVP to avoid gateway WS issues for now.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

export const initSocket = (token: string) => {
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    path: '/socket-chat',
    transports: ['websocket'],
  });
  return socket;
};

export const getSocket = () => {
    if (!socket) {
        throw new Error('Socket not initialized');
    }
    return socket;
}
