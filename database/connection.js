import mongoose from "mongoose";
import config from "../config.js";
import logger from "../middleware/logger.js";

/**
 * Connect to MongoDB
 */
const connect = async () => {
  try {
    mongoose.set("strictQuery", true);

    logger.info("Connecting to MongoDB...", {
      uri: config.ATLAS_URI.substring(0, 30) + "...",
    });

    const db = await mongoose.connect(config.ATLAS_URI);

    logger.info("✅ Database connected successfully");

    return db;
  } catch (error) {
    logger.error("❌ Database connection failed", {
      error: error.message,
    });
    throw error;
  }
};

export default connect;
