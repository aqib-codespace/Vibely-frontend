"use client";
import * as z from "zod";

export const videoUploadSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
});

export default videoUploadSchema;
