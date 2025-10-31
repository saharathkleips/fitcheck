import { useEffect, useMemo, useState } from "react";
import { analyzeOutfits } from "../api/openai";
import { useSettings } from "../hooks/useSettings";
import { useWeather } from "../hooks/useWeather";
import { summarizeWeather } from "../lib/utils";

type PhotoMeta = { id: string; name: string; type: string; size: number; lastModified: number; tags?: string[] };
type PhotoRecord = { meta: PhotoMeta; blob: Blob; thumb?: Blob };

// IndexedDB 열기
async function openDB(): Promise<IDBDatabase> {
  return await new Promise((res, rej) => {
    const req = indexedDB.open("photos-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("photos"))
        db.createObjectStore("photos", { keyPath: "meta.id" });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

// IndexedDB 모든 이미지 불러오기
async function getAll(): Promise<PhotoRecord[]> {
  const db = await openDB();
  return await new Promise((res, rej) => {
    const tx = db.transaction("photos", "readonly");
    const req = tx.objectStore("photos").getAll();
    req.onsuccess = () => res(req.result as PhotoRecord[]);
    req.onerror = () => rej(req.error);
  });
}

// 썸네일 렌더링
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

export default function OutfitComposerWithStyle() {
  const { gptApiKey, weatherApiKey } = useSettings();
  const { weather } = useWeather(weatherApiKey);

  const [items, setItems] = useState<PhotoRecord[]>([]);
  const [pick, setPick] = useState<Record<string, boolean>>({});
  const [styleChoice, setStyleChoice] = useState("미니멀");
  const [prompt, setPrompt] = useState(
    "사진에 나온 옷들만 사용해서 오늘 날씨와 선택한 스타일에 어울리는 코디 1세트를 제안해줘. 새로운 아이템은 추가하지 말고 사진 속 옷 조합만 고려해."
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // IndexedDB에서 이미지 불러오기
  useEffect(() => {
    (async () => {
      const all = await getAll();
      all.sort((a, b) => b.meta.lastModified - a.meta.lastModified);
      setItems(all);
    })();
  }, []);

  const selectedBlobs = useMemo(
    () => items.filter((it) => pick[it.meta.id]).map((it) => it.blob),
    [items, pick]
  );

  // ✅ GPT 분석 요청
  async function handleOutfit() {
    if (!selectedBlobs.length) {
      alert("이미지를 선택하세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResponse("분석 중입니다...");

      // ✅ 날씨 + 스타일 + 사용자 지시 결합
      const fullPrompt = `
[Weather]
${weather ? summarizeWeather(weather) : "날씨 정보 없음"}

[Style]
${styleChoice}

[Instruction]
${prompt}
`;

      const text = await analyzeOutfits(selectedBlobs, fullPrompt, {
        apiKey: gptApiKey,
        weatherSummary: weather ? summarizeWeather(weather) : undefined,
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
    <div style={{ marginTop: "2rem" }}>
      <h2>스타일 기반 코디 생성</h2>

      {/* ✅ 스타일 선택 */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 13, marginRight: 8 }}>스타일 선택:</label>
        <select
          value={styleChoice}
          onChange={(e) => setStyleChoice(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6 }}
        >
          <option value="미니멀">미니멀</option>
          <option value="스트릿">스트릿</option>
          <option value="포멀">포멀</option>
          <option value="빈티지">빈티지</option>
          <option value="스포티">스포티</option>
          <option value="페미닌">페미닌</option>
          <option value="댄디">댄디</option>
          <option value="캐주얼">캐주얼</option>
        </select>
      </div>

      {/* 추가 지시 */}
      <div style={{ marginTop: 10 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            opacity: 0.8,
            marginBottom: 4,
          }}
        >
          추가지시(옵션)
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예) 좀 더 부드러운 느낌으로 추천"
          style={{
            width: "100%",
            maxWidth: 520,
            padding: "8px 10px",
          }}
        />
      </div>

      {/* 실행 버튼 */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={handleOutfit} disabled={loading || !selectedBlobs.length}>
          {loading ? "분석 중..." : `코디 생성 (${selectedBlobs.length}장)`}
        </button>
      </div>

      {/* 이미지 리스트 */}
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: 10,
          listStyle: "none",
          padding: 0,
          marginTop: 14,
        }}
      >
        {items.map((it) => (
          <li
            key={it.meta.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 6,
            }}
          >
            <Thumb blob={it.thumb ?? it.blob} alt={it.meta.name} height={100} />
            <label
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <input
                type="checkbox"
                checked={!!pick[it.meta.id]}
                onChange={(e) =>
                  setPick((p) => ({ ...p, [it.meta.id]: e.target.checked }))
                }
              />
              <span
                style={{
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {it.meta.name}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {/* 결과 출력 */}
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
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{response}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
