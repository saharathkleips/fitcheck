// src/api/openai.ts
/**
 * OpenAI 이미지 분석 호출 유틸
 * - 파일을 DataURL(base64)로 인코드하여 Chat Completions API에 전달
 * - prompt/모델/디테일/타임아웃/키 오버라이드 지원
 *
 * 사용 예:
 *   const text = await analyzeImage(file, finalPrompt); // .env 키 사용
 *   const text = await analyzeImage(file, finalPrompt, userInputKey);
 */

export type AnalyzeOptions = {
  model?: string;                    // 기본: gpt-4o-mini
  detail?: "auto" | "low" | "high";  // 기본: auto
  timeoutMs?: number;                // 기본: 20000 (20s)
};

export async function analyzeImage(
  file: File,
  prompt: string,
  apiKey?: string,
  opts: AnalyzeOptions = {}
): Promise<string> {
  const key = (apiKey || import.meta.env.VITE_OPENAI_API_KEY) as string | undefined;
  if (!key) {
    throw new Error(
      "OpenAI API Key가 없습니다. .env의 VITE_OPENAI_API_KEY 또는 UI 입력값을 확인하세요."
    );
  }

  const model = opts.model ?? "gpt-4o-mini";
  const detail = opts.detail ?? "auto";
  const timeoutMs = opts.timeoutMs ?? 20000;

  // 1) 파일 → DataURL
  const dataUrl = await fileToDataURL(file);

  // 2) 요청 바디
  const body = {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl, detail } },
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

  

  // 3) 타임아웃 컨트롤러
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 4) fetch 호출
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
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

/** 내부 유틸: 파일 -> DataURL ("data:image/png;base64,....") */
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/** 내부 유틸: 안전한 텍스트 읽기 */
async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no-body>";
  }
}

/** 내부 유틸: 긴 문자열 자르기 */
function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

/** 최소 타입 (필요 시 확장 가능) */
type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type ChatChoice = {
  index: number;
  message: ChatMessage;
  finish_reason?: string;
};

type ChatCompletionResponse = {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};
