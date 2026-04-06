const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* ================= CORS OPTIONS ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://efir-tkdw.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
try {
  app.use("/auth", require("./routes/authRoutes"));
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Failed to load auth routes:", err.message);
}

try {
  app.use("/api/firs", require("./routes/firRoutes"));
  console.log("✅ FIR routes loaded");
} catch (err) {
  console.error("❌ Failed to load FIR routes:", err.message);
}

try {
  app.use("/api/admin", require("./routes/adminRoutes"));
  console.log("✅ Admin routes loaded");
} catch (err) {
  console.error("❌ Failed to load admin routes:", err.message);
}

// Debug route to verify registered routes
app.get("/debug/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({ method: Object.keys(middleware.route.methods), path: middleware.route.path });
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods),
            path: middleware.regexp.source.includes("auth") ? `/auth${handler.route.path}` :
              middleware.regexp.source.includes("firs") ? `/api/firs${handler.route.path}` :
                middleware.regexp.source.includes("admin") ? `/api/admin${handler.route.path}` :
                  handler.route.path
          });
        }
      });
    }
  });
  res.json({ totalRoutes: routes.length, routes });
});

// Catch-all 404 handler (MUST be after all routes)
app.use((req, res) => {
  console.log(`⚠️ 404 hit: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Caught:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
