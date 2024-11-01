const socketIo = require('socket.io');

let io;

exports.setupSockets = (server) => {
  io = socketIo(server,{
    cors: {
      origin: "https://click-ai-fe.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
  });

  io.on('connection', (socket) => {
    console.log('User connected');
    socket.emit('connected', { message: 'Socket connection established successfully!' });
    socket.on("upload-progress-file", (data) => {
          socket.broadcast.emit("upload-progress-file", data);
    });
    socket.on("upload-progress-folder", (data) => {
          socket.broadcast.emit("upload-progress-folder", data);
    });
    socket.on("delete-folder", (data) => {
          socket.broadcast.emit("upload-progress-file",data);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
