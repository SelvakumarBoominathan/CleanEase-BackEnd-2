import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/connection.js";
import router from "./router/route.js";
import dotenv from "dotenv";
// import bodyParser from "body-parser";

dotenv.config();

// Create server
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://mellifluous-swan-470b44.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
// app.use(bodyParser.json());
app.use(morgan("tiny"));

// Prevent hackers
app.disable("x-powered-by");

// Define the port
const port = process.env.PORT || 8000;

// GET request
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

// API routes
app.use("/api", router);

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
