import { createClient } from 'redis';

// Use the REDIS_URL environment variable if available, otherwise fallback to local redis
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// We need two clients because in Redis, a client that is subscribed to a channel
// cannot also be used to publish messages.
export const pubClient = createClient({ url: REDIS_URL });
export const subClient = pubClient.duplicate();

// Connect both clients to the Redis server
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log('Connected to Redis Pub/Sub successfully!');
  })
  .catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });
