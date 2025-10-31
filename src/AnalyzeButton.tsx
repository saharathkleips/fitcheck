import { useState } from "react";
import { analyzeImage } from "./api/openai";
import { useSettings } from "./hooks/useSettings";
import { useWeather } from "./hooks/useWeather";
import { summarizeWeather } from "./lib/utils";
import { useAssessment } from "./hooks/useAssessment";
import { Send } from "lucide-react";

// The necessary props are now passed from the parent/context
interface AnalyzeButtonProps {
  file: string | null;
  prompt: string;
}

export function AnalyzeButton({
  file,
  prompt,
}: AnalyzeButtonProps) {
  const { gptApiKey, weatherApiKey } = useSettings();
  const { weather } = useWeather(weatherApiKey);
  const { setAssessment } = useAssessment();

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) {
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

      const result = await analyzeImage(gptApiKey, file, finalPrompt);

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
      disabled={loading || !file}
      className="flex-1 flex items-center justify-center p-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-cyan-900/50 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
    >
      <Send className="w-5 h-5 mr-2" />
      {loading ? "분석 중..." : "Fit Check"}
    </button>
  );
}
