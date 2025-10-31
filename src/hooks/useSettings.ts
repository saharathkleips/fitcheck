import { SettingsContext } from "@/contexts/SettingsContext";
import { useContext } from "react";

export const useSettings = () => useContext(SettingsContext);
