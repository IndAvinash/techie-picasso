# Techie Picasso

Techie Picasso is a real-time, highly scalable collaborative whiteboard. Multiple users can join a room, draw, erase, and drop custom image pins on the canvas simultaneously without conflicts.

## Prerequisites
Before you start, make sure we have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Docker](https://www.docker.com/) (Required to run the PostgreSQL database, Redis server, and Nginx load balancer)

## Getting Started

### 1. Start the Infrastructure (Database, Redis, Nginx)
The project uses Docker Compose to easily spin up PostgreSQL (for saving room states), Redis (for syncing WebSockets across backend servers), and Nginx (for load balancing).

From the root directory, run:
```bash
docker-compose up -d
```
*Note: This will expose PostgreSQL on port 5432, Redis on port 6379, and Nginx on port 3000.*

### 2. Setup the Backend
The backend handles the REST API (auth & room creation) and the Yjs WebSockets.

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the Database (Prisma):
   Run the following to apply the database schema to your local PostgreSQL container:
   ```bash
   npx prisma db push
   ```
4. Start the Backend Servers:
   Because we are load balancing behind Nginx, we need to run multiple backend instances on different ports (e.g., 4001 and 4002). Open two separate terminals in the `backend` directory and run:
   
   **Terminal 1:**
   ```bash
   PORT=4001 npm run dev
   ```
   **Terminal 2:**
   ```bash
   PORT=4002 npm run dev
   ```
   *(If you are on Windows PowerShell, you may need to use `$env:PORT=4001; npm run dev` or install `cross-env`)*

### 3. Setup the Frontend
The frontend is a React application built with Vite and `react-konva`.

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## How the Architecture Works
- **Frontend (`localhost:5173`)**: Uses `react-konva` for drawing and `yjs` / `y-websocket` to sync real-time changes to the server.
- **Nginx (`localhost:3000`)**: Acts as a load balancer, taking incoming WebSocket connections from the frontend and distributing them evenly between your backend servers (`4001` and `4002`).
- **Backend (`localhost:4001`, `localhost:4002`)**: Node.js servers that handle the WebSocket connections. If User A connects to `4001` and User B connects to `4002`, the servers use **Redis Pub/Sub** to instantly forward drawing updates to each other.
- **PostgreSQL**: Every 2 seconds after drawing stops (debouncing), the backend takes a snapshot of the Yjs document state and saves it to Postgres so the room persists even if the servers restart.

## Troubleshooting
- **Database Connection Errors**: Ensure your `.env` file in the `backend` directory points to the correct `DATABASE_URL` matching your Docker setup.
- **Can't see other users drawing**: Make sure both backend ports (4001 and 4002) are running, and that Redis is running via Docker.
