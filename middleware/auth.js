// generate OTP
import otpGenerator from "otp-generator"; // this is to generate otp
import redisClient from "./redisClient.js";
const otpStore = { auth_otp: null }; // creates simple in-memory store.

export async function localVariables(req, res, next) {
  try {
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const userId = req.body.userId; // Assuming userId is sent in the request body

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await redisClient.set(`otp:${userId}`, otp, { EX: 300 }); // Store OTP in Redis with a TTL of 5 minutes (300 seconds)

    // Store OTP in memory
    otpStore.auth_otp = otp;

    req.otp = otp;
    next();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
// console.log(otpStore.auth_otp);
export default otpStore;
