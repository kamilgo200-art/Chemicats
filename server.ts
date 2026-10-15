import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;


  // Set up WebSocket server for ChemLAN protocol v1 + co-op events
  const wss = new WebSocketServer({ server, path: '/play' });

  const clients = new Map<WebSocket, { id: string; state: any; readySent: boolean }>();
  const validId = (id: unknown): id is string =>
    typeof id === 'string' && /^[A-Za-z0-9_-]{8,32}$/.test(id);

  wss.on('connection', (ws) => {
    const fallbackId = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    clients.set(ws, { id: fallbackId, state: null, readySent: false });

    ws.on('message', (message) => {
      try {
        const raw = message.toString();
        if (raw.length > 8192) return;
        const data = JSON.parse(raw);
        const clientData = clients.get(ws);
        if (!clientData) return;

        if (data.type === 'update') {
          const state = data.state;
          if (state && validId(state.clientId)) {
            clientData.id = state.clientId;
          }
          clientData.state = state;

          if (!clientData.readySent) {
            clientData.readySent = true;
            ws.send(JSON.stringify({ type: 'ready', version: 1, id: clientData.id }));
            // Send existing peers' states to the newly connected client
            for (const [peerWs, peerInfo] of clients.entries()) {
              if (peerWs !== ws && peerWs.readyState === WebSocket.OPEN && peerInfo.state) {
                ws.send(
                  JSON.stringify({
                    type: 'state_update',
                    version: 1,
                    id: peerInfo.id,
                    state: peerInfo.state,
                  })
                );
              }
            }
          }

          // Broadcast state_update to all other connected clients
          const updateMsg = JSON.stringify({
            type: 'state_update',
            version: 1,
            id: clientData.id,
            state,
          });
          for (const [client] of clients.entries()) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(updateMsg);
            }
          }
        } else if (data.type === 'lan_event' && data.event && typeof data.event === 'object') {
          const senderId = validId(data.id) ? data.id : clientData.id;
          const eventMsg = JSON.stringify({
            type: 'lan_event',
            version: 1,
            id: senderId,
            event: data.event,
          });
          for (const [client, info] of clients.entries()) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              if (!data.event.targetId || info.id === data.event.targetId) {
                client.send(eventMsg);
              }
            }
          }
        } else if (data.type === 'broadcast') {
          const broadcastMsg = JSON.stringify({
            type: 'broadcast',
            version: 1,
            id: clientData.id,
            payload: data.payload,
          });
          for (const [client] of clients.entries()) {
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
      const clientData = clients.get(ws);
      clients.delete(ws);
      if (clientData) {
        const leaveMsg = JSON.stringify({
          type: 'player_leave',
          version: 1,
          id: clientData.id,
        });
        for (const [client] of clients.entries()) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(leaveMsg);
          }
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
