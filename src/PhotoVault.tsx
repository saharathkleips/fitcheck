
import { useEffect, useRef, useState } from "react";

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
  // 썸네일 기본 크기 128px로 축소 (기존 256 → 더 작게)
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

/* ---------- Component ---------- */
export default function PhotoVault() {
  const [items, setItems] = useState<PhotoRecord[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [usageInfo, setUsageInfo] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const THUMB_VIEW = 96; // 미리보기 표시 크기

  useEffect(() => { refresh(); }, []);

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
  await new Promise(r => setTimeout(r, 0)); // 사파리 렌더 대응
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

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onSelect}
            onInput={onSelect}
          />
          <button onClick={addSelected} disabled={!selected.length}>
            {selected.length ? `추가 (${selected.length})` : "추가"}
          </button>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {usageInfo || "저장공간 계산 중..."}
        </span>
      </div>

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${THUMB_VIEW}px, 1fr))`,
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: 0
        }}
      >
        {items.map((it) => {
          const url = URL.createObjectURL(it.thumb ?? it.blob);
          return (
            <li key={it.meta.id} style={{ padding: 4 }}>
              <img
                src={url}
                alt={it.meta.name}
                width={THUMB_VIEW}
                height={THUMB_VIEW}
                style={{ width: THUMB_VIEW, height: THUMB_VIEW, objectFit: "cover", borderRadius: 6, display: "block" }}
                onLoad={() => URL.revokeObjectURL(url)}
              />
              <div
                title={it.meta.name}
                style={{ fontSize: 11, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {it.meta.name}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button onClick={() => download(it)} style={{ flex: 1, fontSize: 11 }}>다운</button>
                <button
                  onClick={async () => { await remove(it.meta.id); await refresh(); }}
                  style={{ flex: 1, fontSize: 11, color: "#c00" }}
                >
                  삭제
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

