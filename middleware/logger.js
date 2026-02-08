import winston from "winston";
import config from "../config.js";

const { combine, timestamp, printf, colorize, align } = winston.format;

/**
 * Custom log format
 */
const logFormat = printf(({ level, message, timestamp, ...args }) => {
  const ts = timestamp.slice(0, 19).replace("T", " ");
  return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
});

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: config.isDevelopment() ? "debug" : "info",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss:ms",
    }),
    align(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/app.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export default logger;
