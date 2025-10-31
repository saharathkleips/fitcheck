import { useState } from "react";
import { useFitCheck } from "@/hooks/useFitCheck";

type StyleCard = { id: string; name: string; imageUrl: string };
const STYLE_CARDS: StyleCard[] = [
  { id: "s-minimal", name: "미니멀",  imageUrl: "https://placehold.co/80x80/111/fff?text=MIN" },
  { id: "s-street",  name: "스트릿",  imageUrl: "https://placehold.co/80x80/222/fff?text=ST"  },
  { id: "s-formal",  name: "포멀",    imageUrl: "https://placehold.co/80x80/333/fff?text=FML" },
  { id: "s-vintage", name: "빈티지",  imageUrl: "https://placehold.co/80x80/884/fff?text=VTG" },
  { id: "s-sporty",  name: "스포티",  imageUrl: "https://placehold.co/80x80/0a7/fff?text=SPT" },
  { id: "s-feminine",name: "페미닌",  imageUrl: "https://placehold.co/80x80/e66/fff?text=FEM" },
  { id: "s-dandy",   name: "댄디",    imageUrl: "https://placehold.co/80x80/06c/fff?text=DND" },
  { id: "s-casual",  name: "캐주얼",  imageUrl: "https://placehold.co/80x80/555/fff?text=CSL" },
];

export function StyleSelector() {
  const { setStyle } = useFitCheck();

  const [styleId, setStyleId] = useState<string>(STYLE_CARDS[0].id);

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">분위기</h2>

      {/* 스타일 카드 */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {STYLE_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => {
              setStyleId(card.id);
              setStyle(card.name);
            }}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors border-2
              ${
                card.id === styleId
                  ? "bg-fuchsia-800/40 border-fuchsia-500 text-white"
                  : "bg-gray-700/50 hover:bg-gray-700 border-gray-700 text-gray-300"
              }`}
          >
            <img
              src={card.imageUrl}
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

    </div>
  );
}
