import { AssessmentContext } from "@/contexts/AssessmentContext";
import { useState } from "react";

export function AssessmentProvider(props: {children: React.ReactNode}) {
  const [assessment, setAssessment] = useState('');

  const contextValue = {
    assessment,
    setAssessment,
  };

  return (
    <AssessmentContext.Provider value={contextValue}>
      {props.children}
    </AssessmentContext.Provider>
  );
};