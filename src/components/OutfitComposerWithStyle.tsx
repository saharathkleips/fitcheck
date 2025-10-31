import { useMemo, useState } from "react";
import { analyzeOutfits } from "../api/openai";
import { summarizeWeather } from "../lib/utils";
import { Sparkles } from "lucide-react";
import StreetIcon from "../../Icons/StreetIcon.png";
import FormalIcon from "../../Icons/FormalIcon.png";
import VintageIcon from "../../Icons/VintageIcon.png";
import SportyIcon from "../../Icons/SportyIcon.png";
import FeminineIcon from "../../Icons/FeminineIcon.png";
import DandyIcon from "../../Icons/DandyIcon.png";
import CasualIcon from "../../Icons/CasualIcon.png";

type Props = {
  selectedBlobs: Blob[];          // ✅ 왼쪽 선택 컴포넌트에서 주입
  weatherSummary?: string;        // 선택(이미 문자열이면 그대로 사용)
  apiKey?: string;                // OpenAI 키 (없으면 env 사용)
};

type StyleCard = { id: string; name: string; imageUrl?: string ; src?:string};
const STYLE_CARDS: StyleCard[] = [
  { id: "s-minimal", name: "미니멀",  imageUrl: "https://placehold.co/80x80/111/fff?text=MIN" },
  { id: "s-street",  name: "스트릿",  src:StreetIcon },
  { id: "s-formal",  name: "포멀",    src:FormalIcon },
  { id: "s-vintage", name: "빈티지",  src:VintageIcon },
  { id: "s-sporty",  name: "스포티",  src:SportyIcon },
  { id: "s-feminine",name: "페미닌",  src:FeminineIcon },
  { id: "s-dandy",   name: "댄디",    src:DandyIcon },
  { id: "s-casual",  name: "캐주얼",  src:CasualIcon },
];

export default function OutfitComposerWithStyle({
  selectedBlobs,
  weatherSummary,
  apiKey,
}: Props) {
  const [styleId, setStyleId] = useState<string>(STYLE_CARDS[0].id);
  const [prompt, setPrompt] = useState(
    "사진에 나온 옷들만 사용해서 오늘 날씨와 선택한 스타일에 어울리는 코디 1세트를 제안해줘. 새로운 아이템은 추가하지 말고 사진 속 옷 조합만 고려해."
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedStyle = useMemo(
    () => STYLE_CARDS.find((s) => s.id === styleId)?.name ?? STYLE_CARDS[0].name,
    [styleId]
  );

  async function handleOutfit() {
    if (!selectedBlobs?.length) {
      alert("왼쪽에서 이미지를 선택하세요.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResponse("분석 중입니다...");

      const fullPrompt = `
[Weather]
${weatherSummary || "날씨 정보 없음"}

[Style]
${selectedStyle}

[Instruction]
${prompt}
      `.trim();

      const text = await analyzeOutfits(selectedBlobs, fullPrompt, {
        apiKey,
        weatherSummary,
        maxImages: 6,
        detail: "auto",
      });

      setResponse(text);
    } catch (e: any) {
      setError(e?.message ?? "에러");
      setResponse("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">분위기</h2>

      {/* 스타일 카드 */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {STYLE_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => setStyleId(card.id)}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors border-2
              ${card.id === styleId
                ? "bg-fuchsia-800/40 border-fuchsia-500 text-white"
                : "bg-gray-700/50 hover:bg-gray-700 border-gray-700 text-gray-300"
              }`}
          >
            <img
              src={card.imageUrl ?? card.src}
              alt={card.name}
              className="w-10 h-10 object-cover rounded-md mr-3 shadow-md"
            />
            <span className="font-medium flex-1">{card.name}</span>
            {card.id === styleId && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">
                SELECTED
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 추가 지시 + 실행 버튼 */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <label className="block text-xs text-gray-400 mb-1">추가지시(옵션)</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예) 톤다운 느낌으로"
          className="w-full rounded-md px-3 py-2 bg-gray-900/70 border border-gray-700 text-gray-100"
        />
        <button
          onClick={handleOutfit}
          disabled={loading || !selectedBlobs?.length}
          className={`mt-3 w-full flex items-center justify-center p-3 rounded-lg font-bold transition
            ${loading || !selectedBlobs?.length
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-fuchsia-700 hover:bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50"
            }`}
          title={!selectedBlobs?.length ? "왼쪽에서 사진을 선택하세요" : "코디 생성"}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {loading ? "분석 중..." : "코디 생성"}
        </button>
      </div>

      {(response || error) && (
        <div className="mt-4">
          {error ? (
            <>
              <h3 className="font-semibold text-red-400 mb-1">에러</h3>
              <p className="text-red-300">{error}</p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-100 mb-1">결과</h3>
              <p className="text-gray-100" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {response}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
