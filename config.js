import dotenv from "dotenv";

dotenv.config();

export default {
  JWT_SECRET: process.env.JWT_SECRET,
  ATLAS_URI: process.env.ATLAS_URI,
};
