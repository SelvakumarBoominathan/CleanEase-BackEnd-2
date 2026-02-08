/**
 * Custom Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    err = new AppError(message, 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    err = new AppError(message, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new AppError("Token has expired", 401);
  }

  // Joi Validation Errors
  if (err.isJoi) {
    const message = err.details.map((d) => d.message).join(", ");
    err = new AppError(message, 400);
  }

  // Response
  const response = {
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  return res.status(err.statusCode).json(response);
};

/**
 * Async Error Wrapper for Route Handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found Error Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
