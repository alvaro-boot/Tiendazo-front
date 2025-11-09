import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { currency } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  const numericValue = Number(value) || 0;
  return currency.format(numericValue);
}
