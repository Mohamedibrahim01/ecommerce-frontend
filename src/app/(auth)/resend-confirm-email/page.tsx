"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { api } from "@/src/components/auth/axiosInstance";

const RESEND_CONFIRMATION_ENDPOINT = "/auth/resend-confirmation";

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
    "Failed to resend confirmation link."
  );
}

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleResendSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(
        RESEND_CONFIRMATION_ENDPOINT,
        {
          email: email,
        },
      );

      const successMessage =
        response.data?.Message ||
        "Confirmation link has been resent to your email! ✉️";
      toast.success(successMessage);
      setEmail("");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Resend Confirmation Error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between font-sans antialiased">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-xl font-bold text-gray-900">
              Resend Confirmation Email
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your email address and we will send you a new link to
              activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleResendSubmit} className="space-y-4">
              {/* Email Input Field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative" dir="ltr">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 pr-3 focus-visible:ring-[#059669] text-left"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-md transition-colors font-medium mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Confirmation Link"
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center text-sm pt-4 border-t border-gray-100">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[#059669] font-semibold hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
