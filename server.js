//imports
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./uitls/messages");
const {
  userJoin,
  getCurrentUser,
  userLeavesChat,
  getRoomUsers,
} = require("./uitls/users");

//initialization
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//middlewares
app.use(express.static(path.join(__dirname, "public")));

//configurations
const PORT = 3000 || process.env.PORT;
const botName = "ChatNest Admin";

//when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(botName, "Welcome to ChatNest!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
      io.to(user.room).emit("roomUsers",{
          room: user.room,
          users: getRoomUsers(user.room)
      });
  });


  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });
  socket.on("disconnect", () => {
    const user = userLeavesChat(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers",{
        room: user.room,
        users: getRoomUsers(user.room)
    });
    }
  });
});

//listen
server.listen(PORT, () =>
  console.log(`Chatnest Server is running on port ${PORT}`)
);
