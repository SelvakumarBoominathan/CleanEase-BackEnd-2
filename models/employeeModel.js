import mongoose from "mongoose";

/**
 * Review Schema - Embedded in Employee
 */
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

/**
 * Booking Schema - Embedded in Employee
 */
const bookingSchema = new mongoose.Schema({
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
});

/**
 * Rating Schema - Embedded in Employee
 */
const ratingSchema = new mongoose.Schema({
  average: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
});

/**
 * Employee Schema
 */
const employeeSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Please provide image URL"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Please provide name"],
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      trim: true,
      enum: ["Cleaning", "Maintenance", "Plumbing", "Electrical", "Painting"], // Example categories
      index: true,
    },
    city: {
      type: String,
      required: [true, "Please provide city"],
      trim: true,
      minlength: 2,
      index: true,
    },
    id: {
      type: Number,
      required: [true, "Please provide id"],
      unique: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
      min: [0, "Price cannot be negative"],
    },
    rating: {
      type: ratingSchema,
      default: () => ({
        average: 0,
        count: 0,
      }),
    },
    review: {
      type: [reviewSchema],
      default: [],
    },
    bookings: {
      type: [bookingSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for better query performance
employeeSchema.index({ name: "text", category: 1 }); // Text index for search
employeeSchema.index({ category: 1, city: 1 }); // Compound index for filtering
employeeSchema.index({ createdAt: -1 }); // For sorting

export default mongoose.model.employee ||
  mongoose.model("employee", employeeSchema);
