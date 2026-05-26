import express from 'express';
import { authRouter } from './auth.ts';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws'
import { createRequire } from 'module';
import { createClient } from 'redis';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
const require = createRequire(import.meta.url);
const { setupWSConnection ,docs} = require('y-websocket/bin/utils')
import cors from 'cors';
import { roomsRouter } from './rooms.ts';
const prisma = new PrismaClient();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  console.log('Connected to Redis Pub/Sub');
});

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/rooms', roomsRouter);
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
wss.on('connection', async (conn, req) => {
  const docName = req.url?.split('/').pop() || 'global-room';
  
  if (docName !== 'global-room') {
    try {
      const room = await prisma.room.findUnique({ where: { id: docName } });
      if (!room) {
        conn.close(1008, 'Room not found');
        return;
      }
    } catch (err) {
      console.error('Error verifying room:', err);
      conn.close(1011, 'Internal error');
      return;
    }
  }

  const isNew = !docs.has(docName);
  
  setupWSConnection(conn, req, { docName });

  const doc = docs.get(docName);

  // If this is the first person to connect to this room on this server instance,
  // load the saved canvas state from PostgreSQL
  if (isNew && docName !== 'global-room') {
    try {
      const room = await prisma.room.findUnique({ where: { id: docName } });
      if (room && room.canvasState) {
        Y.applyUpdate(doc, room.canvasState);
      }
    } catch (err) {
      console.error('Failed to load room state', err);
    }
  }
  
  if (doc && !(doc as any).redisAttached) {
    (doc as any).redisAttached = true;
    const channel = `room:${docName}`;

    // 1. Subscribe to Redis for incoming blobs and awareness from other servers
    subClient.subscribe(channel, (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'update') {
          Y.applyUpdate(doc, Buffer.from(data.data, 'base64'), 'redis');
        } else if (data.type === 'awareness') {
          awarenessProtocol.applyAwarenessUpdate((doc as any).awareness, Buffer.from(data.data, 'base64'), 'redis');
        }
      } catch (err) {
        console.error("Failed to parse redis message", err);
      }
    });

    // 2. Publish local updates to Redis and DB
    let saveTimeout: NodeJS.Timeout | null = null;
    
    doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'redis') {
        pubClient.publish(channel, JSON.stringify({
          type: 'update',
          data: Buffer.from(update).toString('base64')
        }));
      }

      // Debounce saving to Postgres (save every 2 seconds of inactivity)
      if (docName !== 'global-room') {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
          try {
            await prisma.room.update({
              where: { id: docName },
              data: { canvasState: Buffer.from(Y.encodeStateAsUpdate(doc)) }
            });
          } catch (err) {
            // Room might not exist yet if it's currently being created, safely ignore
          }
        }, 2000);
      }
    });

    // 3. Publish awareness updates to Redis
    (doc as any).awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      if (origin !== 'redis') {
        const changedClients = added.concat(updated).concat(removed);
        const update = awarenessProtocol.encodeAwarenessUpdate((doc as any).awareness, changedClients);
        pubClient.publish(channel, JSON.stringify({
          type: 'awareness',
          data: Buffer.from(update).toString('base64')
        }));
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});