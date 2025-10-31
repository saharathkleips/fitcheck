import { createContext } from "react";

interface AssessmentContextType {
  assessment: string;
  setAssessment: React.Dispatch<React.SetStateAction<string>>;
}

export const AssessmentContext = createContext<AssessmentContextType>({
  assessment: "",
  setAssessment: () => "",
});
