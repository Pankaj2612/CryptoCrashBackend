const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const { initSocket } = require("./websockets/socket");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      "https://crypto-crash-frontend-two.vercel.app/",
      "https://crypto-crash-frontend-two.vercel.app",
    ],
  },
});

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

initSocket(io);

server.listen(3000, () => console.log("Server running on port 3000"));
