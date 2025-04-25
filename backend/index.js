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

// 3. Now import your main app (will use the overridden console)
import startSpamurai from './spamurai.js';
// 4. Set up server
const app = express();
const server = app.listen(3000, () => {
    console.log("🔥 running at port 3000"); // This will be captured
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log('New Client Connected'); // This will be captured
    ws.on('close', () => {
        console.log("client disconnected"); // This will be captured
    });
});

app.use(express.static("public"));

// 5. Start your app
startSpamurai();