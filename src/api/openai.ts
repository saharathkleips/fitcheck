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

// DataURL 전체를 반환 (mime 포함)
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string); // "data:image/jpeg;base64,AAAA..."
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}
