const MODELS = [
  "google/gemini-2.0-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "mistralai/mistral-7b-instruct",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-haiku",
];

const TIMEOUT_MS = 30000;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function streamWithCascade(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    onError(new Error("OPENROUTER_API_KEY not set"));
    return;
  }

  for (const model of MODELS) {
    try {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://quov.ai",
            "X-Title": "Quov AI",
          },
          body: JSON.stringify({ model, messages, stream: true }),
        },
        TIMEOUT_MS,
      );

      if (!res.ok || !res.body) {
        console.warn(`Model ${model} returned ${res.status}, trying next`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let hasContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              hasContent = true;
              onToken(token);
            }
          } catch {}
        }
      }
      if (hasContent) {
        onDone();
        return;
      }
    } catch (e: any) {
      console.warn(`Model ${model} failed:`, e.message);
      continue;
    }
  }
  onError(new Error("All AI models are currently unavailable. Please try again."));
}

export async function generateWithCascade(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  for (const model of MODELS) {
    try {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://quov.ai",
            "X-Title": "Quov AI",
          },
          body: JSON.stringify({ model, messages, stream: false }),
        },
        TIMEOUT_MS,
      );

      if (!res.ok) {
        console.warn(`Model ${model} returned ${res.status}`);
        continue;
      }
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (e: any) {
      console.warn(`Model ${model} failed:`, e.message);
      continue;
    }
  }
  throw new Error("All AI models are currently unavailable.");
}
