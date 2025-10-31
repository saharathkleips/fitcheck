import type { TodayWeather } from "@/hooks/useWeather";
import { summarizeWeather } from "@/lib/utils";

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

export async function analyzeImage(
  apiKey: string,
  picture: string,
  weather: TodayWeather | null,
  prompt = "이 이미지의 내용을 설명해줘."
) {
  const fullPrompt = `
[Weather]
${weather ? summarizeWeather(weather) : "날씨 정보 없음"}

[Instruction]
${prompt}
`;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: fullPrompt },
          {
            type: "image_url",
            image_url: {
              url: picture, // <-- 문자열이 아닌 객체로!
              detail: "auto", // "low" | "high" | "auto" (옵션)
            },
          },
        ],
      },
    ],
  };

  // 3) 타임아웃 컨트롤러
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);

  try {
    // 4) fetch 호출
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // 5) 에러 처리
    if (!res.ok) {
      const errTxt = await res.text();
      // OpenAI 표준 에러 포맷을 최대한 친절하게 노출
      throw new Error(
        `OpenAI API error (${res.status} ${res.statusText}): ${errTxt}`
      );
    }

    // 6) 응답 파싱
    const data = (await res.json()) as ChatCompletionResponse;
    const content = data?.choices?.[0]?.message?.content ?? "";
    return content;
    // eslint-disable-next-line
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(`요청 타임아웃 — 네트워크 상태를 확인하세요.`);
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// src/api/openai.ts
export async function analyzeOutfits(
  apiKey: string,
  weather: TodayWeather | null,
  prompt: string,
  style: string | null,
  wardrobe: string[]
) {
  const fullPrompt = `
[Weather]
${weather ? summarizeWeather(weather) : "날씨 정보 없음"}

[Style]
${style}

[Instruction]
${prompt}
`;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: fullPrompt },
          ...wardrobe.map((image) => ({
            type: "image_url",
            image_url: {
              url: image,
              detail: "auto"
            },
          })),
        ],
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices[0]?.message?.content ?? "";

  return cleanResponse(raw);
}

// GPT 응답 정제 (JSON/따옴표/코드블록 제거)
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```(json|JSON)?([\s\S]*?)```/g, "$2");
  cleaned = cleaned.replace(/^\{[\s\S]*\}$/, "");
  cleaned = cleaned.replace(/^\[[\s\S]*\]$/, "");
  cleaned = cleaned.replace(/["{}]/g, "");
  cleaned = cleaned.replace(/\n{2,}/g, "\n").trim();
  return cleaned;
}
