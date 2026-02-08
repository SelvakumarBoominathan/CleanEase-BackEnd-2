import { createClient } from "redis";
import config from "../config.js";
import logger from "./logger.js";

/**
 * In-memory fallback for development (when Redis is not available)
 * WARNING: This should ONLY be used in development!
 * For production, ensure Redis is always available.
 */
const inMemoryStore = new Map();

// Set expiration for in-memory keys
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.expiresAt && value.expiresAt < now) {
      inMemoryStore.delete(key);
    }
  }
}, 60000); // Check every minute

/**
 * Fallback Redis client using in-memory storage for development
 */
const fallbackClient = {
  set: async (key, value, options = {}) => {
    const expiresAt = options.EX ? Date.now() + options.EX * 1000 : null;
    inMemoryStore.set(key, { value, expiresAt });
    return "OK";
  },
  get: async (key) => {
    const item = inMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  },
  del: async (key) => {
    return inMemoryStore.delete(key) ? 1 : 0;
  },
  connect: async () => {
    logger.warn(
      "⚠️  Using in-memory fallback for Redis (development only - NOT for production!)",
    );
    return true;
  },
};

/**
 * Create and configure Redis client
 */
let redisClient = null;
let usingFallback = false;

const createRedisClient = async () => {
  try {
    const client = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            logger.warn(
              "⚠️  Redis connection failed. Switching to in-memory fallback for development.",
            );
            usingFallback = true;
            return new Error("Switching to fallback");
          }
          return retries * 100;
        },
      },
    });

    /**
     * Error event handler
     */
    client.on("error", (err) => {
      if (!usingFallback) {
        logger.warn("Redis client error (will use fallback):", {
          error: err.message,
        });
      }
    });

    /**
     * Connect event handler
     */
    client.on("connect", () => {
      logger.info("✅ Redis client connected");
      usingFallback = false;
    });

    /**
     * Connection in progress
     */
    client.on("ready", () => {
      logger.info("✅ Redis client is ready");
    });

    /**
     * Connection close handler
     */
    client.on("close", () => {
      logger.warn("Redis client connection closed");
    });

    /**
     * Try to connect to Redis
     */
    await client.connect();
    logger.info("✅ Connected to Redis", { url: config.REDIS_URL });
    return client;
  } catch (err) {
    logger.warn(
      "⚠️  Redis connection failed. Using in-memory fallback for development.",
      { error: err.message },
    );
    logger.warn(
      "⚠️  NOTE: This is NOT suitable for production! Please start Redis server.",
    );
    logger.warn("   Windows: Use WSL (wsl && redis-server) or Docker");
    logger.warn("   URL: https://github.com/microsoftarchive/redis/releases");
    usingFallback = true;
    return fallbackClient;
  }
};

/**
 * Initialize Redis client
 */
redisClient = await createRedisClient();

export default redisClient;
