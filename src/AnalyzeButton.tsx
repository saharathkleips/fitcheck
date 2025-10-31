import { useState } from "react";
import { analyzeImage } from "./api/openai";
import { useSettings } from "./hooks/useSettings";
import { useWeather } from "./hooks/useWeather";
import { summarizeWeather } from "./lib/utils";
import { useAssessment } from "./hooks/useAssessment";
import { Send } from "lucide-react";
import { useFitCheck } from "./hooks/useFitCheck";

export function AnalyzeButton() {
  const { gptApiKey, weatherApiKey } = useSettings();
  const { weather } = useWeather(weatherApiKey);
  const { setAssessment } = useAssessment();
  const { clothing, prompt } = useFitCheck();

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!clothing) {
      console.error("No file");
      return;
    }

    setAssessment("");

    try {
      setLoading(true);

      const finalPrompt = [
        weather ? `[Weather]\n${summarizeWeather(weather)}` : "",
        prompt,
      ]
        .filter(Boolean)
        .join("\n\n");

      const result = await analyzeImage(gptApiKey, clothing, finalPrompt);

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
      disabled={loading || !clothing}
      className="flex-1 flex items-center justify-center p-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-cyan-900/50 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
    >
      <Send className="w-5 h-5 mr-2" />
      {loading ? "분석 중..." : "Fit Check"}
    </button>
  );
}
