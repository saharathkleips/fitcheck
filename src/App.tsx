import { useState } from "react";
import Camera from "./Camera.tsx";
import "./App.css";
import { Button } from "./components/ui/button.tsx";
import { Input } from "./components/ui/input.tsx";
import { base64logo } from "./logo.ts";
import { ImageAnalyzer } from "./ImageAnalyzer.tsx";
import { WeatherWidget } from "./WeatherWidget.tsx";

function submit(image: string) {
  console.log("submit:", image);
}

function captureImage(): string {
  // TODO: Camera 컴포넌트에서 실제 캡처 결과를 받아 반환하도록 연결
  return "base64...";
}

function App() {
  // ✅ 날씨 요약을 ImageAnalyzer 프롬프트에 붙이기 위한 상태
  const [weatherSummary, setWeatherSummary] = useState<string>("");

  // ✅ 사용자가 입력하는 API 키(선택). 없으면 env의 키를 사용하도록 ImageAnalyzer에서 처리
  const [apiKey, setApiKey] = useState<string>("");

  return (
    <>
      <h1>fitcheck</h1>

      {/* 선택: 브라우저에서 테스트용으로 API 키를 직접 입력 */}
      <Input
        placeholder="OpenAI API Key (optional)"
        className="flex items-center justify-center"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />

      <div className="card">
        <div className="flex flex-col items-center justify-center">
          <img className="max-h-100 max-w-100" src={base64logo} />

          {/* ✅ 날씨 위젯: 날씨 로딩이 끝나면 한 줄 요약을 App 상태에 저장 */}
          <WeatherWidget fallbackCity="Seoul" onReady={setWeatherSummary} />

          {/* ✅ 이미지 분석: 날씨 요약을 프롬프트에 자동 포함, API 키도 옵션 전달 */}
          <ImageAnalyzer extraPrompt={weatherSummary} apiKey={apiKey} />

          <Camera />

          {/* ❗버그 수정: onClick에서 함수 “호출” 필요 */}
          <Button onClick={() => submit(captureImage())}>
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
