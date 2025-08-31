import * as yup from "yup";
import { emailRegex, passwordRegex } from "@/lib/regex";

const emailField = yup
  .string()
  .required("Email is required")
  .matches(emailRegex, "Invalid email format");

const passwordField = yup
  .string()
  .required("Password is required")
  .matches(
    passwordRegex,
    "Password must be at least 8 characters, include upper & lowercase letters, a number and a special character"
  );

export const registerSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters"),
  email: emailField,
  password: passwordField,
});

export const loginSchema = yup.object({
  email: emailField,
  password: passwordField,
});

export type LoginSchemaType = yup.InferType<typeof loginSchema>;
export type RegisterSchemaType = yup.InferType<typeof registerSchema>;
