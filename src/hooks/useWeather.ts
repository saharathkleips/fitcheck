// src/hooks/useWeather.ts or src/utils/useWeather.ts

import { useState, useEffect } from "react";

export type TodayWeather = {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

function buildUrl(
  params: Record<string, string | number>,
  APPID: string
): string {
  const q = new URLSearchParams({
    appid: APPID,
    units: "metric", // 섭씨 (Celsius)
    lang: "kr", // 한국어 설명 (Korean description)
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });
  return `${API_BASE}?${q.toString()}`;
}

function mapResponse(json: any): TodayWeather {
  return {
    city: json.name,
    temp: json.main?.temp,
    feelsLike: json.main?.feels_like,
    description: json.weather?.[0]?.description ?? "",
    icon: json.weather?.[0]?.icon ?? "01d",
    humidity: json.main?.humidity,
    windSpeed: json.wind?.speed,
  };
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  APPID: string
): Promise<TodayWeather> {
  const res = await fetch(buildUrl({ lat, lon }, APPID));
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return mapResponse(json);
}

export async function fetchWeatherByCity(
  city: string,
  APPID: string
): Promise<TodayWeather> {
  const res = await fetch(buildUrl({ q: city }, APPID));
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return mapResponse(json);
}

type UseWeatherResult = {
  weather: TodayWeather | null;
  isLoading: boolean;
  error: string | null;
};

export function useWeather(apiKey: string, city: string = "Seoul"): UseWeatherResult {
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWeatherByCity(city, apiKey); 
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setWeather(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeather(); 
    
  }, [apiKey, city]);

  return {
    weather,
    isLoading,
    error,
  };
}
