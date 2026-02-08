import mongoose from "mongoose";
import config from "../config.js";

/**
 * Booking Schema - Embedded in User
 */
const bookingSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },
    employeeImage: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    bookedBy: {
      type: String,
      required: true,
    },
  },
  { _id: true, timestamps: true },
);

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    username: {
      type: String,
      required: [true, "Please provide a unique username"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a strong password"],
      minlength: config.PASSWORD_MIN_LENGTH,
      select: false,
    },
    bookings: {
      type: [bookingSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for frequently queried fields
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Hash password middleware is handled in the service layer

// Export the model
export default mongoose.models.user || mongoose.model("user", userSchema);
