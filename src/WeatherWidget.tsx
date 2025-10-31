import { useEffect, useState } from "react";
import { fetchWeatherByCoords, fetchWeatherByCity, type TodayWeather, summarizeWeather } from "./api/weather";

export function WeatherWidget({
  fallbackCity = "Seoul",
  onReady, // (summary: string) => void
}: {
  fallbackCity?: string;
  onReady?: (summary: string) => void;
}) {
  const [data, setData] = useState<TodayWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 0) API 키 확인 (없으면 즉시 에러)
      const APPID = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!APPID) {
        setLoading(false);
        setError("환경변수 VITE_OPENWEATHER_API_KEY가 비어 있습니다. .env에 추가 후 dev 서버를 재시작하세요.");
        console.error("[Weather] Missing API Key: VITE_OPENWEATHER_API_KEY");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) geolocation을 3초만 시도
        const geoPromise = new Promise<TodayWeather>((resolve, reject) => {
          if (!("geolocation" in navigator)) return reject(new Error("Geolocation not supported"));
          const timer = setTimeout(() => reject(new Error("Geolocation timeout")), 3000);
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              clearTimeout(timer);
              try {
                const w = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                resolve(w);
              } catch (e) {
                reject(e as Error);
              }
            },
            (err) => {
              clearTimeout(timer);
              reject(err);
            },
            { enableHighAccuracy: false, timeout: 3000, maximumAge: 60_000 }
          );
        });

        // 2) 실패 시 바로 도시명으로 폴백
        let weather: TodayWeather;
        try {
          weather = await geoPromise;
        } catch (e) {
          console.warn("[Weather] Geolocation failed -> fallback to city:", e);
          weather = await fetchWeatherByCity(fallbackCity);
        }

        if (!cancelled) {
          setData(weather);
          const summary = summarizeWeather(weather);
          onReady?.(summary);
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = typeof e === "string" ? e : e?.message ?? "알 수 없는 오류";
          setError(msg);
          console.error("[Weather] API error:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fallbackCity]);

  if (loading) return (
    <div style={{ marginTop: 24 }}>
      <h2>오늘의 날씨</h2>
      <p>불러오는 중…</p>
    </div>
  );

  if (error) return (
    <div style={{ marginTop: 24, color: "crimson" }}>
      <h2>오늘의 날씨</h2>
      <p>에러: {error}</p>
      <p style={{ fontSize: 12, opacity: .8 }}>
        콘솔(DevTools) 네트워크 탭에서 <code>/data/2.5/weather</code> 요청의 상태/응답을 확인하세요.
      </p>
    </div>
  );

  if (!data) return null;

  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
  return (
    <div style={{ marginTop: 24 }}>
      <h2>오늘의 날씨</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid #eee", borderRadius: 12 }}>
        <img src={iconUrl} alt={data.description} width={64} height={64} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{data.city}</div>
          <div style={{ fontSize: 28 }}>{Math.round(data.temp)}°C <span style={{ fontSize: 14, opacity: .7 }}>체감 {Math.round(data.feelsLike)}°C</span></div>
          <div style={{ opacity: .85 }}>{data.description}</div>
          <div style={{ fontSize: 13, opacity: .7 }}>습도 {data.humidity}% · 바람 {data.windSpeed} m/s</div>
        </div>
      </div>
    </div>
  );
}
