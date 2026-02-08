import dotenv from "dotenv";

dotenv.config();

/**
 * Validates that all required environment variables are configured
 */
function validateEnv() {
  const requiredVars = ["JWT_SECRET", "EMAIL", "PASSWORD", "NODE_ENV"];

  // ATLAS_URI or DATABASE_URL (Docker) is required
  const hasDatabase = process.env.ATLAS_URI || process.env.DATABASE_URL;
  if (!hasDatabase) {
    requiredVars.push("ATLAS_URI or DATABASE_URL");
  }

  const missingVars = requiredVars.filter(
    (varName) =>
      !process.env[varName] && varName !== "ATLAS_URI or DATABASE_URL",
  );

  if (missingVars.length > 0 || !hasDatabase) {
    throw new Error(
      `Missing required environment variables: ${
        missingVars.length > 0
          ? missingVars.join(", ")
          : "ATLAS_URI or DATABASE_URL"
      }`,
    );
  }
}

/**
 * Application configuration object
 */
const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8000,
  BASE_URL: process.env.BASE_URL || "http://localhost:8000",

  // Database - Support both ATLAS_URI and DATABASE_URL (Docker)
  ATLAS_URI: process.env.ATLAS_URI || process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || "24h",
  OTP_EXPIRY: parseInt(process.env.OTP_EXPIRY || "300", 10), // Default: 5 minutes

  // Email
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // CORS
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),

  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10,
  ),

  // Password Policy
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Validation
  isDevelopment: () => config.NODE_ENV === "development",
  isProduction: () => config.NODE_ENV === "production",
};

// Validate on import
validateEnv();

export default config;
