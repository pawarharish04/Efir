const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://your-frontend.vercel.app" // ✅ Vercel frontend URL
    ],
    credentials: true
  })
);

// ===== Socket.io Setup =====
const io = new Server(server, {
  cors: {
    origin: "https://your-frontend.vercel.app",
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===== Database =====
connectDB();

// ===== Routes =====
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/firs', require('./routes/firRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ===== Error Handler =====
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
