const express = require("express");
const app = express();
const cors = require('cors');
const userRouter = require("./routes/userRouter");
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

// Set up the HTTP server
const server = http.createServer(app);

// CORS settings
// const corsOptions = {
//     origin: (origin, callback) => {
//         const allowedOrigins = [
//             'https://drawing-app-cyan.vercel.app',
//             'http://localhost:5173'
//         ];
//         if (allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST'],
//     credentials: true,
// };
app.use(cors());

app.use(express.json());

// Basic route for root
app.get('/', (req, res) => {
    res.send('Drawing App Backend is running.');
});

const connectedUserIds = new Set();

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = [
                'https://drawing-app-cyan.vercel.app',
                'http://localhost:5173'
            ];
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: '/socket.io/',
});

// Replace Firebase authentication with JWT-based authentication
io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;  // Attach user info to socket object
        next();
    });
});

// Handle socket connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.userId}`);
    connectedUserIds.add(socket.user.userId);
    io.emit('user-count', connectedUserIds.size);

    // Send the current drawing data to the newly connected client
    socket.emit('init-drawing-data', drawingData);

    // Handle drawing data events
    socket.on('drawing-data', (data) => {
        drawingData.push(data);
        undoStack.push({ action: 'draw', data });
        redoStack = []; // Clear redo stack on new drawing
        socket.broadcast.emit('drawing-data', data);
    });

    // Handle undo events
    socket.on('undo', () => {
        if (undoStack.length > 0) {
            const lastAction = undoStack.pop();
            if (lastAction.action === 'draw') {
                redoStack.push(lastAction);
                drawingData = drawingData.slice(0, -1); // Remove the last drawing action
                io.emit('clear-canvas');
                drawingData.forEach(action => io.emit('drawing-data', action)); // Redraw the remaining data
            }
        }
    });

    // Handle redo events
    socket.on('redo', () => {
        if (redoStack.length > 0) {
            const lastAction = redoStack.pop();
            if (lastAction.action === 'draw') {
                drawingData.push(lastAction.data);
                undoStack.push(lastAction);
                io.emit('drawing-data', lastAction.data);
            }
        }
    });

    // Handle clear canvas event
    socket.on('clear-canvas', () => {
        drawingData = [];
        undoStack = [];
        redoStack = [];
        io.emit('clear-canvas');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        connectedUserIds.delete(socket.user.userId);
        io.emit('user-count', connectedUserIds.size);
        console.log(`User disconnected: ${socket.user.userId}`);
    });
});

// Client-Side Socket Connection
// const socket = io('http://localhost:3000', {
//     query: {
//         token: localStorage.getItem('authToken')  // Assuming you're storing the JWT in localStorage
//     }
// });


app.use("/user", userRouter);
app.get("/", (req, res) => {
    res.status(200).send("server is working");
});

// Start the server
server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});

module.exports = app;
