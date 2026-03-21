import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetChat, useProcessOcr, useDeleteChat, type AiAnalysis, type Message } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Button, Card, Badge } from "@/components/ui-elements";
import { Send, Upload, Sparkles, Bot, User, Flame, Zap, ShieldAlert, Trash2, AlertCircle, X, StopCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { chatId } = useParams();
  const [, setLocation] = useLocation();
  const {
    data: chatData,
    isLoading,
    isError,
    error: chatError,
  } = useGetChat(chatId || "");
  const deleteChat = useDeleteChat();
  const processOcr = useProcessOcr();
  const {
    sendMessage,
    cancelStream,
    isStreaming,
    streamText,
    analysis: streamedAnalysis,
    setAnalysis: setStreamAnalysis,
    error: streamError,
  } = useChatStream(chatId || "");

  const [content, setContent] = useState("");
  const [tone, setTone] = useState<"charmer" | "witty" | "closer">("charmer");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAnalysis, setLocalAnalysis] = useState<AiAnalysis | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (chatData?.messages) {
      setLocalMessages(chatData.messages);
    }
  }, [chatData?.messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, streamText, localAnalysis, streamedAnalysis]);

  useEffect(() => {
    if (streamedAnalysis) {
      setLocalAnalysis(streamedAnalysis);
    }
  }, [streamedAnalysis]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      chatId: chatId!,
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMsg]);
    const sent = content.trim();
    setContent("");
    setStreamAnalysis(null);
    setLocalAnalysis(null);

    await sendMessage(sent, tone);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;
    setOcrError(null);
    try {
      const result = await processOcr.mutateAsync({ chatId, data: { image: file } });
      setContent(`[Screenshot Text]:\n${result.extractedText}`);
      if (result.analysis) setLocalAnalysis(result.analysis);
    } catch (err: any) {
      setOcrError(err?.message || "Could not read screenshot. Please try a clearer image.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!chatId || !confirm("Delete this conversation?")) return;
    await deleteChat.mutateAsync({ chatId });
    setLocation("/dashboard");
  };

  const activeError = streamError || ocrError;
  const shouldDismissError = dismissed === activeError;

  if (!chatId) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center flex-col gap-4 text-center p-8">
          <AlertCircle className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">No conversation selected.</p>
          <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center flex-col gap-4">
          <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center flex-col gap-4 text-center p-8">
          <AlertCircle className="size-12 text-destructive" />
          <p className="text-white font-semibold">Couldn't load this conversation</p>
          <p className="text-sm text-muted-foreground">{(chatError as any)?.message || "It may have been deleted or you don't have access."}</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">

        {/* Header */}
        <header className="px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold text-white truncate">
              {chatData?.title || "Analysis Session"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  isStreaming ? "bg-yellow-400" : "bg-emerald-400"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isStreaming ? "bg-yellow-500" : "bg-emerald-500"
                )} />
              </span>
              <span className="text-xs text-muted-foreground">
                {isStreaming ? "AI is responding…" : "Cascade Model Active"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Button variant="ghost" size="sm" onClick={cancelStream} className="text-yellow-500 hover:text-yellow-400 gap-1 text-xs">
                <StopCircle className="size-3.5" /> Stop
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive"
              title="Delete conversation"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        </header>

        {/* Error Banner */}
        <AnimatePresence>
          {activeError && !shouldDismissError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                {activeError}
              </div>
              <button onClick={() => setDismissed(activeError)} className="text-muted-foreground hover:text-white ml-4">
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-40 scroll-smooth">

          {localMessages.length === 0 && !isStreaming && !localAnalysis && (
            <div className="flex flex-col items-center justify-center text-center pt-16 pb-8 space-y-4">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="size-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Your AI Dating Coach</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                  Paste a message, upload a screenshot, or just ask — I'll analyze the conversation and give you the perfect response.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 w-full max-w-lg">
                {[
                  { label: "📸 Upload Screenshot", action: () => fileInputRef.current?.click() },
                  { label: "💬 Paste a message", action: () => setContent("She said: ") },
                  { label: "🔥 Rate my opener", action: () => setContent("Is this a good opener: ") },
                ].map(tip => (
                  <button
                    key={tip.label}
                    onClick={tip.action}
                    className="px-4 py-3 rounded-xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/40 transition-all text-sm text-muted-foreground hover:text-white text-left"
                  >
                    {tip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isStreaming && (
            <MessageBubble
              message={{
                id: "streaming",
                chatId: chatId!,
                role: "assistant",
                content: streamText,
                createdAt: new Date().toISOString(),
              }}
              isStreaming
            />
          )}

          <AnimatePresence>
            {localAnalysis && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mx-auto space-y-4"
              >
                <AnalysisVisualizer analysis={localAnalysis} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <ResponseCard title="Charmer" emoji="✨" content={localAnalysis.charmerResponse} onUse={() => setContent(localAnalysis!.charmerResponse)} />
                  <ResponseCard title="Witty" emoji="😏" content={localAnalysis.wittyResponse} onUse={() => setContent(localAnalysis!.wittyResponse)} />
                  <ResponseCard title="Closer" emoji="🎯" content={localAnalysis.closerResponse} onUse={() => setContent(localAnalysis!.closerResponse)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full z-20 bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
          <div className="max-w-3xl mx-auto px-4 pb-4">

            {/* Tone Selector */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Tone:</span>
              {(["charmer", "witty", "closer"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize",
                    tone === t
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-card text-muted-foreground hover:text-white border border-border"
                  )}
                >
                  {t}
                </button>
              ))}
              <div className="ml-auto group relative">
                <Info className="size-3.5 text-muted-foreground hover:text-white cursor-help" />
                <div className="absolute bottom-6 right-0 w-56 p-3 bg-popover border border-border rounded-xl text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  <strong className="text-white block mb-1">Tone Guide</strong>
                  Charmer — warm & smooth<br />
                  Witty — clever & playful<br />
                  Closer — bold & direct
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSend}
              className="relative flex items-end gap-2 bg-card border border-border/50 rounded-2xl p-2 shadow-2xl focus-within:ring-2 ring-primary/50 transition-all"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-primary mb-0.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || processOcr.isPending}
                title="Upload Screenshot"
              >
                {processOcr.isPending ? (
                  <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Upload className="size-5" />
                )}
              </Button>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste her message or describe the situation…"
                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 text-sm text-foreground placeholder:text-muted-foreground"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!content.trim() || isStreaming || processOcr.isPending}
                className="shrink-0 mb-0.5 rounded-xl bg-gradient-to-tr from-primary to-accent hover:brightness-110"
              >
                <Send className="size-4" />
              </Button>
            </form>

            <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
              Quov AI — powered by Striller Group AI cascade
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full max-w-3xl mx-auto gap-3", isUser ? "flex-row-reverse" : "")}
    >
      <div className={cn(
        "size-8 shrink-0 rounded-full flex items-center justify-center mt-1 shadow-md",
        isUser ? "bg-white/10" : "bg-gradient-to-br from-primary to-accent"
      )}>
        {isUser ? <User className="size-4 text-white" /> : <Bot className="size-4 text-white" />}
      </div>
      <div className={cn(
        "px-5 py-3.5 rounded-2xl max-w-[82%] leading-relaxed text-[15px]",
        isUser
          ? "bg-primary/20 text-white rounded-tr-sm border border-primary/20"
          : "bg-card border border-border shadow-xl rounded-tl-sm text-white/90"
      )}>
        {message.content ? (
          message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))
        ) : isStreaming ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </span>
            Thinking…
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

function AnalysisVisualizer({ analysis }: { analysis: AiAnalysis }) {
  const score = Math.min(100, Math.max(0, analysis.flirtScore || 0));
  const circumference = 2 * Math.PI * 44;

  return (
    <Card className="p-6 bg-gradient-to-b from-card to-background border-primary/20">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex items-center gap-6 shrink-0">
          <div className="relative size-24 flex items-center justify-center">
            <svg className="absolute inset-0 size-full transform -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-secondary" />
              <circle
                cx="48" cy="48" r="44"
                stroke="url(#scoreGrad)"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center z-10">
              <span className="text-2xl font-display font-bold text-white">{score}</span>
              <div className="text-[10px] text-muted-foreground leading-none">/ 100</div>
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              Flirt Score™ <Sparkles className="size-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? "She's very interested! 🔥" : score >= 60 ? "Strong signals 💫" : score >= 40 ? "Warming up 🌱" : "Keep engaging 🤝"}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
              <Flame className="size-3 text-orange-500" /> Interest
            </div>
            <Badge variant="outline" className="text-sm bg-black/40 py-1 capitalize">
              {analysis.interestLevel || "—"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
              <Zap className="size-3 text-yellow-500" /> Energy
            </div>
            <Badge variant="outline" className="text-sm bg-black/40 py-1 capitalize">
              {analysis.energy || "—"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
              <ShieldAlert className="size-3 text-red-500" /> Risk
            </div>
            <Badge variant="outline" className="text-sm bg-black/40 py-1 capitalize">
              {analysis.risk || "—"}
            </Badge>
          </div>
        </div>
      </div>

      {analysis.coaching && (
        <div className="mt-5 pt-4 border-t border-border/50 flex items-start gap-3">
          <Bot className="size-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{analysis.coaching}"</p>
        </div>
      )}
    </Card>
  );
}

function ResponseCard({
  title,
  emoji,
  content,
  onUse,
}: {
  title: string;
  emoji: string;
  content: string;
  onUse: () => void;
}) {
  return (
    <Card
      className="p-5 bg-card/60 hover:bg-card hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
      onClick={onUse}
    >
      <div>
        <h4 className="font-semibold text-white mb-2 pb-2 border-b border-white/5 group-hover:text-primary transition-colors flex items-center gap-2">
          {emoji} {title}
        </h4>
        <p className="text-sm text-muted-foreground italic leading-relaxed">"{content}"</p>
      </div>
      <div className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-3">
        Tap to use <Send className="size-3" />
      </div>
    </Card>
  );
}
