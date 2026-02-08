import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "express-async-errors";
import connect from "./database/connection.js";
import router from "./router/route.js";
import config from "./config.js";
import logger from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Initialize Express app
const app = express();

// SECURITY: Add security headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.CORS_ORIGIN.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging Middleware
app.use(
  morgan(":method :url :status :response-time ms", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// Security: Disable powered-by header
app.disable("x-powered-by");

// API Rate Limiting
app.use("/api", apiLimiter);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CleanEase Backend Server Running",
    environment: config.NODE_ENV,
  });
});

// Database Connection
connect();

// API Routes
app.use("/api", router);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📦 Environment: ${config.NODE_ENV}`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});

export default app;

// Server listener only if there is a valid MongoDB connection
connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Invalid database connection!", error);
  });
