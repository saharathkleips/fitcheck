// src/components/OutfitComposer.tsx
import { useEffect, useMemo, useState } from "react";
import { analyzeOutfits } from "./api/openai"; // ← 경로 수정

type PhotoMeta = { id: string; name: string; type: string; size: number; lastModified: number; tags?: string[] };
type PhotoRecord = { meta: PhotoMeta; blob: Blob; thumb?: Blob };

async function openDB(): Promise<IDBDatabase> {
  return await new Promise((res, rej) => {
    const req = indexedDB.open("photos-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos", { keyPath: "meta.id" });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function getAll(): Promise<PhotoRecord[]> {
  const db = await openDB();
  return await new Promise((res, rej) => {
    const tx = db.transaction("photos", "readonly");
    const req = tx.objectStore("photos").getAll();
    req.onsuccess = () => res(req.result as PhotoRecord[]);
    req.onerror = () => rej(req.error);
  });
}

/** 썸네일 전용 자식 컴포넌트: 여기서만 훅 사용 */
function Thumb({ blob, alt, height = 100 }: { blob?: Blob; alt: string; height?: number }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) { setUrl(undefined); return; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return (
    <img
      src={url}
      alt={alt}
      style={{ width: "100%", height, objectFit: "cover", borderRadius: 6 }}
    />
  );
}

export default function OutfitComposer() {
  const [items, setItems] = useState<PhotoRecord[]>([]);
  const [pick, setPick] = useState<Record<string, boolean>>({});
  const [prompt, setPrompt] = useState(
    '아래 옷 사진들로 코디 3세트를 JSON 한 줄씩 제안해줘: {"set":n,"items":["<파일ID>",...],"reason":"..."}'
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await getAll();
      all.sort((a, b) => b.meta.lastModified - a.meta.lastModified);
      setItems(all);
    })();
  }, []);

  const selectedBlobs = useMemo(
    () => items.filter(it => pick[it.meta.id]).map(it => it.blob),
    [items, pick]
  );

  async function handleOutfit() {
    if (!selectedBlobs.length) { alert("이미지를 선택하세요."); return; }
    try {
      setLoading(true);
      setError(null);
      setResponse("분석 중입니다...");
      const text = await analyzeOutfits(selectedBlobs, prompt);
      setResponse(text);
    } catch (e: any) {
      setError(e?.message ?? "에러");
      setResponse("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>코디 생성</h2>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 4 }}>추가지시(옵션)</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='예) 미니멀/캠퍼스룩으로 추천'
          style={{ width: '100%', maxWidth: 520, padding: '8px 10px' }}
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={handleOutfit} disabled={loading || !selectedBlobs.length}>
          {loading ? "분석 중..." : `코디 생성 (${selectedBlobs.length}장)`}
        </button>
      </div>

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: 10, listStyle: "none", padding: 0, marginTop: 14
        }}
      >
        {items.map((it) => (
          <li key={it.meta.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 6 }}>
            <Thumb blob={it.thumb ?? it.blob} alt={it.meta.name} height={100} />
            <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
              <input
                type="checkbox"
                checked={!!pick[it.meta.id]}
                onChange={(e) => setPick(p => ({ ...p, [it.meta.id]: e.target.checked }))}
              />
              <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.meta.name}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {(response || error) && (
        <div style={{ marginTop: "1rem" }}>
          {error ? (
            <>
              <h3>에러</h3>
              <p style={{ color: "crimson" }}>{error}</p>
            </>
          ) : (
            <>
              <h3>결과</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
