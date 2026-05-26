import express from 'express';
import cors from 'cors';
import http from 'http';
import { authRouter } from './auth.ts';
import { roomsRouter } from './rooms.ts';
import { setupWebSocketServer } from './websocket.ts';

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse incoming JSON payloads

// Mount the REST API routers
// Handles anonymous user creation
app.use('/auth', authRouter);
// Handles room creation and metadata fetching
app.use('/rooms', roomsRouter);

// Create the standard HTTP server using Express
const server = http.createServer(app);

// Attach the modularized Yjs WebSocket server to the HTTP server
setupWebSocketServer(server);

// Start listening on the specified port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP and Yjs WebSocket Server running on port ${PORT}`);
});