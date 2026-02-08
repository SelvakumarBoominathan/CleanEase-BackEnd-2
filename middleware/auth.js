import otpGenerator from "otp-generator";
import redisClient from "./redisClient.js";
import config from "../config.js";
import logger from "./logger.js";

/**
 * Generate and store OTP in Redis
 * Middleware that generates OTP and stores it with TTL
 */
export async function localVariables(req, res, next) {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store OTP in Redis with TTL (5 minutes)
    await redisClient.set(`otp:${userId}`, otp, {
      EX: config.OTP_EXPIRY,
    });

    req.otp = otp;

    logger.debug("OTP generated and stored", {
      userId,
      expiresIn: config.OTP_EXPIRY,
    });

    next();
  } catch (error) {
    logger.error("Error in localVariables middleware", {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
}
