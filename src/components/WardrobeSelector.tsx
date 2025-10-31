  import React, { useMemo, useRef, useState } from "react";
  import { Upload, Shirt } from "lucide-react";

  /** 외부에서 날씨 요약 문자열을 넘겨줄 수 있게 선택형 prop */
  export type WardrobeSelectorProps = {
    weatherSummary?: string;               // 예: "Seoul | 17°C, 맑음, wind 2.1 m/s"
    onStyleChange?: (style: string) => void;
  };

  type WardrobeItem = {
    id: string;
    name: string;          // 미니멀/스트릿/포멀 …
    imageUrl: string;      // 썸네일 (아이콘 대용)
    selected: boolean;
  };

  const STYLE_PRESETS: WardrobeItem[] = [
    { id: "style-1", name: "미니멀",  imageUrl: "https://placehold.co/80x80/111/fff?text=MIN", selected: true },
    { id: "style-2", name: "스트릿",  imageUrl: "https://placehold.co/80x80/222/fff?text=ST",  selected: false },
    { id: "style-3", name: "포멀",    imageUrl: "https://placehold.co/80x80/333/fff?text=FML", selected: false },
    { id: "style-4", name: "빈티지",  imageUrl: "https://placehold.co/80x80/884/fff?text=VTG", selected: false },
    { id: "style-5", name: "스포티",  imageUrl: "https://placehold.co/80x80/0a7/fff?text=SPT", selected: false },
    { id: "style-6", name: "페미닌",  imageUrl: "https://placehold.co/80x80/e66/fff?text=FEM", selected: false },
    { id: "style-7", name: "댄디",    imageUrl: "https://placehold.co/80x80/06c/fff?text=DND", selected: false },
    { id: "style-8", name: "캐주얼",  imageUrl: "https://placehold.co/80x80/555/fff?text=CSL", selected: false },
  ];

  export default function WardrobeSelector({
    weatherSummary,
    onStyleChange,
  }: WardrobeSelectorProps) {
    const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(STYLE_PRESETS);
    const [selectedId, setSelectedId] = useState<string>(STYLE_PRESETS[0].id);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const current = useMemo(
      () => wardrobe.find(w => w.id === selectedId) ?? wardrobe[0],
      [wardrobe, selectedId]
    );

    function handleSelect(id: string) {
      setSelectedId(id);
      setWardrobe(prev => prev.map(it => ({ ...it, selected: it.id === id })));
      const picked = wardrobe.find(it => it.id === id);
      if (picked && onStyleChange) onStyleChange(picked.name);
    }

    // 선택: 커스텀 썸네일/라벨 업로드(스타일 추가 용도)
    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const item: WardrobeItem = {
        id: `style-${Date.now()}`,
        name: baseName || "커스텀 스타일",
        imageUrl: url,
        selected: false,
      };
      setWardrobe(prev => [...prev, item]);
      setSelectedId(item.id);
      if (onStyleChange) onStyleChange(item.name);
      e.currentTarget.value = ""; // 같은 파일 재업로드 가능
    }

    return (
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-full flex flex-col">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
          <Shirt className="w-5 h-5 mr-2" /> Select Context Item
        </h2>

        {/* 날씨 표시 (선택) */}
        {weatherSummary && (
          <div className="mb-4 pb-4 border-b border-gray-700 text-sm text-gray-300">
            <span className="block text-gray-400 mb-1">Weather</span>
            <span className="inline-block px-2 py-1 rounded bg-gray-900/60 border border-gray-700">
              {weatherSummary}
            </span>
          </div>
        )}

        {/* 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {wardrobe.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full text-left flex items-center p-3 rounded-lg transition-colors border-2
                ${item.id === selectedId
                  ? "bg-fuchsia-800/40 border-fuchsia-500 text-white"
                  : "bg-gray-700/50 hover:bg-gray-700 border-gray-700 text-gray-300"
                }`}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 object-cover rounded-md mr-3 shadow-md"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.onerror = null;
                  t.src = "https://placehold.co/40x40/71717A/fff?text=IMG";
                }}
              />
              <span className="font-medium flex-1">{item.name}</span>
              {item.id === selectedId && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">
                  SELECTED
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 업로드 버튼(선택 기능) */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center p-3 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition transform hover:scale-[1.01] shadow-lg shadow-fuchsia-900/50"
          >
            <Upload className="w-5 h-5 mr-2" />
            Add Style (optional)
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-700 text-sm text-gray-400">
          <p>
            Context Item:{" "}
            <span className="text-white font-medium">{current?.name}</span>
          </p>
        </div>
      </div>
    );
  }
