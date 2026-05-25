import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

router.post('/create', async (req: any, res: any) => {
  try {
    const { name } = req.body;
    let ownerId = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        ownerId = decoded.id;
      } catch (e) {
        console.error("Invalid token on room create");
      }
    }
    
    const room = await prisma.room.create({
      data: {
        name: name || 'Untitled Room',
        ownerId: ownerId
      }
    });

    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: any, res: any) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const roomsRouter = router;
