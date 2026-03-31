const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* ================= CORS OPTIONS ================= */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight across-the-board

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("🚀 e-FIR Backend is running successfully");
});

/* ================= SOCKET.IO ================= */
const io = require("socket.io")(server, {
  cors: corsOptions,
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
