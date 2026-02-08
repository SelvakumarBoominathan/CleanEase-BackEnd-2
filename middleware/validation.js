import Joi from "joi";
import { AppError } from "./errorHandler.js";
import config from "../config.js";

/**
 * Validation schemas
 */
export const validationSchemas = {
  // User Registration
  register: Joi.object({
    name: Joi.string().trim().required().min(2).max(100),
    username: Joi.string().alphanum().required().min(3).max(30).messages({
      "string.alphanum": "Username can only contain letters and numbers",
    }),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string()
      .required()
      .min(config.PASSWORD_MIN_LENGTH)
      .max(config.PASSWORD_MAX_LENGTH)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      .messages({
        "string.pattern.base":
          "Password must contain uppercase, lowercase, and numbers",
        "string.min": `Password must be at least ${config.PASSWORD_MIN_LENGTH} characters`,
      }),
  }),

  // User Login
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),

  // Email OTP Request
  registermail: Joi.object({
    email: Joi.string().email().required().lowercase(),
    userId: Joi.string().required(),
  }),

  // OTP Verification
  verifyOTP: Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.pattern.base": "OTP must be 6 digits",
    }),
  }),

  // Password Reset
  resetPassword: Joi.object({
    username: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(config.PASSWORD_MIN_LENGTH)
      .max(config.PASSWORD_MAX_LENGTH)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      .messages({
        "string.pattern.base":
          "Password must contain uppercase, lowercase, and numbers",
      }),
  }),

  // Add Employee
  addEmployee: Joi.object({
    image: Joi.string().uri().required(),
    name: Joi.string().trim().required().min(2).max(100),
    category: Joi.string().trim().required().min(2),
    city: Joi.string().trim().required().min(2),
    id: Joi.number().integer().positive().required(),
    price: Joi.number().positive().required(),
  }),

  // Update Employee
  updateEmployee: Joi.object({
    image: Joi.string().uri(),
    name: Joi.string().trim().min(2).max(100),
    category: Joi.string().trim().min(2),
    city: Joi.string().trim().min(2),
    price: Joi.number().positive(),
  }).min(1),

  // Add Rating
  addRating: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    reviewtext: Joi.string().trim().max(500).required(),
    username: Joi.string().required(),
    empID: Joi.string().required(),
  }),

  // Add Booking
  addBooking: Joi.object({
    employeeId: Joi.string().required(),
    username: Joi.string().required(),
    time: Joi.string().required(),
    date: Joi.date().min("now").required(),
  }),

  // Remove Booking
  removeBooking: Joi.object({
    bookingId: Joi.string().required(),
  }),

  // Pagination Query
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(config.MAX_PAGE_SIZE)
      .default(config.DEFAULT_PAGE_SIZE),
  }),
};

/**
 * Validation middleware factory
 */
export const validate = (schemaKey) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaKey];

    if (!schema) {
      return next(
        new AppError(`Validation schema "${schemaKey}" not found`, 500),
      );
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(message, 400));
    }

    req.body = value;
    next();
  };
};

/**
 * Query validation middleware
 */
export const validateQuery = (schemaKey) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaKey];

    if (!schema) {
      return next(
        new AppError(`Validation schema "${schemaKey}" not found`, 500),
      );
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(message, 400));
    }

    req.query = value;
    next();
  };
};
