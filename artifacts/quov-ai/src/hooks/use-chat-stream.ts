import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetChatQueryKey, type AiAnalysis } from "@workspace/api-client-react";

const STREAM_TIMEOUT_MS = 45000;

export function useChatStream(chatId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string, tone: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    setIsStreaming(true);
    setStreamText("");
    setAnalysis(null);
    setError(null);

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ content, tone }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to send message" }));
        setError(body.error || `Server error ${res.status}`);
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                setStreamText((prev) => prev + data.token);
              }
              if (data.done) {
                completed = true;
                if (data.analysis) setAnalysis(data.analysis);
              }
              if (data.error) {
                setError(data.error);
                completed = true;
              }
            } catch {}
          }

          if (completed) break;
        }
      } catch (readErr: any) {
        if (readErr.name !== "AbortError") {
          setError("Connection lost. Please try again.");
        }
      } finally {
        reader.cancel().catch(() => {});
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
    }
  };

  const cancelStream = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  return { sendMessage, cancelStream, isStreaming, streamText, analysis, setAnalysis, error };
}
