import { createContext } from "react";

interface SettingsContextType {
  gptApiKey: string;
  weatherApiKey: string;
  setGptApiKey: React.Dispatch<React.SetStateAction<string>>;
  setWeatherApiKey: React.Dispatch<React.SetStateAction<string>>;
}

export const SettingsContext = createContext<SettingsContextType>({
  gptApiKey: "",
  weatherApiKey: "",
  setGptApiKey: () => "",
  setWeatherApiKey: () => "",
});
