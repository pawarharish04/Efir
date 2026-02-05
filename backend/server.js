const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://your-frontend.vercel.app", // 🔁 replace with real Vercel URL
    credentials: true
  })
);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: "https://your-frontend.vercel.app", // same as frontend
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ================= DATABASE ================= */
connectDB();

/* ================= ROUTES ================= */
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/firs", require("./routes/firRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
