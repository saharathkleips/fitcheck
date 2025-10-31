import { SettingsContext } from "@/contexts/SettingsContext";
import { useState } from "react";

export function SettingsProvider(props: {children: React.ReactNode}) {
  const [gptApiKey, setGptApiKey] = useState('');
  const [weatherApiKey, setWeatherApiKey] = useState('');

  const contextValue = {
    gptApiKey,
    weatherApiKey,
    setGptApiKey,
    setWeatherApiKey,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {props.children}
    </SettingsContext.Provider>
  );
};
