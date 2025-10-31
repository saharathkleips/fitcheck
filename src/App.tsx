import { useState } from "react";
import Camera from "./Camera.tsx";
import PhotoVault from './PhotoVault.tsx';
import { SettingsProvider } from "./components/providers/SettingsProvider.tsx";
import { Settings } from "lucide-react";
import { SettingsSheet } from "./components/SettingsSheet.tsx";
import { CameraCapture } from "./components/CameraCapture.tsx";
import { WeatherSummary } from "./components/WeatherSummary.tsx";
import OutfitComposerWithStyle from "./components/OutfitComposerWithStyle.tsx";
import { AssessmentSummary } from "./components/AssessmentSummary.tsx";
import { AssessmentProvider } from "./components/providers/AssessmentProvider.tsx";
import { FitCheckProvider } from "./components/providers/FitCheckProvider.tsx";
import PhotoSelector from "./components/PhotoSelector.tsx";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ✅ 사진 선택 결과(Blob[])와 날씨 요약 문자열 상태
  const [selectedBlobs, setSelectedBlobs] = useState<Blob[]>([]);
  const [weatherSummary, setWeatherSummary] = useState<string>("");

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <>
      <SettingsProvider>
        <AssessmentProvider>
          <FitCheckProvider>
            <div className="min-h-screen bg-gray-900 text-white font-inter p-4 sm:p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 opacity-60 pointer-events-none" />
              <div className="max-w-8xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-10">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-transparent bg-clip-text drop-shadow-xl">
                    FitCheck AI
                  </h1>
                  <button
                    onClick={openSettings}
                    className="p-3 text-gray-300 hover:text-cyan-400 transition-colors duration-200 rounded-full hover:bg-gray-800/50"
                    aria-label="Open settings"
                  >
                    <Settings className="w-7 h-7" />
                  </button>
                </header>

                {/* Main Content Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Camera / Assessment / Photo Selector */}
                  <div className="lg:col-span-2 space-y-6">
                    <CameraCapture />
                    <AssessmentSummary />

                    {/* ✅ 사진 업로드 & 선택 (여기서 선택된 Blob[]을 상태로 보관) */}
                    <PhotoSelector
                      title="Your Wardrobe Photos"
                      onChange={setSelectedBlobs}
                    />
                  </div>

                  {/* Right Column: Weather + Style & Outfit Compose */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* ✅ 날씨 요약을 상위로 올려 OutfitComposer에 전달 */}
                    <WeatherSummary
                      // 지원 시: 요약 문자열 콜백
                      onReady={(summary: string) => setWeatherSummary(summary)}
                      // 필요하다면 fallbackCity 같은 prop도 함께 전달 가능
                    />

                    {/* ✅ 선택된 이미지 & 날씨를 사용해 코디 생성 */}
                    <OutfitComposerWithStyle
                      selectedBlobs={selectedBlobs}
                      weatherSummary={weatherSummary}
                      // apiKey={...}  // 필요 시 주입, 없으면 openai.ts의 env 사용
                    />
                  </div>
                </main>
              </div>

              {/* Settings Sheet Modal */}
              <SettingsSheet isOpen={isSettingsOpen} onClose={closeSettings} />

              {/* 기존 데모 섹션(필요 없으면 제거 가능) */}
              <div className="card">
                <div className="flex flex-col items-center justify-center">
                  <Camera />
                  <PhotoVault />
                </div>
              </div>
            </div>
          </FitCheckProvider>
        </AssessmentProvider>
      </SettingsProvider>
    </>
  );
}

export default App;
