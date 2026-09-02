"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Check,
  X,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterFormValues,
  RegisterRequestPayload,
} from "@/src/lib/registerSchema";
import { api } from "@/src/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

const REGISTER_ENDPOINT = "/auth/register";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const passwordValue =
    useWatch({ control: form.control, name: "password", defaultValue: "" }) ||
    "";

  // ── Password rules for visual strength indicator ─────────────────────────
  const passwordRules = {
    length: passwordValue.length >= 8,
    hasLowerCase: /[a-z]/.test(passwordValue),
    hasUpperCase: /[A-Z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
    hasSpecialChar: /[@$!%*?&#^_\-+=(),.?":{}|<>\[\]~]/.test(passwordValue),
  };
  const validRulesCount = Object.values(passwordRules).filter(Boolean).length;
  const passwordStrength =
    validRulesCount === 5
      ? 4
      : validRulesCount === 4
        ? 3
        : validRulesCount >= 2
          ? 2
          : validRulesCount === 1
            ? 1
            : 0;

  // ── Submit handler ───────────────────────────────────────────────────────
  async function handleRegisterSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      const payload: RegisterRequestPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      const response = await api.post(REGISTER_ENDPOINT, payload);
      toast.success("Account created successfully! Please check your email to verify your account.");
      router.push("/confirm-email");
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: Record<string, unknown> | string | Array<unknown>;
        };
      };
      const serverResponse = err?.response?.data;
      let handled = false;

      if (serverResponse && typeof serverResponse === "object") {
        const objResponse = serverResponse as Record<string, unknown>;
        const errorsMap = (objResponse.errors || objResponse.Errors) as Record<
          string,
          unknown
        >;
        if (errorsMap && typeof errorsMap === "object") {
          Object.entries(errorsMap).forEach(([key, msgs]) => {
            const rawMsg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (typeof rawMsg !== "string") return;
            const lowerKey = key.toLowerCase();
            const lowerMsg = rawMsg.toLowerCase();

            let friendlyMsg = rawMsg;
            if (
              lowerMsg.includes("already taken") ||
              lowerMsg.includes("duplicate") ||
              lowerMsg.includes("already in use") ||
              lowerMsg.includes("exists")
            ) {
              if (lowerKey.includes("email"))
                friendlyMsg =
                  "This email address is already registered. Try signing in instead.";
              else friendlyMsg = "This value is already taken or in use.";
            } else if (lowerMsg.includes("password")) {
              friendlyMsg =
                "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
            }

            if (lowerKey.includes("email")) {
              form.setError("email", { type: "server", message: friendlyMsg });
              handled = true;
            } else if (lowerKey.includes("password")) {
              if (lowerKey.includes("confirm")) {
                form.setError("confirmPassword", {
                  type: "server",
                  message: friendlyMsg,
                });
              } else {
                form.setError("password", {
                  type: "server",
                  message: friendlyMsg,
                });
              }
              handled = true;
            } else if (lowerKey.includes("name")) {
              form.setError("name", {
                type: "server",
                message: friendlyMsg,
              });
              handled = true;
            }
          });
        }

        if (Array.isArray(serverResponse)) {
          serverResponse.forEach((item: unknown) => {
            const objItem =
              typeof item === "object" && item !== null
                ? (item as Record<string, unknown>)
                : null;
            const code =
              typeof item === "string" ? item : String(objItem?.code || "");
            const desc =
              typeof item === "string"
                ? item
                : String(objItem?.description || objItem?.Message || "");
            const combined = `${code} ${desc}`.toLowerCase();

            if (combined.includes("email")) {
              form.setError("email", {
                type: "server",
                message:
                  "This email address is already registered. Try signing in instead.",
              });
              handled = true;
            } else if (combined.includes("password")) {
              if (combined.includes("confirm")) {
                form.setError("confirmPassword", {
                  type: "server",
                  message: "Passwords do not match.",
                });
              } else {
                form.setError("password", {
                  type: "server",
                  message:
                    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                });
              }
              handled = true;
            }
          });
        }

        if (!handled && (objResponse.Message || objResponse.message)) {
          const msg = String(objResponse.Message || objResponse.message);
          const lowerMsg = msg.toLowerCase();
          if (
            lowerMsg.includes("email") &&
            (lowerMsg.includes("taken") ||
              lowerMsg.includes("exist") ||
              lowerMsg.includes("duplicate"))
          ) {
            form.setError("email", {
              type: "server",
              message:
                "This email address is already registered. Try signing in instead.",
            });
            handled = true;
          } else {
            toast.error(msg);
            handled = true;
          }
        }
      } else if (typeof serverResponse === "string") {
        const lowerMsg = serverResponse.toLowerCase();
        if (
          lowerMsg.includes("email") &&
          (lowerMsg.includes("taken") ||
            lowerMsg.includes("exist") ||
            lowerMsg.includes("duplicate"))
        ) {
          form.setError("email", {
            type: "server",
            message:
              "This email address is already registered. Try signing in instead.",
          });
          handled = true;
        } else {
          toast.error(serverResponse);
          handled = true;
        }
      }

      if (!handled && err?.response?.status === 400) {
        toast.error("Registration failed. Please check the form and try again.");
      } else if (!handled) {
        toast.error(
          "Registration failed. Please review your information and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const strengthColors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-emerald-500",
  ];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div
      className="min-h-screen bg-stone-50 flex font-sans antialiased"
      dir="ltr"
    >
      {/* ── Left — Branding Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-stone-900 flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl"
          aria-hidden="true"
        />

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
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
              Premium Nutrition
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="h-px w-12 bg-emerald-600" aria-hidden="true" />
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Start your
            <br />
            <span className="text-emerald-400">wellness journey.</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Create your free account and unlock personalized supplement
            recommendations tailored to your goals.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Personalized supplement plans",
              "BMI & progress tracking",
              "Flash deals and member discounts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-xs text-stone-300 font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-stone-600">
          © {new Date().getFullYear()} PeakSupps
        </p>
      </div>

      {/* ── Right — Form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7 animate-fade-up">
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

          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Create account
            </h1>
            <p className="text-stone-500 text-sm mt-1.5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(handleRegisterSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wide"
              >
                Name
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  error={!!form.formState.errors.name}
                  required
                  autoComplete="name"
                  {...form.register("name", {
                    onChange: () => {
                      if (form.formState.errors.name?.type === "server") {
                        form.clearErrors("name");
                      }
                    },
                  })}
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1 animate-fade-up">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wide"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  error={!!form.formState.errors.email}
                  required
                  autoComplete="email"
                  {...form.register("email", {
                    onChange: () => {
                      if (form.formState.errors.email?.type === "server") {
                        form.clearErrors("email");
                      }
                    },
                  })}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1 animate-fade-up">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  error={!!form.formState.errors.password}
                  required
                  autoComplete="new-password"
                  {...form.register("password", {
                    onChange: () => {
                      if (form.formState.errors.password?.type === "server") {
                        form.clearErrors("password");
                      }
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1 animate-fade-up">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {form.formState.errors.password.message}
                </p>
              )}

              {/* Password strength */}
              {passwordValue && (
                <div className="space-y-2.5 mt-2">
                  {/* Strength bar */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex gap-1 flex-1"
                      role="progressbar"
                      aria-label={`Password strength: ${strengthLabel[passwordStrength]}`}
                      aria-valuenow={passwordStrength}
                      aria-valuemin={0}
                      aria-valuemax={4}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : "bg-stone-200",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-stone-500 w-12 text-right">
                      {strengthLabel[passwordStrength]}
                    </span>
                  </div>

                  {/* Rules */}
                  <div
                    className="grid grid-cols-2 gap-1.5"
                    role="list"
                    aria-label="Password requirements"
                  >
                    {[
                      { rule: passwordRules.length, label: "8+ characters" },
                      {
                        rule: passwordRules.hasLowerCase,
                        label: "Lowercase (a-z)",
                      },
                      {
                        rule: passwordRules.hasUpperCase,
                        label: "Uppercase (A-Z)",
                      },
                      { rule: passwordRules.hasNumber, label: "Number (0-9)" },
                      {
                        rule: passwordRules.hasSpecialChar,
                        label: "Special character",
                      },
                    ].map(({ rule, label }) => (
                      <div
                        key={label}
                        role="listitem"
                        className={cn(
                          "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                          rule
                            ? "text-emerald-600 font-semibold"
                            : "text-stone-400",
                        )}
                      >
                        {rule ? (
                          <Check
                            className="h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="h-3.5 w-3.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-stone-700 uppercase tracking-wide"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                  aria-hidden="true"
                />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10"
                  error={!!form.formState.errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  {...form.register("confirmPassword", {
                    onChange: () => {
                      if (
                        form.formState.errors.confirmPassword?.type ===
                        "server"
                      ) {
                        form.clearErrors("confirmPassword");
                      }
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-1 animate-fade-up">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full rounded-xl font-bold mt-3"
              aria-label="Create your account"
            >
              {!isSubmitting && (
                <>
                  Create Account{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-stone-400">
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-stone-600 transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-stone-600 transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
