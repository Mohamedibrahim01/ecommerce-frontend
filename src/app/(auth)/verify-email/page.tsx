"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, Home, Sparkles, RefreshCw, Leaf } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const email = emailParam ? decodeURIComponent(emailParam) : null;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased" dir="ltr">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        aria-hidden="true"
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <Card className="w-full max-w-lg bg-white border border-stone-200 shadow-xl rounded-3xl overflow-hidden relative z-10 animate-fade-up">
        {/* Top gradient banner */}
        <div className="h-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />

        <CardContent className="p-8 md:p-10 text-center space-y-8">
          {/* Brand header */}
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
              SH<span className="text-emerald-600">Supplements</span>
            </span>
          </div>

          {/* Illustration / Icon */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-emerald-100/80 flex items-center justify-center shadow-inner">
              <Mail className="h-11 w-11 text-emerald-600 animate-bounce-subtle" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-md">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          {/* Title & Status */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Next Step: Verify Email
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              Check Your Inbox
            </h1>
            <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              We need to confirm your email address before you can sign in and access your personalized nutrition plan.
            </p>
          </div>

          {/* Checklist Box */}
          <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-5 text-left space-y-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-stone-800">
                Registration completed successfully
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-stone-600">
                We&apos;ve sent a verification email to{" "}
                {email ? (
                  <span className="font-bold text-stone-900 underline decoration-emerald-500 decoration-2 underline-offset-2">
                    {email}
                  </span>
                ) : (
                  <span className="font-bold text-stone-900">your email address</span>
                )}.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-stone-600">
                Please open your inbox and click the verification link before signing in.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/login">
                  Go to Login <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-xl font-bold border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-1.5 text-stone-400" aria-hidden="true" /> Back to Home
                </Link>
              </Button>
            </div>

            {/* Resend Helper */}
            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                Didn&apos;t receive the email?{" "}
                <Link
                  href="/resend-confirm-email"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 hover:underline ml-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Resend confirmation link
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
