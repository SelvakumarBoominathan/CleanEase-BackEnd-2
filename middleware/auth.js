// generate OTP
import otpGenerator from "otp-generator";  // this is to generate otp
const otpStore = { auth_otp: null };  // creates simple in-memory store. 

export async function localVariables(req, res, next) {
  try {
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

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
