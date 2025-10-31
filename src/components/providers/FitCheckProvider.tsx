import { FitCheckContext } from "@/contexts/FitCheckContext";
import { useState } from "react";

export function FitCheckProvider(props: {children: React.ReactNode}) {
  const [weather, setWeather] = useState('');
  const [clothing, setClothing] = useState('');

  const contextValue = {
    weather,
    setWeather,
    clothing,
    setClothing,
  };

  return (
    <FitCheckContext.Provider value={contextValue}>
      {props.children}
    </FitCheckContext.Provider>
  );
};