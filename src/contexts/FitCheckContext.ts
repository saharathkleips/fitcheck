import { createContext } from "react";

interface FitCheckContextType {
  weather: string;
  setWeather: React.Dispatch<React.SetStateAction<string>>;
  clothing: string;
  setClothing: React.Dispatch<React.SetStateAction<string>>;
}

export const FitCheckContext = createContext<FitCheckContextType>({
  weather: "",
  setWeather: () => "",
  clothing: "",
  setClothing: () => "",
});
