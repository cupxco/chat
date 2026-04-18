const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your specific domain
app.use(cors({
    origin: "https://cupx.in",
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://cupx.in",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. Joining Rooms
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room: ${roomName}`);
    });

    // 2. Sending/Receiving Encrypted Messages
    socket.on('send_message', (data) => {
        // data should be: { room: "room1", message: "ENCRYPTED_STRING", sender: "Alice" }
        socket.to(data.room).emit('receive_message', data);
    });

    // 3. Typing Indicators
    socket.on('typing', (data) => {
        // data should be: { room: "room1", user: "Alice", isTyping: true }
        socket.to(data.room).emit('display_typing', data);
    });

    // 4. Clear Chat Event
    socket.on('clear_chat', (roomName) => {
        // Tells all clients in the room to wipe their local state
        io.in(roomName).emit('chat_cleared');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
