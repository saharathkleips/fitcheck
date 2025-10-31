import type { TodayWeather } from "@/hooks/useWeather";
import { createContext } from "react";

interface FitCheckContextType {
  weather: TodayWeather | null;
  setWeather: React.Dispatch<React.SetStateAction<TodayWeather | null>>;
  picture: string | null;
  setPicture: React.Dispatch<React.SetStateAction<string | null>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  style: string | null;
  setStyle: React.Dispatch<React.SetStateAction<string | null>>;
  wardrobe: string[];
  setWardrobe: React.Dispatch<React.SetStateAction<string[]>>;
}

export const FitCheckContext = createContext<FitCheckContextType>({
  weather: null,
  setWeather: () => "",
  picture: "",
  setPicture: () => "",
  prompt: "",
  setPrompt: () => "",
  style: "",
  setStyle: () => "",
  wardrobe: [],
  setWardrobe: () => "",
});
