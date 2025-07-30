import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uuid = () => crypto.randomUUID();

export const safeJsonParse = (p: unknown) => {
  try {
    return { success: true, data: JSON.parse(p as string) } as const;
  } catch (e) {
    return { success: false, error: "invalid json" } as const;
  }
};

export const delay = async (x: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), x);
  });
};
