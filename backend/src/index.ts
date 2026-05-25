import express from 'express';
import { authRouter } from './auth.ts';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { setupWSConnection } = require('y-websocket/bin/utils')
import cors from 'cors';
import { roomsRouter } from './rooms.ts';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/rooms', roomsRouter);
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
wss.on('connection', (conn, req) => {
  const docName = req.url?.split('/').pop() || 'global-room'
  setupWSConnection(conn, req, { docName });
    console.log(`New WebSocket connection to room: ${docName}`);
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});