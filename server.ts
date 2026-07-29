import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  // Set up WebSocket server
  const wss = new WebSocketServer({ server, path: '/play' });

  const clients = new Map<WebSocket, { id: string; state: any }>();

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    clients.set(ws, { id, state: null });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'update') {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.state = data.state;
          }
          // Broadcast to others
          const updateMsg = JSON.stringify({ type: 'state_update', id, state: data.state });
          for (const [client, info] of clients.entries()) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(updateMsg);
            }
          }
        }
        if (data.type === 'broadcast') {
            const broadcastMsg = JSON.stringify({ type: 'broadcast', id, payload: data.payload });
            for (const [client, info] of clients.entries()) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(broadcastMsg);
                }
            }
        }
      } catch (e) {
        console.error('Error parsing message', e);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      const leaveMsg = JSON.stringify({ type: 'player_leave', id });
      for (const [client] of clients.entries()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(leaveMsg);
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
