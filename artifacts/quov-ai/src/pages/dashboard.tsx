import { AppLayout } from "@/components/layout/app-layout";
import { Button, Card, Badge } from "@/components/ui-elements";
import {
  MessageSquarePlus, Copy, Users, Zap, BarChart2, Flame, Target,
  Clock, BookOpen, Sparkles, ArrowRight, TrendingUp, Star, Shield, ChevronRight, AlertCircle
} from "lucide-react";
import { useCreateChat, useGetReferrals, useListChats, useGetMe } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

const TIPS = [
  { icon: "💬", title: "Lead with curiosity", body: "Ask one specific question about something she mentioned. People love talking about themselves." },
  { icon: "😂", title: "Match her energy", body: "If she uses short messages, keep yours brief. If she writes paragraphs, show the same investment." },
  { icon: "🎯", title: "Suggest, don't ask", body: "Instead of 'want to hang out?', say 'we should grab coffee Thursday'. Confidence converts." },
  { icon: "⏱️", title: "Timing matters", body: "Don't reply instantly every time — a little delay signals you have a life. But never wait more than 24h." },
  { icon: "🔥", title: "Use her name sparingly", body: "Drop her name once in a message — it creates instant intimacy without being pushy." },
  { icon: "📸", title: "Upload screenshots", body: "Get the most out of Quov AI by uploading real screenshots — context is everything for accurate analysis." },
];

const TONE_GUIDE = [
  { name: "Charmer", emoji: "✨", color: "from-violet-500 to-purple-600", desc: "Warm, smooth, confident. Great for early stages and keeping things flowing." },
  { name: "Witty", emoji: "😏", color: "from-pink-500 to-rose-600", desc: "Clever, playful, surprising. Creates spark and makes you memorable." },
  { name: "Closer", emoji: "🎯", color: "from-orange-500 to-amber-600", desc: "Bold, direct, decisive. Use when you're ready to move things forward." },
];

export default function Dashboard() {
  const createChat = useCreateChat();
  const [, setLocation] = useLocation();
  const { data: referrals } = useGetReferrals();
  const { data: chats } = useListChats();
  const { data: user } = useGetMe();
  const [copied, setCopied] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreateError(null);
    try {
      const chat = await createChat.mutateAsync({ data: { title: "New Conversation" } });
      if (!chat?.id) {
        setCreateError("Failed to create conversation. Please try again.");
        return;
      }
      setLocation(`/chat/${chat.id}`);
    } catch (err: any) {
      const msg = err?.message || "Failed to create conversation.";
      if (msg.includes("401") || msg.toLowerCase().includes("auth")) {
        setCreateError("Session expired. Please sign out and log back in.");
      } else {
        setCreateError(msg);
      }
    }
  };

  const copyReferral = () => {
    if (referrals?.referralCode) {
      navigator.clipboard.writeText(`https://quov.ai/signup?ref=${referrals.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const recentChats = chats?.slice(0, 4) ?? [];
  const totalChats = chats?.length ?? 0;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8 pb-16">

          {/* Welcome Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-1">
                  Hey there 👋
                </h1>
                <p className="text-muted-foreground">
                  {totalChats === 0
                    ? "Start your first analysis session to get personalized advice."
                    : `You've run ${totalChats} session${totalChats !== 1 ? "s" : ""}. Let's keep the momentum going.`}
                </p>
              </div>
              {user?.tier === "free" && (
                <Badge className="ml-4 px-3 py-1.5 text-xs hidden sm:flex items-center gap-1.5 bg-primary/10 border-primary/30 text-primary">
                  <Sparkles className="size-3" /> Free Plan
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Sessions", value: totalChats, icon: MessageSquarePlus, color: "text-primary" },
              { label: "Credits Left", value: user?.dailyCredits ?? "—", icon: Zap, color: "text-yellow-400" },
              { label: "Referrals", value: referrals?.referralCount ?? 0, icon: Users, color: "text-emerald-400" },
              { label: "Plan", value: user?.tier?.toUpperCase() ?? "FREE", icon: Star, color: "text-accent" },
            ].map((stat, i) => (
              <Card key={stat.label} className="p-4 bg-card/40">
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className={`size-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </Card>
            ))}
          </motion.div>

          {/* Main Actions Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Start New Chat */}
            <Card className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-card to-background border-primary/20 hover:border-primary/50 transition-colors group">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <MessageSquarePlus className="size-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">New Conversation</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-xs">
                Upload a screenshot or paste a message to get your Flirt Score™ and 3 perfect responses.
              </p>
              <Button size="lg" onClick={handleCreate} isLoading={createChat.isPending} className="w-full gap-2">
                Start Analyzing <ArrowRight className="size-4" />
              </Button>
              {createError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-destructive/10 rounded-xl px-4 py-3 border border-destructive/20 w-full">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
            </Card>

            {/* Referral Card */}
            <Card className="p-8 bg-card/40 border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-accent/20 text-accent">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Earn Free Credits</h2>
                    <p className="text-xs text-muted-foreground">10 credits per referral</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  Share your link. When a friend signs up using it, you both get 10 free credits — no strings attached.
                </p>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground mb-1">Your link</div>
                    <div className="font-mono text-white text-xs truncate max-w-[180px] sm:max-w-[220px]">
                      quov.ai/signup?ref={referrals?.referralCode || "…"}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={copyReferral} className="shrink-0 gap-1.5 ml-3">
                    <Copy className="size-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="pt-5 border-t border-border mt-5 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Referrals</span>
                <span className="text-2xl font-bold text-white">{referrals?.referralCount ?? 0}</span>
              </div>
            </Card>
          </motion.div>

          {/* Recent Chats */}
          {recentChats.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> Recent Sessions
                </h3>
                <span className="text-xs text-muted-foreground">{totalChats} total</span>
              </div>
              <div className="space-y-2">
                {recentChats.map((chat) => (
                  <Link key={chat.id} href={`/chat/${chat.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card hover:border-primary/30 transition-all group cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageSquarePlus className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{chat.title || "Conversation"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tone Guide */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Target className="size-4 text-muted-foreground" /> Tone Guide
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {TONE_GUIDE.map((tone) => (
                <Card key={tone.name} className="p-5 bg-card/30 border-white/5 hover:border-white/10 transition-colors">
                  <div className={`size-10 rounded-xl bg-gradient-to-br ${tone.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                    {tone.emoji}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{tone.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tone.desc}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Tips Carousel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <BookOpen className="size-4 text-muted-foreground" /> Dating Tips
            </h3>
            <Card className="p-6 bg-card/30 border-white/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-3xl">{TIPS[activeTip].icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{TIPS[activeTip].title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{TIPS[activeTip].body}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTip(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeTip ? "bg-primary w-6" : "bg-border w-3 hover:bg-muted-foreground"
                    }`}
                  />
                ))}
                <button
                  onClick={() => setActiveTip((prev) => (prev + 1) % TIPS.length)}
                  className="ml-auto text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  Next tip <ArrowRight className="size-3" />
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Upgrade Banner (free users only) */}
          {user?.tier === "free" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-6 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <TrendingUp className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Upgrade to Quov Pro</h3>
                    <p className="text-sm text-muted-foreground">Unlimited sessions, priority AI, and advanced analytics</p>
                  </div>
                </div>
                <Button className="shrink-0 gap-2" onClick={() => setLocation("/upgrade")}>
                  Upgrade Now <ArrowRight className="size-4" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Feature Highlights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-muted-foreground" /> What You Can Do
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: BarChart2, title: "Flirt Score™ Analysis", desc: "Get a 0–100 score rating her interest level, conversation energy, and engagement quality.", color: "text-violet-400" },
                { icon: Flame, title: "3-Tone Responses", desc: "Choose Charmer, Witty, or Closer — each crafted for a different strategy and stage of the conversation.", color: "text-pink-400" },
                { icon: Shield, title: "Screenshot OCR", desc: "Upload any dating app screenshot and we'll extract the text automatically for instant analysis.", color: "text-emerald-400" },
                { icon: Zap, title: "AI Cascade Models", desc: "We chain 5 leading AI models together — if one fails, the next takes over. Zero downtime.", color: "text-yellow-400" },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/20 hover:bg-card/40 transition-colors"
                >
                  <div className={`mt-0.5 shrink-0 ${feat.color}`}>
                    <feat.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feat.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer credit */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground/40">
              Quov AI is a product of <span className="text-muted-foreground/60">Striller Group</span> — built by Striller Code (ADE)
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
