import { WebSocketServer, WebSocket } from 'ws';
import express from "express";

// 1. First - Initialize console overrides immediately
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

function sendToClient(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function consoleOverrides() {
    console.log = (...args) => {
        originalConsole.log(...args);
        sendToClient(args);
    };
    console.error = (...args) => {
        originalConsole.error(...args);
        sendToClient(args);
    };
    console.warn = (...args) => {
        originalConsole.warn(...args);
        sendToClient(args);
    };
}

// 2. Apply overrides BEFORE any other code runs
consoleOverrides();

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
    console.log('New Client Connected');

    ws.on('message', (raw) => {
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error('⚠️ Invalid JSON from client:', raw);
            return;
        }
        console.log('📨 Received from client:', data);

        ws.send(JSON.stringify({ type: 'PONG', received: data }));
    });


    ws.on('close', () => {
        console.log("client disconnected");
    });
});

app.use(express.static("public"));

// 5. Start your app
startSpamurai();