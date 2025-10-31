
import Camera from './Camera.tsx'
import { useEffect, useState } from 'react';
import { analyzeImage } from './api/openai'
import "./App.css";
import { Button } from "./components/ui/button.tsx";
import { Input } from "./components/ui/input.tsx";
import { base64logo } from "./logo.ts";
/* ===== 날씨 위젯: 함수(컴포넌트)로 분리 ===== */
function WeatherWidget({ fallbackCity = "Seoul" }: { fallbackCity?: string }) {
  const [data, setData] = useState<TodayWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        // 1) 브라우저 위치 권한 시도 (실패/거부 시 도시명으로 조회)
        const getByGeo = () =>
          new Promise<TodayWeather>((resolve, reject) => {
            if (!("geolocation" in navigator)) return reject(new Error("no geolocation"));
            const tid = setTimeout(() => reject(new Error("geolocation timeout")), 5000);
            navigator.geolocation.getCurrentPosition(
              async pos => {
                clearTimeout(tid);
                resolve(await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude));
              },
              err => {
                clearTimeout(tid);
                reject(err);
              },
              { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 }
            );
          });

        let w: TodayWeather;
        try {
          w = await getByGeo();
        } catch {
          w = await fetchWeatherByCity(fallbackCity);
        }

        if (!cancelled) {
          setData(w);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "날씨를 불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fallbackCity]);

  if (loading) return <div style={{ marginTop: 24 }}><h2>오늘의 날씨</h2><p>불러오는 중…</p></div>;
  if (error)   return <div style={{ marginTop: 24, color: "crimson" }}><h2>오늘의 날씨</h2><p>에러: {error}</p></div>;
  if (!data)   return null;

  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

  return (
    <div style={{ marginTop: 24 }}>
      <h2>오늘의 날씨</h2>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", border: "1px solid #eee", borderRadius: 12
      }}>
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

// ✅ 이미지 분석 기능을 별도 함수(컴포넌트)로 분리
function ImageAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('이 이미지의 내용을 설명해줘.')
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 미리보기 URL 관리
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResponse('')
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      alert('이미지를 선택해주세요.')
      return
    }
    try {
      setLoading(true)
      setError(null)
      setResponse('분석 중입니다...')
      // analyzeImage 내부 프롬프트를 덮어쓰고 싶다면, analyzeImage에 prompt 인자 추가해도 됨
      const result = await analyzeImage(file) // 기본 프롬프트 사용
      // const result = await analyzeImage(file, prompt) // <- 이런 식으로 확장 가능
      setResponse(result)
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setError(err?.message ?? '알 수 없는 에러가 발생했습니다.')
      setResponse('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="image-section" style={{ marginTop: '2rem' }}>
      <h2>이미지 분석하기</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleAnalyze} disabled={loading || !file}>
          {loading ? '분석 중...' : '분석 시작'}
        </button>
      </div>

      {/* 선택사항: 사용자 프롬프트 */}
      <div style={{ marginTop: 10 }}>
        <label style={{ display: 'block', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
          추가 지시(옵션)
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예) 이 옷의 스타일을 분석하고 코디 팁을 줘"
          style={{ width: '100%', maxWidth: 520, padding: '8px 10px' }}
        />
      </div>

      {/* 미리보기 */}
      {preview && (
        <div style={{ marginTop: 12 }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: 240, height: 'auto', borderRadius: 8, border: '1px solid #eee' }}
          />
        </div>
      )}

      {/* 결과/에러 */}
      {(response || error) && (
        <div className="result" style={{ marginTop: '1rem' }}>
          {error ? (
            <>
              <h3>에러</h3>
              <p style={{ color: 'crimson' }}>{error}</p>
            </>
          ) : (
            <>
              <h3>결과</h3>
              <p>{response}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function submit(image: string) {
  console.log(image);
}

function captureImage(): string {
  return "base64..."
}

function App() {
  return (
    <>
      <h1>fitcheck</h1>
      <Input
        placeholder="API Key"
        className="flex items-center justify-center"
      />
      <div className="card">
        <div className="flex flex-col items-center justify-center">
          <img className="max-h-100 max-w-100" src={base64logo} />

          <WeatherWidget fallbackCity="Seoul" />
          <ImageAnalyzer />
          <Camera/>
          <Button onClick={() => captureImage}>
            Capture Image
          </Button>
          
          <Button
            type="submit"
            variant="outline"
            onClick={() => submit(base64logo)}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

export default App;
