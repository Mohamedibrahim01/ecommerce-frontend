import * as z from "zod";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterRequestPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const registerSchema = z
  .object({
    name: z.string().superRefine((val, ctx) => {
      if (!val || val.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required.",
        });
        return;
      }
      if (val.trim().length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name must not exceed 100 characters.",
        });
      }
    }),
    email: z.string().superRefine((val, ctx) => {
      if (!val || val.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email address is required.",
        });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address.",
        });
      }
    }),
    password: z.string().superRefine((val, ctx) => {
      if (!val || val === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required.",
        });
        return;
      }
      if (val.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters.",
        });
        return;
      }
      const hasLowerCase = /[a-z]/.test(val);
      const hasUpperCase = /[A-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(val);
      if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        });
      }
    }),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
