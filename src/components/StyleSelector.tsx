import { useState } from "react";
import { useFitCheck } from "@/hooks/useFitCheck";
import StreetIcon from "../../Icons/StreetIcon.png";
import FormalIcon from "../../Icons/FormalIcon.png";
import VintageIcon from "../../Icons/VintageIcon.png";
import SportyIcon from "../../Icons/SportyIcon.png";
import FeminineIcon from "../../Icons/FeminineIcon.png";
import DandyIcon from "../../Icons/DandyIcon.png";
import CasualIcon from "../../Icons/CasualIcon.png";


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

    </div>
  );
}
