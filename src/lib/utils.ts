import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null || isNaN(Number(amount))) return "EGP 0";
  const num = Number(amount);
  const isInteger = Math.abs(num - Math.round(num)) < 0.00001;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `EGP ${formatted}`;
}

// The backend base origin (without /api/v1 path) — used for resolving /uploads/ paths
const BACKEND_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1")
    .replace(/\/api\/v1\/?$/, "");

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "/logo.png";
  const trimmed = url.trim();
  if (!trimmed) return "/logo.png";

  // Already an absolute URL — return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Protocol-relative URL (e.g. //cdn.example.com/img.jpg)
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Backend-relative path (e.g. /uploads/avatar-xxx.jpg)
  // Must be served from the backend origin, NOT the Next.js origin
  if (trimmed.startsWith("/uploads/")) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }

  // Any other relative path — return as-is (public folder assets like /logo.png)
  return trimmed;
}

export function getCategoryImageUrl(categoryName?: string, index: number = 0): string {
  const nameLower = (categoryName || "").toLowerCase();
  if (nameLower.includes("whey") || nameLower.includes("protein")) {
    return "/wheyprotein.png";
  }
  if (nameLower.includes("creatine") || nameLower.includes("strength")) {
    return "/creatine.png";
  }
  if (nameLower.includes("pre") || nameLower.includes("workout") || nameLower.includes("energy") || nameLower.includes("endurance")) {
    return "/preworkout.png";
  }
  if (nameLower.includes("gain") || nameLower.includes("mass")) {
    return "/weightgainers.png";
  }
  if (nameLower.includes("vitamin") || nameLower.includes("mineral") || nameLower.includes("multi")) {
    return "/vitamins.png";
  }
  if (nameLower.includes("fat") || nameLower.includes("loss") || nameLower.includes("burn") || nameLower.includes("shred")) {
    return "/category-fl.png";
  }
  if (nameLower.includes("bcaa") || nameLower.includes("amino") || nameLower.includes("recover") || nameLower.includes("accessori") || nameLower.includes("health") || nameLower.includes("supplement")) {
    return "/BCAA.png";
  }

  const fallbackImages = [
    "/wheyprotein.png",
    "/creatine.png",
    "/preworkout.png",
    "/weightgainers.png",
    "/vitamins.png",
    "/category-fl.png",
    "/BCAA.png",
  ];
  return fallbackImages[Math.abs(index) % fallbackImages.length];
}

