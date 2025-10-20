import { z } from "zod";
import { messages } from "@/config/messages";
import {
  validateNewPassword,
  validateConfirmPassword,
} from "@/lib/common-rules";

const resetPasswordSchema = z
  .object({
    password: validateNewPassword,
    confirmPassword: validateConfirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsDidNotMatch,
    path: ["confirmPassword"],
  });

export default resetPasswordSchema;
