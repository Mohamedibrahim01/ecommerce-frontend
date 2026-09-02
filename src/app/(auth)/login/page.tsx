"use client";

import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useState } from "react";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import { AuthUser, useAuthStore } from "@/src/components/store/authStore";
import { useCartStore } from "@/src/components/store/cartStore";
import { useRouter, useSearchParams } from "next/navigation";

const LOGIN_ENDPOINT = "/auth/login";
interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginRequestPayload {
  email: string;
  password: string;
}

interface LoginResponsePayload {
  token?: string;
  accessToken?: string;
  authToken?: string;
  user?: AuthUser | null;
  roles?: string[];
  data?: {
    token?: string;
    accessToken?: string;
    authToken?: string;
    user?: AuthUser | null;
    roles?: string[];
  };
  message?: string;
  Message?: string;
}

interface LoginErrorResponse {
  message?: string;
  Message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
}

function getLoginErrorMessage(errorData: unknown, status?: number) {
  if (typeof errorData === "string") return errorData;

  if (errorData && typeof errorData === "object") {
    const data = errorData as LoginErrorResponse;
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
      (status === 401
        ? "Invalid email or password."
        : "Login failed. Please check your information and try again.")
    );
  }

  return status === 401
    ? "Invalid email or password."
    : "Login failed. Please check your information and try again.";
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedError, setUnverifiedError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginStore = useAuthStore((state) => state.login);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  // ── Login handler ────────────────────────────────────────────────────────
  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setUnverifiedError(false);
      setErrorMessage(null);

      const payload: LoginRequestPayload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      if (!payload.email || !payload.password) {
        const message = "Email and password are required.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        const message = "Please enter a valid email address.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      const response = await api.post<any>(
        LOGIN_ENDPOINT,
        payload,
      );
      
      const responseData = response.data.data;
      const token = responseData?.accessToken;

      if (!token) {
        throw new Error("Login succeeded, but no auth token was returned.");
      }

      // Pass user object and token to store
      loginStore(responseData, token);

      // Sync local cart to backend if any items exist
      try {
        const syncLocalCart = useCartStore.getState().syncLocalCart;
        if (syncLocalCart) {
          await syncLocalCart();
        }
      } catch (err) {
        console.error("Cart sync failed during login", err);
      }

      router.push(redirectTo as Route);
      toast.success("Welcome back!");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const rawMsg =
        err.response?.status === 400 || err.response?.status === 401
          ? getLoginErrorMessage(err.response?.data, err.response?.status)
          : err.message || "Login failed. Please try again.";
      const lowerMsg = rawMsg.toLowerCase();
      const isUnverified =
        lowerMsg.includes("confirm") ||
        lowerMsg.includes("verif") ||
        lowerMsg.includes("unconfirmed") ||
        lowerMsg.includes("unverified") ||
        lowerMsg.includes("not active");

      if (isUnverified) {
        setUnverifiedError(true);
        toast.error("Please verify your email address before signing in.");
      } else {
        const displayMsg =
          err.response?.status === 401 && !rawMsg
            ? "Invalid email or password."
            : rawMsg;
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans antialiased" dir="ltr">

      {/* ── Left — Branding Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-stone-900 flex-col justify-between p-12">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        {/* Emerald glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" aria-hidden="true" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PeakSupps Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <div>
            <span className="font-bold text-white text-sm">PEAK<span className="text-emerald-400">SUPPS</span></span>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Premium Nutrition</p>
          </div>
        </div>

        {/* Centre text */}
        <div className="relative z-10 space-y-6">
          <div className="h-px w-12 bg-emerald-600" aria-hidden="true" />
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Your goals.<br />
            <span className="text-emerald-400">Precisely fuelled.</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Access personalized supplement recommendations, track your progress, and achieve your peak performance.
          </p>

          {/* Trust badges */}
          <div className="space-y-3 pt-2">
            {[
              "Clinically formulated supplements",
              "Personalized nutrition plans",
              "Trusted by thousands of athletes",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-stone-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-stone-600">© {new Date().getFullYear()} PeakSupps</p>
      </div>

      {/* ── Right — Form Panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-up">

          {/* Logo above form */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <Image
              src="/logo.png"
              alt="PeakSupps Logo"
              width={44}
              height={44}
              className="h-10 sm:h-11 w-auto object-contain"
              priority
            />
            <span className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight">
              PEAK<span className="text-emerald-600">SUPPS</span>
            </span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Sign in</h1>
            <p className="text-stone-500 text-sm mt-1.5">
              New here?{" "}
              <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Unverified Email Alert */}
          {unverifiedError && (
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-3 animate-fade-up shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-900">
                    Email verification required
                  </h3>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed">
                    Your email address has not been verified yet. Please check your inbox and click the verification link before signing in.
                  </p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-amber-700">Didn&apos;t receive the link?</span>
                <Link
                  href="/resend-confirm-email"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Resend confirmation email
                </Link>
              </div>
            </div>
          )}

          {/* Generic Login Error Alert */}
          {errorMessage && !unverifiedError && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex items-center gap-3 text-xs font-medium text-red-700 animate-fade-up shadow-sm">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLoginSubmit} noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-stone-700">
                Email
              </Label>
              <div className="relative" dir="ltr">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-stone-700">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative" dir="ltr">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}

                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full rounded-xl font-bold mt-2"
              aria-label="Sign in to your account"
            >
              {!isSubmitting && <>Sign In <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-stone-50 px-2 text-stone-500 font-bold">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                loginAsGuest();
                router.push(redirectTo as Route);
                toast.success("Continuing as guest");
              }}
              className="w-full rounded-xl font-bold border-stone-300 text-stone-700 hover:bg-stone-200"
            >
              Continue as Guest
            </Button>
          </form>

          {/* Footer links */}
          <p className="text-center text-xs text-stone-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
