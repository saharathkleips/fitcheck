import { AssessmentContext } from "@/contexts/AssessmentContext";
import { useContext } from "react";

export const useAssessment = () => useContext(AssessmentContext);
