import type { TodayWeather } from "@/hooks/useWeather";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function summarizeWeather(w: TodayWeather): string {
  return (
    `${w.city} | ${Math.round(w.temp)}°C (feels ${Math.round(
      w.feelsLike
    )}°C), ${w.description}, ` +
    `humidity ${w.humidity}%, wind ${w.windSpeed} m/s`
  );
}