import { useSettings } from "@/hooks/useSettings";
import { useWeather } from "@/hooks/useWeather";
import { CloudRain, Droplet, Sun, Wind } from "lucide-react";

export function WeatherSummary() {
  const { weatherApiKey } = useSettings();
  const { weather } = useWeather(weatherApiKey);

  const WeatherIcon =
    weather?.description.toLowerCase().includes("rain") ||
    weather?.description.toLowerCase().includes("cloud")
      ? CloudRain
      : Sun;

  return (
    <>
      {weather && (
        <div className="bg-gray-900 p-4 rounded-xl shadow-inner border border-gray-700">
          <h3 className="text-lg font-medium text-gray-200 mb-2 flex items-center">
            <WeatherIcon className="w-5 h-5 mr-2 text-cyan-400" />
            {weather?.city}
          </h3>

          <div className="flex justify-between items-start mb-3">
            {/* Main Temp and Description */}
            <div className="flex items-center">
              <span className="text-6xl font-extrabold text-white">
                {Math.round(weather.temp)}°
              </span>
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-100">
                  {weather.description}
                </p>
                <p className="text-sm text-gray-400">
                  Feels like {Math.round(weather.feelsLike)}°
                </p>
              </div>
            </div>
            {/* Visual Icon */}
            <WeatherIcon className="w-12 h-12 text-yellow-300 opacity-80" />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 pt-3 border-t border-gray-800">
            <div className="flex items-center">
              <Droplet className="w-4 h-4 mr-2 text-fuchsia-400" />
              <span className="font-medium">Humidity:</span>
              <span className="ml-1 text-white">{weather.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind className="w-4 h-4 mr-2 text-fuchsia-400" />
              <span className="font-medium">Wind:</span>
              <span className="ml-1 text-white">{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
