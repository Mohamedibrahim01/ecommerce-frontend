"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

const CONFIRM_EMAIL_BASE_URL = "/auth/confirm-email";

type ConfirmationStatus = "loading" | "success" | "error";

interface ConfirmEmailResponse {
  message?: string;
  Message?: string;
}

interface ConfirmEmailErrorResponse {
  message?: string;
  Message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
}

function getRouteToken(param: string | string[] | undefined) {
  const rawToken = Array.isArray(param) ? param[0] : param;

  if (!rawToken || rawToken.trim() === "") return null;

  try {
    return decodeURIComponent(rawToken).trim();
  } catch {
    return null;
  }
}

function getErrorMessage(errorData: unknown) {
  if (typeof errorData === "string") return errorData;

  if (errorData && typeof errorData === "object") {
    const data = errorData as ConfirmEmailErrorResponse;
    const fieldError = data.errors
      ? Object.values(data.errors)
        .map((value) => (Array.isArray(value) ? value[0] : value))
        .find(Boolean)
      : null;

    return (
      fieldError ||
      data.message ||
      data.Message ||
      data.error ||
      "Invalid or expired token."
    );
  }

  return "Invalid or expired token.";
}

export default function ConfirmEmailTokenPage() {
  const params = useParams<{ token?: string | string[] }>();
  const token = useMemo(() => getRouteToken(params.token), [params.token]);
  const hasVerifiedRef = useRef(false);
  const [status, setStatus] = useState<ConfirmationStatus>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Verifying your email, please wait..."
      : "Invalid or missing confirmation token.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    const confirmationToken = token;

    async function confirmEmail() {
      try {
        const response = await api.get<ConfirmEmailResponse>(
          `${CONFIRM_EMAIL_BASE_URL}/${encodeURIComponent(confirmationToken)}`,
        );
        const successMessage =
          response.data?.message ||
          response.data?.Message ||
          "Your email has been confirmed successfully. You can now sign in.";

        setStatus("success");
        setMessage(successMessage);
      } catch (error: unknown) {
        const err = error as {
          response?: { status?: number; data?: unknown };
          message?: string;
        };
        const errorMessage =
          err.response?.status === 400 ||
            err.response?.status === 404 ||
            err.response?.status === 500
            ? getErrorMessage(err.response?.data)
            : err.message || "We could not confirm your email right now.";

        setStatus("error");
        setMessage(errorMessage);
      }
    }

    confirmEmail();
  }, [token]);

  return (
    <div
      className="min-h-screen bg-stone-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased"
      dir="ltr"
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #059669 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <Card className="w-full max-w-md bg-white border border-stone-200 shadow-xl rounded-3xl overflow-hidden relative z-10 animate-fade-up">
        <div className="h-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />

        <CardContent className="p-8 md:p-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Image
              src="/logo.png"
              alt="PeakSupps Logo"
              width={36}
              height={36}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
            <span className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight">
              PEAK<span className="text-emerald-600">SUPPS</span>
            </span>
          </div>

          {status === "loading" && (
            <div className="py-6 space-y-4">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto animate-pulse">
                <Loader2
                  className="h-10 w-10 text-emerald-600 animate-spin"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-stone-900">
                  Confirming Email
                </h1>
                <p className="text-stone-500 text-sm">{message}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="py-4 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2
                  className="h-10 w-10 text-emerald-600"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  Email Confirmed
                </h1>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/login">
                  Sign In Now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="h-20 w-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle
                  className="h-10 w-10 text-red-500"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  Verification Failed
                </h1>
                <p className="text-red-600 font-medium text-sm leading-relaxed">
                  {message}
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl font-bold"
                >
                  <Link href="/resend-confirm-email">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Resend Confirmation Email
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl font-bold border-stone-200 text-stone-700"
                >
                  <Link href="/">
                    <Home
                      className="h-4 w-4 text-stone-400"
                      aria-hidden="true"
                    />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
