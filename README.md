# 🎓 Enterprise Interview Platform

A scalable, full-stack microservice platform designed for technical interview preparation. It features real-time communication, AI-powered analysis, coding sandboxes, and interactive quizzes.

## 🏗 System Architecture

The platform uses a **Polyglot Microservice Architecture** orchestrated by Docker Compose.

### 🔌 API Gateway (NGINX)
*   **Port**: `8000`
*   **Role**: Reverse Proxy, Load Balancing, WebSocket Upgrade.
*   **Tech**: NGINX (Alpine Image).
*   All external traffic routes through this gateway (e.g., `http://localhost:8000/api/...`).

### 📦 Backend Services (Microservices)
| Service | Tech Stack | Port | Database | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | Node.js / Express | `3001` | MongoDB | JWT Authentication, User Management. |
| **Chat** | Node.js / Socket.io | `3002` | MongoDB | Real-time 1:1 and Group Chat. |
| **Interview** | Node.js / Express | `3003` | MongoDB | Mock Interview scheduling & feedback. |
| **Code Execution** | Node.js / Docker | `3004` | - | Sandboxed executing of Python/JS code. |
| **Quiz** | Node.js / Express | `3005` | MongoDB | MCQ Quizzes with real-time timers. |
| **Exam** | Node.js / Express | `3006` | MongoDB | Full-length mock exams. |
| **Social** | Node.js / Express | `3007` | MongoDB | Community feed, posts, likes, comments. |
| **Notification** | Node.js / Socket.io | `3008` | - | Real-time push notifications. |
| **Math** | Node.js / Express | `3009` | **PostgreSQL** | Random math problem generator (Calculus/Algebra). |
| **AI** | **Python / Django** | `3010` | SQLite | Sentiment Analysis & Static Code Review. |

### 🧠 Infrastructure
*   **RabbitMQ**: Async message broker for decoupling services (e.g., Chat -> Notification).
*   **Redis**: High-speed caching for sessions and real-time state.
*   **MongoDB Atlas**: Primary NoSQL database for flexible document storage.
*   **PostgreSQL**: Relational database for structured mathematical datasets.

### 📱 Frontend Applications
| Application | Stack | Port | Features |
| :--- | :--- | :--- | :--- |
| **Web App** | **Next.js 14** (React) | `3000` | Full Dashboard, Admin Panel, Code Editor. |
| **Mobile App** | **Expo** (React Native) | `8081` | Native iOS/Android experience, Push Notifications. |

---

## 🚀 Quick Start Guide

### Prerequisites
*   Docker Desktop (Running)
*   Node.js v18+

### 1. Installation
Clone the repository and install dependencies for the frontends:
```bash
# Install Web dependencies
cd apps/web
npm install

# Install Mobile dependencies
cd ../../apps/expo-app
npm install
```

### 2. Environment Setup
The project comes with auto-configured `.env` files for backend services.
For the Web App, setup the local env:
```bash
cd apps/web
cp env_example .env.local
```

### 3. Start the Platform
Run the entire stack with Docker Compose:
```bash
docker-compose up --build
```
*Wait until you see "API Gateway listening on port 8000" or similar NGINX logs.*

### 4. Run Frontends (New Terminals)
**Web Dashboard**:
```bash
cd apps/web
npm run dev
# Open http://localhost:3000
```

**Mobile App**:
```bash
cd apps/expo-app
npx expo start
# Scan QR code or press 'a' for Android Emulator
```

---

## ✨ Features & How to Use

### 🤖 AI Intelligence Hub (NEW)
Powered by a Python/Django microservice performing logic/AST analysis.
*   **Text Analysis**: Enter any text to get a Sentiment Score (Positive/Negative) and a Keyword Summary.
*   **Smart Code Reviewer**: Paste Python code to receive feedback on Time Complexity (Big O), styling, and potential bugs (e.g., infinite loops).
*   **Try it**: Go to `/ai` on Web or tap **AI LAB** on Mobile.

### 🧮 Math Laboratory (NEW)
Powered by PostgreSQL and a dedicated Node.js service.
*   **Practice**: Solve randomized Calculus, Algebra, and Geometry problems.
*   **Rendering**: High-fidelity LaTeX equation rendering on both Web and Mobile.
*   **Try it**: Go to `/math` on Web or tap **MATH LAB** on Mobile.

### 💬 Real-Time Chat System
*   **Features**: Instant messaging, typing indicators, read receipts.
*   **Architecture**: Uses Socket.io routed through NGINX.
*   **Try it**: Login with two different browsers (incognito) and send messages.

### 💻 Code Execution Sandbox
*   **Features**: Run code safely in an isolated Docker container.
*   **Supported Languages**: Python, JavaScript.
*   **Try it**: Navigate to the "Code Editor" section in the Interview Module.

### 👥 Social Community
*   **Features**: Create posts, like, comment, and follow others.
*   **Try it**: access the "Feed" tab on Mobile or Web.

---

## 🔧 Troubleshooting

**"Docker container failed to start"**
*   Check logs: `docker-compose logs <service_name>`
*   Ensure ports (3000-3010, 8000) are not occupied by other apps.

**"API Network Error" on Mobile**
*   Ensure your phone is on the same Wi-Fi as your PC.
*   Update `EXPO_PUBLIC_API_URL` in `apps/expo-app/.env` to your PC's local IP address (e.g., `http://192.168.1.5:8000/api`).

**"Login Failed"**
*   Ensure `auth-service` and `mongo` are running.
*   Check Network tab in DevTools for 500 errors.

---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add Amazing Feature'`).
4. Push to branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
