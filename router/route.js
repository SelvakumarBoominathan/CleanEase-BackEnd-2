import { Router } from "express";
import * as controller from "../controllers/appcontroller.js";
import { localVariables } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validation.js";
import { requireAuth } from "../middleware/jwtMiddleware.js";
import {
  authLimiter,
  otpLimiter,
  resetLimiter,
} from "../middleware/rateLimiter.js";

const router = Router();

/**
 * AUTHENTICATION ROUTES
 */

// User Registration
router
  .route("/register")
  .post(authLimiter, validate("register"), controller.register);

// User Login
router
  .route("/login")
  .post(
    authLimiter,
    controller.verifyUser,
    validate("login"),
    controller.login,
  );

// Send OTP to Email
router
  .route("/registermail")
  .post(
    otpLimiter,
    localVariables,
    validate("registermail"),
    controller.registermail,
  );

// Verify OTP
router
  .route("/otpvalidation")
  .post(otpLimiter, validate("verifyOTP"), controller.verifyOTP);

// Reset Password
router
  .route("/resetPassword")
  .patch(
    resetLimiter,
    controller.createResetSession,
    validate("resetPassword"),
    controller.resetPassword,
  );

// Authenticate User (verify token)
router
  .route("/authenticate")
  .post(controller.verifyUser, requireAuth, (req, res) =>
    res.json({ success: true, msg: "User authenticated" }),
  );

// Get Bill (placeholder)
router.route("/getbill").post(controller.getbill);

// Get User by Username
router.route("/user/:username").get(controller.getUser);

// Reset Session
router.route("/ResetSession").get(controller.createResetSession);

/**
 * EMPLOYEE ROUTES
 */

// Add Employee (requires authentication)
router
  .route("/addemployee")
  .post(requireAuth, validate("addEmployee"), controller.addemployee);

// Get All Employees (with pagination)
router
  .route("/employees")
  .get(validateQuery("pagination"), controller.getEmployees);

// Get Single Employee by ID
router.route("/employees/:id").get(controller.getSingleEmployee);

// Update Employee (requires authentication)
router
  .route("/updateEmployee/:id")
  .put(requireAuth, validate("updateEmployee"), controller.updateEmployee);

// Delete Employee (requires authentication)
router
  .route("/deleteEmployee/:id")
  .delete(requireAuth, controller.deleteEmployee);

/**
 * RATING AND REVIEW ROUTES
 */

// Add Rating and Review (requires authentication)
router
  .route("/rating")
  .post(requireAuth, validate("addRating"), controller.addrating);

/**
 * BOOKING ROUTES
 */

// Add Booking (requires authentication)
router
  .route("/booking")
  .post(requireAuth, validate("addBooking"), controller.addBooking);

// Get User Bookings (requires authentication)
router.route("/Cartpage").get(requireAuth, controller.getbookings);

// Remove Booking (requires authentication)
router
  .route("/removeBooking")
  .delete(requireAuth, validate("removeBooking"), controller.removeBooking);

export default router;
