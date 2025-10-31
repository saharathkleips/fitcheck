import { useEffect, useRef, useState } from "react";
import { Upload, Tag } from "lucide-react";

/* ---------- Types ---------- */
type PhotoMeta = {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  tags?: string[];
};
type PhotoRecord = { meta: PhotoMeta; blob: Blob; thumb?: Blob };

/* ---------- IndexedDB ---------- */
function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open("photos-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "meta.id" });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function putPhoto(rec: PhotoRecord) {
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").put(rec);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function getAll(): Promise<PhotoRecord[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readonly");
    const req = tx.objectStore("photos").getAll();
    req.onsuccess = () => res(req.result as PhotoRecord[]);
    req.onerror = () => rej(req.error);
  });
}
async function remove(id: string) {
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* ---------- Utils ---------- */
async function sha256Hex(blob: Blob) {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function makeThumb(blob: Blob, max = 128): Promise<Blob> {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(blob);
  await img.decode();
  const s = Math.min(max / img.width, max / img.height, 1);
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return await new Promise(res => c.toBlob(b => res(b!), "image/jpeg", 0.85)!);
}

/* ---------- Custom Scrollbar (Wardrobe 스타일) ---------- */
const customScrollbarStyle = `
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
`;

/* ---------- Component ---------- */
export default function PhotoVault() {
  const [items, setItems] = useState<PhotoRecord[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [usageInfo, setUsageInfo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { refresh(); }, []);

  // Inject custom scrollbar style once
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = customScrollbarStyle;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  async function refresh() {
    const all = await getAll();
    all.sort((a, b) => b.meta.lastModified - a.meta.lastModified);
    setItems(all);
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { quota, usage } = await navigator.storage.estimate();
      if (quota && usage) {
        const p = ((usage / quota) * 100).toFixed(1);
        setUsageInfo(`${(usage / (1024 * 1024)).toFixed(1)}MB / ${(quota / (1024 * 1024)).toFixed(0)}MB (${p}%)`);
      }
    }
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelected(files);
  }

  async function addSelected() {
    if (!selected.length) return;
    await new Promise(r => setTimeout(r, 0));
    for (const f of selected) {
      if (!f.type.startsWith("image/")) continue;
      const id = await sha256Hex(f);
      const thumb = await makeThumb(f, 128);
      await putPhoto({
        meta: { id, name: f.name, type: f.type, size: f.size, lastModified: f.lastModified },
        blob: f,
        thumb
      });
    }
    setSelected([]);
    if (inputRef.current) inputRef.current.value = "";
    await refresh();
  }

  function download(rec: PhotoRecord) {
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = rec.meta.name || "photo";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // 카테고리 정의 및 그룹화 (Wardrobe와 호환)
  const CATS = ["상의","하의","겉옷","모자","양말","신발","액세서리","미분류"] as const;
  type Cat = (typeof CATS)[number];
  const groups: Record<Cat, PhotoRecord[]> = CATS.reduce((acc, c) => ({...acc, [c]: []}), {} as any);
  for (const it of items) {
    const cat = (it.meta.tags?.[0] as Cat) || "미분류";
    if (CATS.includes(cat)) groups[cat].push(it);
    else groups["미분류"].push(it);
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col mt-6">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-cyan-400 flex items-center">
          <Upload className="w-5 h-5 mr-2" /> 사진 보관함
        </h2>
        <span className="ml-auto text-xs text-gray-400">{usageInfo || "저장공간 계산 중..."}</span>
      </div>

      {/* 업로드 영역 (Wardrobe 스타일) */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onSelect}
          onInput={onSelect as any}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center p-3 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition transform hover:scale-[1.01] shadow-lg shadow-fuchsia-900/50"
        >
          <Upload className="w-5 h-5 mr-2" />
          {selected.length ? `추가 (${selected.length})` : "새 사진 추가 (업로드)"}
        </button>
        {selected.length > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={addSelected}
              className="px-3 py-1.5 text-sm rounded-md bg-gray-900/70 hover:bg-gray-900 text-gray-200"
            >
              선택한 사진 저장
            </button>
          </div>
        )}
      </div>

      {/* 카테고리별 섹션 + 카드형 16:9 레이아웃 */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {CATS.map(cat => (
          groups[cat].length > 0 && (
            <section key={cat}>
              <h3 className="text-lg font-medium text-gray-200 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-fuchsia-400" /> {cat}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups[cat].map(it => {
                  const url = URL.createObjectURL(it.thumb ?? it.blob);
                  return (
                    <div key={it.meta.id} className="relative w-full pb-[56.25%]">
                      <div className="absolute inset-0 bg-gray-700 rounded-xl overflow-visible shadow-lg border-2 border-gray-600 hover:border-fuchsia-700 transition-all duration-200">
                        {/* 좌측 이미지 */}
                        <img
                          src={url}
                          alt={it.meta.name}
                          className="absolute top-0 left-0 h-full w-1/2 object-cover rounded-lg"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />

                        {/* 우측 정보 */}
                        <div className="absolute top-0 right-0 h-full w-1/2 p-2 flex flex-col justify-between">
                          {/* 카테고리 태그 */}
                          <div className="w-full text-right">
                            <span className="text-xs font-semibold px-3 py-1 bg-cyan-700 text-white rounded-lg shadow-md tracking-wider">
                              {(it.meta.tags?.[0] as Cat) || "미분류"}
                            </span>
                          </div>

                          {/* 파일 이름 */}
                          <p className="text-base font-bold text-white line-clamp-2 text-center mt-auto mb-auto" title={it.meta.name}>
                            {it.meta.name}
                          </p>

                          {/* 액션 버튼 */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-cyan-400 transition text-sm font-medium shadow-inner"
                              onClick={() => download(it)}
                            >
                              다운
                            </button>
                            <button
                              className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-900/70 hover:bg-gray-900 rounded-lg text-gray-300 hover:text-fuchsia-400 transition text-sm font-medium shadow-inner"
                              onClick={async () => { await remove(it.meta.id); await refresh(); }}
                            >
                              삭제
                            </button>
                          </div>

                          {/* 카테고리 선택 드롭다운 (DB 갱신) */}
                          <select
                            value={it.meta.tags?.[0] ?? ""}
                            onChange={async (e) => {
                              const category = e.target.value as Cat;
                              const updated = { ...it, meta: { ...it.meta, tags: category ? [category] : [] } };
                              await putPhoto(updated);
                              await refresh();
                            }}
                            className="mt-2 w-full text-xs bg-gray-900/70 text-gray-200 rounded-md px-2 py-1 focus:outline-none"
                          >
                            <option value="">카테고리 선택</option>
                            {CATS.filter(c => c !== "미분류").map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}
