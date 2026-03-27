const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

/* ================= DATABASE ================= */
connectDB();

/* ================= ROUTES ================= */
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/firs", require("./routes/firRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
