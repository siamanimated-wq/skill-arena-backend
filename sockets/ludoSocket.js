module.exports = (io) => {
    let rooms = {};

    io.on('connection', (socket) => {
        console.log('⚡ Player Connected:', socket.id);

        // Join Match Room
        socket.on('joinRoom', ({ roomId, userId, name }) => {
            socket.join(roomId);

            if (!rooms[roomId]) {
                rooms[roomId] = {
                    players: [],
                    currentTurn: 0,
                    gameState: 'waiting'
                };
            }

            const room = rooms[roomId];
            if (room.players.length < 2) {
                room.players.push({
                    socketId: socket.id,
                    userId,
                    name,
                    color: room.players.length === 0 ? 'red' : 'green'
                });

                io.to(roomId).emit('roomUpdate', room);

                if (room.players.length === 2) {
                    room.gameState = 'playing';
                    io.to(roomId).emit('gameStart', room);
                }
            }
        });

        // Roll Dice Event
        socket.on('rollDice', ({ roomId }) => {
            const diceValue = Math.floor(Math.random() * 6) + 1;
            io.to(roomId).emit('diceRolled', { diceValue, socketId: socket.id });
        });

        // Move Token Event
        socket.on('moveToken', ({ roomId, tokenId, position }) => {
            io.to(roomId).emit('tokenMoved', { tokenId, position, socketId: socket.id });
        });

        // Disconnect Event
        socket.on('disconnect', () => {
            console.log('❌ Player Disconnected:', socket.id);
        });
    });
};
