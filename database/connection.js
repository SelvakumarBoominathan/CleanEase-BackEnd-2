// export default connect;
import mongoose from "mongoose";
import ENV from "../config.js"; // Access environment variable for URI

async function connect() {
  try {
    mongoose.set("strictQuery", true); // Set strictQuery option
    // console.log("Connecting to MongoDB...");

    // Connect to the MongoDB Atlas database using the URI from ENV
    const db = await mongoose.connect(ENV.ATLAS_URI); // Use the URI from the config

    // console.log("Database connected successfully");
    return db;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
}

export default connect;
