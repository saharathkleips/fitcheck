import { FitCheckContext } from "@/contexts/FitCheckContext";
import type { TodayWeather } from "@/hooks/useWeather";
import { useState } from "react";

export function FitCheckProvider(props: {children: React.ReactNode}) {
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [wardrobe, setWardrobe] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('사진에 나온 옷들만 사용해서 오늘 날씨와 선택한 스타일에 어울리는 코디 1세트를 제안해줘. 새로운 아이템은 추가하지 말고 사진 속 옷 조합만 고려해.');

  const contextValue = {
    weather,
    setWeather,
    picture,
    setPicture,
    style,
    setStyle,
    wardrobe,
    setWardrobe,
    prompt,
    setPrompt
  };

  return (
    <FitCheckContext.Provider value={contextValue}>
      {props.children}
    </FitCheckContext.Provider>
  );
};