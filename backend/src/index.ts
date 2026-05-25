import express from 'express';
import { authRouter } from './auth.ts';
import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import cors from 'cors';



const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

const server = http.createServer(app);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});