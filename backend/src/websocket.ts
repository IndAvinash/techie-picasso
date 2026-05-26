import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { PrismaClient } from '@prisma/client';
import { pubClient, subClient } from './redis.ts';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { setupWSConnection, docs } = require('y-websocket/bin/utils');
const prisma = new PrismaClient();

/**
 * Attaches the Yjs WebSocket handler to an existing HTTP server.
 * This function manages real-time document synchronization and user awareness.
 */
export function setupWebSocketServer(server: any) {
  // Create a new WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (conn, req) => {
    // Extract the room ID from the URL (e.g., ws://localhost:8080/room-123)
    const docName = req.url?.split('/').pop() || 'global-room';
    
    // Check if the room exists in the PostgreSQL database before letting them connect
    if (docName !== 'global-room') {
      try {
        const room = await prisma.room.findUnique({ where: { id: docName } });
        if (!room) {
          // If the room doesn't exist, aggressively close the connection to prevent unauthorized access
          conn.close(1008, 'Room not found');
          return;
        }
      } catch (err) {
        console.error('Error verifying room:', err);
        conn.close(1011, 'Internal error');
        return;
      }
    }

    // Determine if this server instance is seeing this document for the first time
    const isNew = !docs.has(docName);
    
    // Hand over the connection to the y-websocket library so it can handle the low-level Yjs syncing
    setupWSConnection(conn, req, { docName });
    const doc = docs.get(docName);

    // If this is the first person to connect to this room on this specific server instance,
    // load the previously saved canvas state from PostgreSQL so they aren't starting with a blank canvas
    if (isNew && docName !== 'global-room') {
      try {
        const room = await prisma.room.findUnique({ where: { id: docName } });
        if (room && room.canvasState) {
          Y.applyUpdate(doc, room.canvasState);
        }
      } catch (err) {
        console.error('Failed to load room state from database', err);
      }
    }
    
    // Attach Redis Pub/Sub only once per document (room)
    if (doc && !(doc as any).redisAttached) {
      (doc as any).redisAttached = true;
      const channel = `room:${docName}`;

      // 1. Subscribe to Redis: Listen for updates from users connected to other server instances
      subClient.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'update') {
            // Apply canvas drawing updates
            Y.applyUpdate(doc, Buffer.from(data.data, 'base64'), 'redis');
          } else if (data.type === 'awareness') {
            // Apply awareness updates (like cursor positions or who joined/left)
            awarenessProtocol.applyAwarenessUpdate((doc as any).awareness, Buffer.from(data.data, 'base64'), 'redis');
          }
        } catch (err) {
          console.error("Failed to parse redis message", err);
        }
      });

      // 2. Publish Local Updates: Send updates happening on THIS server to all other servers via Redis
      let saveTimeout: NodeJS.Timeout | null = null;
      
      doc.on('update', (update: Uint8Array, origin: any) => {
        // Don't echo updates back to Redis if they originally came from Redis!
        if (origin !== 'redis') {
          pubClient.publish(channel, JSON.stringify({
            type: 'update',
            data: Buffer.from(update).toString('base64')
          }));
        }

        // DEBOUNCED DATABASE SAVE: Save the canvas state to PostgreSQL
        // We wait 2 seconds after the last drawing action to avoid overloading the database with writes
        if (docName !== 'global-room') {
          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = setTimeout(async () => {
            try {
              await prisma.room.update({
                where: { id: docName },
                data: { canvasState: Buffer.from(Y.encodeStateAsUpdate(doc)) }
              });
            } catch (err) {
              // Ignore errors if the room is still being created in the database
            }
          }, 2000);
        }
      });

      // 3. Publish Awareness Updates: Tell other servers about cursor movements and user presence
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
}
