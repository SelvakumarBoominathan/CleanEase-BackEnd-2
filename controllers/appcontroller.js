import UserModel from "../models/userModel.js";
import EmployeeModel from "../models/employeeModel.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import config from "../config.js";
import logger from "../middleware/logger.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { userService, bookingService } from "../services/userService.js";
import { employeeService } from "../services/employeeService.js";
import { emailValidator } from "../utils/validators.js";

/**
 * Middleware to verify user exists during login
 */
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method === "GET" ? req.query : req.body;

    const exist = await UserModel.findOne({ username });
    if (!exist) {
      return res.status(404).json({
        success: false,
        error: `User ${username} does not exist`,
      });
    }
    next();
  } catch (error) {
    logger.error("User verification error", { error: error.message });
    return res.status(500).json({
      success: false,
      error: "Authentication error",
    });
  }
}

/**
 * User Registration
 */
export const register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

/**
 * User Login
 */
export const login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body);
  res.status(200).json({ success: true, ...result });
});

/**
 * Send OTP via Email
 */
export const registermail = asyncHandler(async (req, res) => {
  const { email, userId } = req.body;

  // Validate email format
  if (!emailValidator.isValid(email)) {
    throw new AppError("Invalid email format", 400);
  }

  const result = await userService.sendOTP(email, userId);

  res.status(201).json({ success: true, ...result });
});

/**
 * Verify OTP
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const result = await userService.verifyOTP(userId, otp);

  res.status(200).json({ success: true, ...result });
});

/**
 * Get User by Username
 */
export const getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new AppError("Invalid username!", 400);
  }

  const user = await userService.getUserByUsername(username);

  res.status(200).json({ success: true, user });
});

/**
 * Create Reset Session
 */
export async function createResetSession(req, res, next) {
  try {
    // For now, we'll let the flow continue
    // The actual session is validated in resetPassword
    next();
  } catch (error) {
    logger.error("Error in createResetSession", { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Reset Password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { username, password, userId } = req.body;

  if (!userId) {
    throw new AppError("User ID is required for password reset", 400);
  }

  const result = await userService.resetPassword(username, password, userId);

  res.status(200).json({ success: true, ...result });
});

/**
 * Get Bill (placeholder endpoint)
 */
export const getbill = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    msg: "Get bill successfully!",
  });
});

/**
 * EMPLOYEE ENDPOINTS
 */

/**
 * Add Employee
 */
export const addemployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.addEmployee(req.body);
  res.status(201).json({ success: true, employee });
});

/**
 * Get All Employees with Pagination
 */
export const getEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = config.DEFAULT_PAGE_SIZE } = req.query;

  const result = await employeeService.getEmployees(
    parseInt(page, 10),
    parseInt(limit, 10),
  );

  res.status(200).json({ success: true, ...result });
});

/**
 * Get Single Employee by ID
 */
export const getSingleEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await employeeService.getSingleEmployee(id);

  res.status(200).json({ success: true, employee });
});

/**
 * Update Employee
 */
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await employeeService.updateEmployee(id, req.body);

  res.status(200).json({ success: true, employee: result });
});

/**
 * Delete Employee
 */
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await employeeService.deleteEmployee(id);

  res.status(200).json({ success: true, ...result });
});

/**
 * RATING AND REVIEW ENDPOINTS
 */

/**
 * Add Rating and Review
 */
export const addrating = asyncHandler(async (req, res) => {
  const { empID } = req.body;

  const result = await employeeService.addRating(empID, req.body);

  res.status(200).json({ success: true, employee: result });
});

/**
 * BOOKING ENDPOINTS
 */

/**
 * Add Booking
 */
export const addBooking = asyncHandler(async (req, res) => {
  const result = await employeeService.addBooking(req.body);

  res.status(201).json({ success: true, ...result });
});

/**
 * Get Bookings for User
 */
export const getbookings = asyncHandler(async (req, res) => {
  const username = req.username;

  const result = await bookingService.getBookings(username);

  res.status(200).json({ success: true, ...result });
});

/**
 * Remove Booking
 */
export const removeBooking = asyncHandler(async (req, res) => {
  const username = req.username;
  const { bookingId } = req.body;

  const result = await bookingService.removeBooking(username, bookingId);

  res.status(200).json({ success: true, ...result });
});
