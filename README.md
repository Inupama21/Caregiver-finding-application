# EverCare - Microservices Architecture

A comprehensive caregiving platform built with microservices architecture, connecting caregivers with care-seekers.

## Architecture Overview

```
EverCare Backend (Microservices)
├── UserService (Port 5001)        # User management
├── BookingService (Port 5002)     # Booking management
├── JobPostingService (Port 5003)  # Job posting management
└── ChatService (Port 5004)        # Chat functionality

EverCare Frontend (React Native + Expo)
└── Mobile/Web App                 # Cross-platform client
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL (or your preferred database)

### Backend Setup (Microservices)

1. **Navigate to backend directory:**

   ```bash
   cd evercare-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   # Create .env file in evercare-backend/
   USER_SERVICE_PORT=5001
   BOOKING_SERVICE_PORT=5002
   JOB_SERVICE_PORT=5003
   CHAT_SERVICE_PORT=5004
   DATABASE_URL=your_database_connection_string
   ```

4. **Start individual services:**

   **Option A: Start all services at once (Recommended)**

   ```bash
   npm run dev
   ```

   **Option B: Start services individually**

   ```bash
   # Terminal 1 - User Service
   npm run start:users

   # Terminal 2 - Booking Service
   npm run start:bookings

   # Terminal 3 - Job Service
   npm run start:jobs

   # Terminal 4 - Chat Service
   npm run start:chat
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd evercare-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start Expo development server:**
   ```bash
   npm start
   ```

## API Endpoints

### UserService (Port 5001)

- **Health Check**: `GET http://localhost:5001/health`
- **API Docs**: `GET http://localhost:5001/`
- **Users**: `GET/POST/PUT/DELETE http://localhost:5001/users/*`

### BookingService (Port 5002)

- **Health Check**: `GET http://localhost:5002/health`
- **API Docs**: `GET http://localhost:5002/`
- **Bookings**: `GET/POST/PUT/DELETE http://localhost:5002/bookings/*`

### JobPostingService (Port 5003)

- **Health Check**: `GET http://localhost:5003/health`
- **API Docs**: `GET http://localhost:5003/`
- **Jobs**: `GET/POST/PUT/DELETE http://localhost:5003/jobs/*`

### ChatService (Port 5004)

- **Health Check**: `GET http://localhost:5004/health`
- **API Docs**: `GET http://localhost:5004/`
- **Chat**: `GET/POST/PUT/DELETE http://localhost:5004/chat/*`

## Frontend Configuration

```typescript
// API Configuration
const API_CONFIG = {
  USER_SERVICE: "http://localhost:5001",
  BOOKING_SERVICE: "http://localhost:5002",
  JOB_SERVICE: "http://localhost:5003",
  CHAT_SERVICE: "http://localhost:5004",
};
```

### Backend

- `npm run start:users` - Start UserService only
- `npm run start:bookings` - Start BookingService only
- `npm run start:jobs` - Start JobPostingService only
- `npm run start:chat` - Start ChatService only
- `npm run dev` - Start all services concurrently
- `npm run build` - Build TypeScript to JavaScript

### Frontend

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
