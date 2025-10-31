import type { TodayWeather } from "@/hooks/useWeather";
import { createContext } from "react";

interface FitCheckContextType {
  weather: TodayWeather | null;
  setWeather: React.Dispatch<React.SetStateAction<TodayWeather | null>>;
  clothing: string | null;
  setClothing: React.Dispatch<React.SetStateAction<string | null>>;
  prompt: string;
}

export const FitCheckContext = createContext<FitCheckContextType>({
  weather: null,
  setWeather: () => "",
  clothing: "",
  setClothing: () => "",
  prompt: "이 이미지의 내용을 설명해줘",
});
