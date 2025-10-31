import { useFitCheck } from "@/hooks/useFitCheck";

export function Prompt() {
  const { prompt, setPrompt } = useFitCheck();

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col">

      <h2 className="text-xl font-semibold text-cyan-400 mb-4">Prompt</h2>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예) 톤다운 느낌으로"
          className="w-full rounded-md px-3 py-2 bg-gray-900/70 border border-gray-700 text-gray-100"
        />

      </div>
  )
}