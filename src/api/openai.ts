// src/api/openai.ts
export async function analyzeImage(file: File, prompt = "이 이미지의 내용을 설명해줘.") {
  const dataUrl = await fileToDataURL(file); // "data:image/png;base64,..." 전체 문자열

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,    // <-- 문자열이 아닌 객체로!
              detail: "auto",  // "low" | "high" | "auto" (옵션)
            },
          },
        ],
      },
    ],
  };
}
  
export async function analyzeOutfits(
  filesOrBlobs: (File | Blob)[],
  prompt = '아래 옷 사진들로 코디 3세트를 JSON 한 줄씩 제안해줘: {"set":n,"items":["<파일ID>",...],"reason":"..."}',
  opts?: { apiKey?: string; maxImages?: number; detail?: "low" | "high" | "auto" }
) {

  const max = Math.min(filesOrBlobs.length, opts?.maxImages ?? 6);
  const detail = opts?.detail ?? "auto";

  const images = [];
  for (let i = 0; i < max; i++) {
    const f = filesOrBlobs[i];
    const dataUrl = await blobToDataURL(await maybeCompressToJpeg(f)); // 전송량 절감
    images.push({
      type: "image_url",
      image_url: { url: dataUrl, detail } as const,
    });
  }

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...images,
        ],
      },
    ],
  };

  

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}


// Blob/File -> DataURL
async function blobToDataURL(b: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(b);
  });
}

// (선택) 전송 전 간단 압축: 긴 변 1024, JPEG 0.75
async function maybeCompressToJpeg(src: Blob | File, maxSide = 1024, quality = 0.75): Promise<Blob> {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(src);
  try { await img.decode(); }
  catch {
    await new Promise<void>((ok, err) => { img.onload = () => ok(); img.onerror = () => err(new Error("image load error")); });
  }
  const s = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * s));
  const h = Math.max(1, Math.round(img.height * s));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  return await new Promise<Blob>((resolve) => {
    if (c.toBlob) c.toBlob(b => resolve(b ?? dataURLtoBlob(c.toDataURL("image/jpeg", quality))), "image/jpeg", quality);
    else resolve(dataURLtoBlob(c.toDataURL("image/jpeg", quality)));
  });

  function dataURLtoBlob(d: string) {
    const [m, b64] = d.split(",");
    const mime = /data:(.*?);/.exec(m)?.[1] || "image/jpeg";
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }
}



// DataURL 전체를 반환 (mime 포함)
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string); // "data:image/jpeg;base64,AAAA..."
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
