import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import redisClient from "../middleware/redisClient.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import config from "../config.js";
import { AppError } from "../middleware/errorHandler.js";
import logger from "../middleware/logger.js";
import { generateToken } from "../middleware/jwtMiddleware.js";

/**
 * User service - User-related business logic
 */
export const userService = {
  /**
   * Register new user
   */
  async register(userData) {
    const { name, username, email, password } = userData;

    // Check if user exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new AppError("Username already exists", 400);
      }
      throw new AppError("Email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new UserModel({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    logger.info("User registered successfully", { username });

    return {
      msg: "User registered successfully.",
      username: newUser.username,
    };
  },

  /**
   * Login user
   */
  async login(credentials) {
    const { username, password } = credentials;

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new AppError("Username not found", 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new AppError("Password does not match", 400);
    }

    const token = generateToken(user._id.toString(), user.username);

    logger.info("User logged in successfully", { username });

    return {
      msg: "Login Successful!",
      username: user.username,
      token,
    };
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove sensitive fields
    const { password, ...userWithoutPassword } = user.toObject();

    return userWithoutPassword;
  },

  /**
   * Send OTP via email
   */
  async sendOTP(email, userId) {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("Email not found", 404);
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Store OTP in Redis with TTL
    await redisClient.set(`otp:${userId}`, otp, {
      EX: config.OTP_EXPIRY,
    });

    // Send email
    const config_email = {
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: false,
      auth: {
        user: config.EMAIL,
        pass: config.PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(config_email);

    const message = {
      from: `"CleanEase" <${config.EMAIL}>`,
      to: email,
      subject: "OTP Verification",
      html: `<b>Your OTP is <h1>${otp}</h1></b>`,
    };

    try {
      const info = await transporter.sendMail(message);
      logger.info("OTP email sent successfully", { email, userId });

      return {
        user: user.username,
        msg: "Mail Sent Successfully!",
        info: info.messageId,
      };
    } catch (error) {
      logger.error("Failed to send OTP email", { email, error: error.message });
      throw new AppError("Failed to send OTP email", 500);
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(userId, otp) {
    const storedOTP = await redisClient.get(`otp:${userId}`);

    if (!storedOTP) {
      throw new AppError("OTP expired or not generated", 400);
    }

    if (storedOTP !== String(otp)) {
      throw new AppError("Invalid OTP", 400);
    }

    // Delete OTP after verification
    await redisClient.del(`otp:${userId}`);

    // Set reset session flag
    await redisClient.set(`reset-session:${userId}`, "true", {
      EX: 600, // 10 minutes
    });

    logger.info("OTP verified successfully", { userId });

    return { msg: "OTP verified!" };
  },

  /**
   * Reset password
   */
  async resetPassword(username, password, userId) {
    // Verify reset session exists
    const sessionExists = await redisClient.get(`reset-session:${userId}`);
    if (!sessionExists) {
      throw new AppError("Password reset session expired", 400);
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new AppError("Username not found", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.updateOne({ username }, { password: hashedPassword });

    // Clear session
    await redisClient.del(`reset-session:${userId}`);

    logger.info("Password reset successfully", { username });

    return { msg: "Password updated successfully!" };
  },
};

/**
 * Booking service
 */
export const bookingService = {
  /**
   * Get user bookings
   */
  async getBookings(username) {
    const user = await UserModel.findOne({ username }).select("bookings");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return { bookings: user.bookings };
  },

  /**
   * Remove booking
   */
  async removeBooking(username, bookingId) {
    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const initialLength = user.bookings.length;

    user.bookings = user.bookings.filter(
      (booking) => booking._id.toString() !== bookingId,
    );

    if (user.bookings.length === initialLength) {
      throw new AppError("Booking not found", 404);
    }

    await user.save();

    logger.info("Booking removed", { username, bookingId });

    return { message: "Booking removed successfully!" };
  },
};
