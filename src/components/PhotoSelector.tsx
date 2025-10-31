import React, { useMemo, useRef, useState } from "react";

export type PhotoSelectorProps = {
  onChange?: (selected: Blob[]) => void;
  title?: string;
};

type Item = { id: string; name: string; blob: Blob; url: string; selected: boolean };

export default function PhotoSelector({ onChange, title = "Select Photos" }: PhotoSelectorProps) {
  const [items, setItems] = useState<Item[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: Item[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      blob: f,
      url: URL.createObjectURL(f),
      selected: true, // 기본 선택
    }));
    setItems((prev) => {
      const merged = [...prev, ...newItems];
      if (onChange) onChange(merged.filter((x) => x.selected).map((x) => x.blob));
      return merged;
    });
  }

  function toggle(id: string) {
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it));
      if (onChange) onChange(next.filter((x) => x.selected).map((x) => x.blob));
      return next;
    });
  }

  function clearAll() {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    if (onChange) onChange([]);
  }

  const selectedCount = useMemo(() => items.filter((x) => x.selected).length, [items]);

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h2>

      <div className="flex items-center gap-2 mb-3">
        <button
          className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          onClick={() => fileRef.current?.click()}
        >
          사진 업로드
        </button>
        <button
          className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          onClick={clearAll}
          disabled={items.length === 0}
        >
          초기화
        </button>
        <span className="ml-auto text-sm text-gray-300">
          선택: <b>{selectedCount}</b> / {items.length}
        </span>
      </div>

      <input
        ref={fileRef}
        className="hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      <ul
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
      >
        {items.map((it) => (
          <li
            key={it.id}
            className={`relative border rounded-lg overflow-hidden cursor-pointer ${
              it.selected ? "border-fuchsia-500" : "border-gray-700"
            }`}
            onClick={() => toggle(it.id)}
            title={it.name}
          >
            <img src={it.url} alt={it.name} className="w-full h-[100px] object-cover" />
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={it.selected}
                onChange={() => toggle(it.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {it.selected && (
              <div className="absolute bottom-0 left-0 right-0 bg-fuchsia-600/70 text-white text-xs px-1 py-0.5">
                SELECTED
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
