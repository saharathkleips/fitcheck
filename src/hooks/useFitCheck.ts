import { FitCheckContext } from "@/contexts/FitCheckContext";
import { useContext } from "react";

export const useSettings = () => useContext(FitCheckContext);
