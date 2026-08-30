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

export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
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

