import { messages } from "@/config/messages";
import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: messages.Required }),
  lastName: z.string().min(1, { message: messages.Required }),
  userName: z.string().min(1, { message: messages.Required }),
  dateOfBirth: z.string().min(1, { message: messages.Required }),
  status: z.string().min(1, { message: messages.Required }),
  address: z
    .string()
    .max(100, { message: "Address must be at most 100 characters" })
    .min(1, { message: messages.Required }),
  gender: z.string().min(1, { message: messages.Required }),
  bio: z
    .string()
    .max(300, { message: "Bio must be at most 300 characters" })
    .min(1, { message: messages.Required }),
});
export default profileFormSchema;
