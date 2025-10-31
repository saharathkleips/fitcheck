import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { useAssessment } from "../hooks/useAssessment";
import { Sparkles } from "lucide-react";
import { useFitCheck } from "../hooks/useFitCheck";
import { analyzeOutfits } from "../api/openai";

export function AnalyzeWardrobeButton() {
  const { gptApiKey } = useSettings();
  const { weather, prompt, style, wardrobe } = useFitCheck();
  const { setAssessment } = useAssessment();

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setAssessment("");

    try {
      setLoading(true);

      const result = await analyzeOutfits(gptApiKey, weather, prompt, style, wardrobe);

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
      disabled={loading || wardrobe.length === 0 }
      className={`mt-3 w-full flex items-center justify-center p-3 rounded-lg font-bold transition
            ${loading || wardrobe.length === 0
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-fuchsia-700 hover:bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50"
            }`}
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {loading ? "분석 중..." : "코디 생성"}
    </button>
  );
}
