import { z } from "zod";

const otpVerifySchema = z.object({
  otp: z.string().length(6, { message: "OTP must be exactly 6 digits" }),
});

export default otpVerifySchema;
