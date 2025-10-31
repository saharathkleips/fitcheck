import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { useAssessment } from "../hooks/useAssessment";
import { Sparkles } from "lucide-react";
import { useFitCheck } from "../hooks/useFitCheck";
import { analyzeImage } from "../api/openai";

export function AnalyzeOutfitButton() {
  const { gptApiKey } = useSettings();
  const { picture, weather } = useFitCheck();
  const { setAssessment } = useAssessment();

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setAssessment("");

    try {
      setLoading(true);

      if (!picture) return

      const result = await analyzeImage(gptApiKey, picture, weather);

      setAssessment(result);
    } catch (err) {
      // eslint-disable-next-line
      setAssessment((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading || !picture}
      className="flex-1 flex items-center justify-center p-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-cyan-900/50 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {loading ? "분석 중..." : "Fit Check"}
    </button>
  );
}
