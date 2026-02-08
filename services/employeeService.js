import EmployeeModel from "../models/employeeModel.js";
import UserModel from "../models/userModel.js";
import config from "../config.js";
import { AppError } from "../middleware/errorHandler.js";
import logger from "../middleware/logger.js";

/**
 * Employee service - Employee-related business logic
 */
export const employeeService = {
  /**
   * Add new employee
   */
  async addEmployee(employeeData) {
    const newEmployee = new EmployeeModel(employeeData);
    await newEmployee.save();

    logger.info("Employee added successfully", {
      empId: newEmployee.id,
      name: newEmployee.name,
    });

    return newEmployee;
  },

  /**
   * Get all employees with pagination
   */
  async getEmployees(page = 1, limit = config.DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;

    const [employees, totalCount] = await Promise.all([
      EmployeeModel.find({}).skip(skip).limit(limit).lean(),
      EmployeeModel.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.debug("Employees fetched", {
      page,
      limit,
      totalCount,
      totalPages,
    });

    return {
      employees,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get single employee by ID
   */
  async getSingleEmployee(employeeId) {
    const numericId = Number(employeeId);

    if (isNaN(numericId)) {
      throw new AppError("Invalid employee ID format", 400);
    }

    const employee = await EmployeeModel.findOne({ id: numericId });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    return employee;
  },

  /**
   * Update employee
   */
  async updateEmployee(employeeId, updateData) {
    const numericId = parseInt(employeeId, 10);

    if (isNaN(numericId)) {
      throw new AppError("Invalid employee ID format", 400);
    }

    const result = await EmployeeModel.findOneAndUpdate(
      { id: numericId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new AppError("Employee not found", 404);
    }

    logger.info("Employee updated successfully", { empId: numericId });

    return result;
  },

  /**
   * Delete employee
   */
  async deleteEmployee(employeeId) {
    const numericId = parseInt(employeeId, 10);

    if (isNaN(numericId)) {
      throw new AppError("Invalid employee ID format", 400);
    }

    const result = await EmployeeModel.deleteOne({ id: numericId });

    if (result.deletedCount === 0) {
      throw new AppError("Employee not found", 404);
    }

    logger.info("Employee deleted successfully", { empId: numericId });

    return { message: "Employee deleted successfully" };
  },

  /**
   * Add rating and review
   */
  async addRating(empID, ratingData) {
    const { rating, reviewtext, username } = ratingData;
    const numericEmpID = parseInt(empID, 10);

    if (isNaN(numericEmpID)) {
      throw new AppError("Invalid employee ID format", 400);
    }

    const employee = await EmployeeModel.findOne({ id: numericEmpID });
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    // Check if user already reviewed
    const existingReview = employee.review.find((r) => r.name === username);
    if (existingReview) {
      throw new AppError("You have already submitted a review", 409);
    }

    // Calculate new average rating
    const currentAvg = employee.rating.average;
    const currentCount = employee.rating.count;
    const newCount = currentCount + 1;
    const newAvg = (currentAvg * currentCount + rating) / newCount;

    const newReview = {
      name: username,
      comments: reviewtext,
    };

    const result = await EmployeeModel.findOneAndUpdate(
      { id: numericEmpID },
      {
        $set: {
          "rating.average": newAvg,
          "rating.count": newCount,
        },
        $push: {
          review: newReview,
        },
      },
      { new: true },
    );

    logger.info("Rating added successfully", {
      empId: numericEmpID,
      username,
      rating,
    });

    return result;
  },

  /**
   * Add booking
   */
  async addBooking(bookingData) {
    const { employeeId, username, time, date } = bookingData;
    const numericEmpID = parseInt(employeeId, 10);

    if (isNaN(numericEmpID)) {
      throw new AppError("Invalid employee ID format", 400);
    }

    const [employee, user] = await Promise.all([
      EmployeeModel.findOne({ id: numericEmpID }),
      UserModel.findOne({ username }),
    ]);

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const bookingDetails = {
      employeeName: employee.name,
      employeeImage: employee.image,
      city: employee.city,
      date: new Date(date),
      time,
      bookedBy: username,
    };

    // Add to both employee and user
    employee.bookings.push(bookingDetails);
    user.bookings.push(bookingDetails);

    await Promise.all([employee.save(), user.save()]);

    logger.info("Booking created successfully", {
      empId: numericEmpID,
      username,
      date,
      time,
    });

    return { message: "Booking created successfully!" };
  },
};
