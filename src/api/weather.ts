// src/api/weather.ts
export type TodayWeather = {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;       // e.g., "10d"
  humidity: number;
  windSpeed: number;
};

const API_BASE = "https://api.openweathermap.org/data/2.5/weather";
const APPID = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

function buildUrl(params: Record<string, string | number>) {
  const q = new URLSearchParams({
    appid: APPID,
    units: "metric", // 섭씨
    lang: "kr",      // 한국어 설명
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
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

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<TodayWeather> {
  const res = await fetch(buildUrl({ lat, lon }));
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return mapResponse(json);
}

export async function fetchWeatherByCity(city: string): Promise<TodayWeather> {
  const res = await fetch(buildUrl({ q: city }));
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return mapResponse(json);
}
