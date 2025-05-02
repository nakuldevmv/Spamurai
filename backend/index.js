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
    
        if (data.type === 'startSpamurai') {
            const { month, day, year, isAgree, isDelete } = data.payload;
    
            if (month && day && year && typeof isAgree === 'boolean' && typeof isDelete === 'boolean') {
                console.log("Spamurai is bootin’ up...");
                startSpamurai(month, day, year, isAgree, isDelete);
                ws.send(JSON.stringify({ type: 'status', message: '✅ Spamurai started' }));
            } else {
                ws.send(JSON.stringify({ type: 'error', message: '❌ Invalid fields, bruv' }));
            }
        } else {
            console.log('🔍 Unknown message type:', data.type);
        }
    });
    


    ws.on('close', () => {
        console.log("client disconnected");
    });
});

// app.use(express.static("public"));
// app.use(express.json());  // Add this line

// app.use(express.json()); // BEFORE your routes

// app.post("/spamurai", (req, res) => {
//     const { month, day, year, isDelete, isAgree } = req.body;

//     if (month && day && year && typeof isDelete === "boolean" && typeof isAgree === "boolean") {
//         console.log("Spamurai is trying to start...");
//         startSpamurai(month, day, year, isAgree, isDelete);
//         res.status(200).send("Spamurai started successfully");
//     } else {
//         res.status(400).send("❌ Missing some required fields");
//     }
// });

// const month="10";
// const day="1";
// const year="2024";
// const isDelete=true;
// const isAgree=true;

// 5. Start your app