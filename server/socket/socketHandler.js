const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join specific chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Leave specific chat room
    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.id} left chat ${chatId}`);
    });

    // Typing indicator (optional)
    socket.on("typing", (chatId) => socket.to(chatId).emit("typing"));
    socket.on("stopTyping", (chatId) => socket.to(chatId).emit("stopTyping"));

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
