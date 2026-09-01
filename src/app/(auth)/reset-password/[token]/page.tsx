"use client";

import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useState, use } from "react";
import { api } from "@/src/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const RESET_PASSWORD_BASE_URL = "/auth/reset-password";

const passwordSchema = z.string().superRefine((val, ctx) => {
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
});

function getErrorMessage(error: unknown) {
  const err = error as {
    response?: { data?: { message?: string; Message?: string } | string };
    message?: string;
  };

  if (typeof err.response?.data === "string") return err.response.data;

  return (
    err.response?.data?.message ||
    err.response?.data?.Message ||
    err.message ||
    "Failed to reset password."
  );
}

export default function ResetPassword({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) {
      setErrors({
        password: passwordResult.error.issues[0].message,
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: "Passwords do not match.",
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post(
        `${RESET_PASSWORD_BASE_URL}/${encodeURIComponent(token)}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      );
      toast.success(
        response.data?.message ||
          response.data?.Message ||
          "Password changed successfully!",
      );
      router.push("/login");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between font-sans antialiased"
      dir="ltr"
    >
      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-base font-medium text-gray-500">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-xl font-bold text-gray-900">
              Enter a new secure password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-4 text-left">
                {/* password field */}
                <div className="space-y-1.5">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      placeholder="New Password"
                      className="pl-10 pr-10 focus-visible:ring-[#059669]"
                      required
                      value={formData.password}
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* confirm password field */}
                <div className="space-y-1.5">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      placeholder="Confirm New Password"
                      className="pl-10 pr-10 focus-visible:ring-[#059669]"
                      required
                      value={formData.confirmPassword}
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-md transition-colors font-medium mt-2"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
