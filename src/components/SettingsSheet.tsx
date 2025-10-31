import { useSettings } from "@/hooks/useSettings";
import { X, Lock, CloudRain } from "lucide-react";

export function SettingsSheet(props: {isOpen: boolean, onClose: () => void}) {
  const { gptApiKey, weatherApiKey, setGptApiKey, setWeatherApiKey } = useSettings();

  const inputStyle =
    "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all text-sm";
  const cardStyle = "bg-gray-800 p-4 rounded-xl shadow-2xl space-y-3";
  return (
    <div       className={`fixed inset-0 z-50 transition-all duration-500 ${props.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={props.onClose}
      />

      <div
        className={`fixed top-0 right-0 w-full max-w-sm h-full bg-gray-900 shadow-2xl transition-transform duration-500 ease-out p-6 overflow-y-auto ${
          props.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            설정
          </h2>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-fuchsia-400 transition-colors p-2 rounded-full hover:bg-gray-800"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Gemini API Key Section */}
          <div className={cardStyle}>
            <div className="flex items-center text-fuchsia-400 mb-2">
              <Lock className="w-5 h-5 mr-2" />
              <h3 className="font-semibold text-lg">GPT 키</h3>
            </div>
            <input
              type="password"
              placeholder="GPT 키"
              className={inputStyle}
              value={gptApiKey}
              onChange={(e) => setGptApiKey(e.target.value)}
            />
          </div>

          {/* Weather API Key Section */}
          <div className={cardStyle}>
            <div className="flex items-center text-cyan-400 mb-2">
              <CloudRain className="w-5 h-5 mr-2" />
              <h3 className="font-semibold text-lg">날씨 키</h3>
            </div>
            <input
              type="password"
              placeholder="날씨 키"
              className={inputStyle}
              value={weatherApiKey}
              onChange={(e) => setWeatherApiKey(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
