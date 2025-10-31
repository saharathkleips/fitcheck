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

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper functions for the sheet
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
              {/* Left Column: Video/Capture and Assessment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Camera Feed Component */}
                <CameraCapture />

                {/* AI Assessment Section */}
                <AssessmentSummary/>
              </div>

              {/* Right Column: Placeholder/Info */}
              <div className="lg:col-span-1 space-y-6">
                <WeatherSummary/>
              </div>
            </main>
          </div>

          {/* Settings Sheet Modal */}
          <SettingsSheet isOpen={isSettingsOpen} onClose={closeSettings} />


          <div className="card">
            <div className="flex flex-col items-center justify-center">

              <Camera />
              <PhotoVault />
          {/* <OutfitComposer/> --> OutfitComposerWithStyle  */}
          <OutfitComposerWithStyle />
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
