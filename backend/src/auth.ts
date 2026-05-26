import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/signup', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
      }
    });
    console.log(verificationToken);
    res.status(201).json({ message: 'Signup successful', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify', async (req: any, res: any) => {
  try {
   const token = req.query.token;
    
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    
   
     if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        // verificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/anonymous', async (req: any, res: any) => {
  try {
    const tempEmail = `anon-${uuidv4().substring(0,8)}@temp.local`;
    const hashedPassword = await bcrypt.hash('none', 10);
    const user = await prisma.user.create({
      data: {
        email: tempEmail,
        password: hashedPassword,
        isEmailVerified: true
      }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth', (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }else{
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if(decoded.email.startsWith('anon-') && decoded.email.endsWith('@temp.local')) {
        return res.status(401).json({ error: 'Anonymous users are not authorized' });
      }
      res.json({ user: { id: decoded.id, email: decoded.email } });
    } catch (e) {
      console.error("Invalid token on auth check");
      res.status(401).json({ error: 'Invalid token' });
    }
  }
});
export const authRouter = router;
