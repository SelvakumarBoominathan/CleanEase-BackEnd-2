// import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";
// import ENV from "../config.js";

// async function connect() {
//   const mongod = await MongoMemoryServer.create();
//   // const getUri = mongod.getUri();
//   mongoose.set("strictQuery", true);

//   // const db = await mongoose.connect(getUri);
//   const db = await mongoose.connect(ENV.ATLAS_URI);
//   console.log("database connected");
//   return db;
// }

// export default connect;

import mongoose from "mongoose";
import ENV from "../config.js"; // Access environment variable for URI

async function connect() {
  try {
    mongoose.set("strictQuery", true); // Set strictQuery option
    console.log("Connecting to MongoDB...");

    // Connect to the MongoDB Atlas database using the URI from ENV
    const db = await mongoose.connect(ENV.ATLAS_URI); // Use the URI from the config

    console.log("Database connected successfully");
    return db; // Return the DB connection
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error; // Throw error if connection fails
  }
}

export default connect;
