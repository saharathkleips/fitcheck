import { useAssessment } from "@/hooks/useAssessment";

export function AssessmentSummary() {
  const {assessment} = useAssessment()

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-fuchsia-400 mb-3">오늘의 옷</h2>
      <div className="bg-gray-700/50 p-4 rounded-lg min-h-[150px] border border-gray-600">
        <p className="text-gray-300">
          {assessment}
        </p>
      </div>
    </div>
  );
}
