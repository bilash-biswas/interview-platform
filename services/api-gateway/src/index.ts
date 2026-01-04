import express from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 8000;

app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Auth Service
const authProxy = createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    changeOrigin: true,
    pathFilter: '/api/auth'
});
app.use(authProxy);

// Chat Service (HTTP & Socket)
const chatSocketProxy = createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL || 'http://chat-service:3002',
    changeOrigin: true,
    ws: true,
    pathFilter: ['/api/chat', '/socket-chat'],
    pathRewrite: { '^/socket-chat': '/socket.io' }
});
app.use(chatSocketProxy);

// Quiz Service (HTTP & Socket)
const quizSocketProxy = createProxyMiddleware({
    target: process.env.QUIZ_SERVICE_URL || 'http://quiz-service:3005',
    changeOrigin: true,
    ws: true,
    pathFilter: ['/api/quiz', '/socket-quiz'],
    pathRewrite: { '^/socket-quiz': '/socket.io' }
});
app.use(quizSocketProxy);

// Social Service (HTTP & Socket)
const socialSocketProxy = createProxyMiddleware({
    target: process.env.SOCIAL_SERVICE_URL || 'http://social-service:3007',
    changeOrigin: true,
    ws: true,
    pathFilter: ['/api/social', '/socket-social'],
    pathRewrite: { '^/socket-social': '/socket.io' }
});
app.use(socialSocketProxy);

// Fallback for legacy /socket.io
app.use(createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL || 'http://chat-service:3002',
    changeOrigin: true,
    ws: true,
    pathFilter: '/socket.io'
}));

// Other Services
app.use(createProxyMiddleware({ target: process.env.INTERVIEW_SERVICE_URL || 'http://interview-service:3003', changeOrigin: true, pathFilter: '/api/tasks' }));
app.use(createProxyMiddleware({ target: process.env.CODE_EXECUTION_SERVICE_URL || 'http://code-execution-service:3004', changeOrigin: true, pathFilter: '/api/code', pathRewrite: { '^/api/code': '' } }));
app.use(createProxyMiddleware({ target: process.env.EXAM_SERVICE_URL || 'http://exam-service:3006', changeOrigin: true, pathFilter: '/api/exams' }));
app.use(createProxyMiddleware({ target: process.env.MATH_SERVICE_URL || 'http://math-service:3009', changeOrigin: true, pathFilter: '/api/math' }));
app.use(createProxyMiddleware({ target: process.env.AI_SERVICE_URL || 'http://ai-service:3010', changeOrigin: true, pathFilter: '/api/ai' }));



app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// CRITICAL: Handle WebSocket upgrade manually
httpServer.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/socket-chat') || req.url?.startsWith('/socket.io')) {
        (chatSocketProxy as any).upgrade(req, socket, head);
    } else if (req.url?.startsWith('/socket-quiz')) {
        (quizSocketProxy as any).upgrade(req, socket, head);
    } else if (req.url?.startsWith('/socket-social')) {
        (socialSocketProxy as any).upgrade(req, socket, head);
    }
});

httpServer.listen(port, () => {
  console.log(`API Gateway listening on port ${port} with Advanced WebSocket Proxying`);
});


