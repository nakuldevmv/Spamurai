import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import express from "express";

const clients = new Map();
const activeClients = new Map();
// 1. First - Initialize console overrides immediately
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

function broadcastToActiveClients(args) {
    const message = JSON.stringify(args);
    for (const [clientId, isActive] of activeClients.entries()) {
        if (isActive) {
            const ws = clients.get(clientId);
            if (ws && ws.readyState === ws.OPEN) {
                ws.send(message);
            }
        }
    }
}

function overrideConsole() {
    console.log = (...args) => {
        originalConsole.log(...args);
        broadcastToActiveClients(args);
    };
    console.error = (...args) => {
        originalConsole.error(...args);
        broadcastToActiveClients(args);
    };
    console.warn = (...args) => {
        originalConsole.warn(...args);
        broadcastToActiveClients(args);
    };
}

overrideConsole();

// 3. Now import your main app 
import startSpamurai from './spamurai.js';
// 4. Set up server
const app = express();
// const PORT = process.env.PORT || 3000;

const server = app.listen(3000, () => {
    console.log(`🔥 running at port 3000`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    ws.send(JSON.stringify({ type: 'id', clientId }));
    console.log(`New Client Connected: ${clientId}`);


    ws.on('message', (raw) => {
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error('⚠️ Invalid JSON from client:', raw);
            return;
        }

        if (data.type === 'startSpamurai') {
            const { email, password, month, day, year, isAgree, isDelete } = data.payload;
            const idFromClient = data.clientId;

            if (!clients.has(idFromClient)) {
                console.warn("⚠️ Unknown client tried to start Spamurai");
                return;
            }

            if (email && password && month && day && year && typeof isAgree === 'boolean' && typeof isDelete === 'boolean') {
                activeClients.set(idFromClient, true);
                console.log(`👾 Spamurai summoned by ${idFromClient}`);
                startSpamurai(email, password, month, day, year, isAgree, isDelete);
                ws.send(JSON.stringify({ type: 'status', message: '✅ Spamurai started' }));
            } else {
                ws.send(JSON.stringify({ type: 'error', message: '❌ Invalid fields, bruv' }));
            }
        } else {
            console.log('🔍 Unknown message type:', data.type);
        }
    });


    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        clients.delete(clientId);
        activeClients.delete(clientId);
    });
});

function stopProcess(){
    console.log("❌ Execution aborted. No unsubscribe scrolls were touched. Stay safe, ronin.");
    process.exit(0);
}

