import Jwt from "jsonwebtoken";
import config from "../config.js";
import { AppError } from "./errorHandler.js";
import logger from "./logger.js";

/**
 * Verify JWT token and attach user info to request
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = Jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.user = decoded;

    logger.debug("Token verified successfully", { userId: decoded.userId });
    next();
  } catch (error) {
    if (error instanceof Jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401);
    }
    if (error instanceof Jwt.TokenExpiredError) {
      throw new AppError("Token has expired", 401);
    }
    throw error;
  }
};

/**
 * Require authentication middleware
 */
export const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const decoded = Jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.user = decoded;

    logger.debug("Auth token verified", { userId: decoded.userId });
    next();
  } catch (error) {
    logger.error("Authentication error", { error: error.message });

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, error: "Token has expired" });
    }

    return res
      .status(401)
      .json({ success: false, error: "Invalid authentication token" });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = Jwt.verify(token, config.JWT_SECRET);
      req.userId = decoded.userId;
      req.username = decoded.username;
      req.user = decoded;
      req.authenticated = true;
    } else {
      req.authenticated = false;
    }

    next();
  } catch (error) {
    logger.warn("Optional auth error (proceeding without auth)", {
      error: error.message,
    });
    req.authenticated = false;
    next();
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (
  userId,
  username,
  expiresIn = config.JWT_EXPIRY,
) => {
  return Jwt.sign({ userId, username }, config.JWT_SECRET, { expiresIn });
};
