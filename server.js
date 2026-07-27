const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const ludoSocket = require('./sockets/ludoSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// Initialize Socket Multiplayer Engine
ludoSocket(io);

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        status: 'Success',
        message: 'Skill Arena Backend Server & Real-Time Socket Engine are Live!',
        timestamp: new Date()
    });
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillarena';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Database Connected Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
