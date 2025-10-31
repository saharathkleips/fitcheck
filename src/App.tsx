import { useState } from "react";
import Camera from "./Camera.tsx";
import { base64logo } from "./logo.ts";
import { ImageAnalyzer } from './ImageAnalyzer.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import PhotoVault from './PhotoVault.tsx';
import OutfitComposer from "./OutfitComposer";
import { SettingsProvider } from "./components/providers/SettingsProvider.tsx";
import { Settings } from "lucide-react";
import { SettingsSheet } from "./components/SettingsSheet.tsx";
import { CameraCapture } from "./components/CameraCapture.tsx";

function App() {
  const [weatherSummary, setWeatherSummary] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper functions for the sheet
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <>
      <SettingsProvider>
        <div className="min-h-screen bg-gray-900 text-white font-inter p-4 sm:p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 opacity-60 pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
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
              {/* Left Column: Video/Capture and Assessment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Camera Feed Component */}
                <CameraCapture />

                {/* AI Assessment Section */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
                  <h2 className="text-xl font-semibold text-fuchsia-400 mb-3">
                    AI Fit Assessment
                  </h2>
                  <div className="bg-gray-700/50 p-4 rounded-lg min-h-[150px] border border-gray-600">
                    <p className="text-gray-300">
                      Your assessment results will appear here after submission.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Placeholder: "Based on the clear skies and 72°F
                      temperature, your light jacket and jeans are an optimal
                      choice for today's casual outdoor event."
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Placeholder/Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-full">
                  <h2 className="text-xl font-semibold text-cyan-400 mb-3">
                    Today's Context
                  </h2>
                  <div className="space-y-3 text-gray-300">
                    <p>
                      <strong>Weather:</strong> Sunny, 72°F
                    </p>
                    <p>
                      <strong>Location:</strong> San Francisco, CA
                    </p>
                    <p>
                      <strong>User Prompt:</strong> Going out for a casual
                      lunch.
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                    <p>
                      Use the **Settings Icon** in the top right to manage your
                      API keys.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Settings Sheet Modal */}
          <SettingsSheet isOpen={isSettingsOpen} onClose={closeSettings} />


          <div className="card">
            <div className="flex flex-col items-center justify-center">
              <img className="max-h-100 max-w-100" src={base64logo} />

          <WeatherWidget fallbackCity="Seoul" onReady={setWeatherSummary} />

          <ImageAnalyzer extraPrompt={weatherSummary} />
              <Camera />
              <PhotoVault />

                        <WeatherWidget fallbackCity="Seoul" onReady={setWeatherSummary}/>
          <OutfitComposer weatherSummary={weatherSummary}/>
            </div>
          </div>
        </div>
      </SettingsProvider>
    </>
  );
}

export default App;
