const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("🚀 e-FIR Backend is running successfully");
});
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* ================= SOCKET.IO ================= */
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
