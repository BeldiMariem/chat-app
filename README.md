

# Real-Time Chat Application 💬

A simple modern, real-time chat application built with **Go** backend, **Vue.js** frontend, and **Firebase Firestore** database. Features **clean architecture**, **gRPC-Web** communication, and responsive design.  

This is my personal exploration journey into backend development with Go and RPC communication

## 🚀 Live Application
**Access the deployed application here:**  
🔗 **[https://chat-app.fly.dev](https://chat-app.fly.dev)**

---
## 🚀 Features

- **Real-time messaging** with instant message delivery
- **Multiple chat rooms** support
- **User authentication** with Firebase
- **Responsive design** optimized for both desktop and mobile
- **Clean architecture** backend with separation of concerns
- **gRPC-Web** for efficient client-server communication
- **Docker containerization** for easy deployment
- **CI/CD pipeline** with Jenkins

## 🏗️ Architecture

### Backend (Go)
```
backend/
├── cmd/server/          # Application entry point
├── internal/
│   ├── domain/          # Business models and entities
│   ├── interfaces/      # gRPC handlers and protobuf definitions
│   ├── usecases/        # Business logic
│   └── infrastructure/  # Firebase Firestore implementation
├── proto/               # Protocol buffer definitions
└── go.mod              # Go dependencies
```

### Frontend (Vue.js)
```
frontend/
├── src/
│   ├── components/      # Vue components
│   ├── composables/     # Vue 3 composables 
│   ├── services/        # API services
│   ├── proto/           # Protobuf generated code
│   └── utils/          # Utilities and configuration
├── public/             # Static assets
└── package.json        # Node.js dependencies
```

## 🛠️ Tech Stack

### Backend
- **Go 1.24** - Programming language
- **gRPC-Web** - RPC framework for web clients
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Protocol Buffers** - Interface definition language

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **gRPC-Web** - Client-server communication
- **CSS3** - Styling with responsive design

### Infrastructure
- **Docker** - Containerization
- **Fly.io** - Cloud deployment platform
- **Jenkins** - CI/CD pipeline
- **Docker Hub** - Container registry

## 📦 Prerequisites

- Go 1.24+
- Node.js 20+
- Docker
- Firebase project with Firestore
- Fly.io account
- Docker Hub account

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/BeldiMariem/chat-app.git
   cd chat-app
   ```

2. **Set up Firebase credentials**
   - Download your Firebase service account key
   - Save as `backend/firebase-service-account.json`

3. **Run with Docker Compose**
   ```bash
   docker-compose up
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8078

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Run locally**
   ```bash
   go run cmd/server/main.go
   ```

#### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
### Jenkins Pipeline

The project includes a Jenkins pipelines for backend and frontend that automatically:
- Runs tests
- Builds Docker images
- Pushes to Docker Hub

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 8078)
- `GOOGLE_APPLICATION_CREDENTIALS` - Firebase credentials path

**Frontend:**
- `VITE_API_URL` - Backend API URL




## 🔌 API Endpoints

### gRPC Services

```protobuf
service ChatService {
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc SendMessage(MessageRequest) returns (MessageResponse);
  rpc StreamMessages(StreamRequest) returns (stream MessageResponse);
  rpc GetMessages(GetMessagesRequest) returns (GetMessagesResponse);
}
```




---
### Live Demo: [https://chat-app.fly.dev](https://chat-app.fly.dev)

## 👩‍💻 Developed with ❤️ by Mariem BELDI.
