import { Link } from "wouter";
import { Button, Card, Badge } from "@/components/ui-elements";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  MessageSquareHeart, Zap, Upload, Check, ChevronRight,
  Star, Brain, Shield, TrendingUp, Users, Clock, BarChart3,
  Camera, Lightbulb, Target, ArrowRight, Quote, Plus, Minus,
  Flame, Sparkles, Heart, Lock
} from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const testimonials = [
  { name: "Jake M.", handle: "@jakemoves", avatar: "J", text: "I used to freeze up when she stopped replying. Now I have three perfect responses in seconds. Got a date within 24 hours.", rating: 5, tag: "Tinder" },
  { name: "Chris R.", handle: "@chrisrizz", avatar: "C", text: "The flirt score is scary accurate. Showed me she was actually really interested even when her texts seemed cold. Game changer.", rating: 5, tag: "Hinge" },
  { name: "Alex T.", handle: "@alextees", avatar: "A", text: "The 'Closer' tone helped me finally ask her out after 2 weeks of texting. She said yes immediately. Worth every penny.", rating: 5, tag: "Bumble" },
  { name: "Marcus K.", handle: "@mkingdom", avatar: "M", text: "Upload a screenshot, get 3 insane responses in 5 seconds. I feel like I have a dating coach in my pocket at all times.", rating: 5, tag: "Instagram DMs" },
  { name: "Ryan S.", handle: "@ryansets", avatar: "R", text: "My match rate went from 12% to 38% in one month. The AI actually understands context way better than I expected.", rating: 5, tag: "Tinder" },
  { name: "Derek P.", handle: "@derekp", avatar: "D", text: "I was skeptical at first but the analysis of her interest level was spot on every single time. Now I'm in a relationship lol.", rating: 5, tag: "Coffee Meets Bagel" },
];

const steps = [
  { icon: Camera, title: "Screenshot your chat", desc: "Take a screenshot of any dating app conversation — Tinder, Hinge, Bumble, Instagram, or anywhere else.", color: "from-violet-500/20 to-purple-500/10" },
  { icon: Brain, title: "AI analyzes everything", desc: "Our cascade of AI models reads tone, energy, interest level, and context to understand the full picture.", color: "from-pink-500/20 to-rose-500/10" },
  { icon: Lightbulb, title: "Get perfect responses", desc: "Pick from Charmer, Witty, or Closer styles. Each response is crafted to move the conversation forward.", color: "from-orange-500/20 to-amber-500/10" },
  { icon: Heart, title: "Land the date", desc: "Send with confidence. Know exactly what to say and when. Watch your match-to-date rate skyrocket.", color: "from-emerald-500/20 to-teal-500/10" },
];

const features = [
  { icon: BarChart3, title: "Flirt Score™", desc: "Get a 0–100 interest score for every conversation so you always know where you stand and whether to push forward.", badge: "Proprietary" },
  { icon: Target, title: "3-Tone Responses", desc: "Charmer for smooth openers, Witty for playful banter, Closer for when it's time to seal the deal and get the number.", badge: "Core" },
  { icon: Upload, title: "OCR Screenshot Read", desc: "Just upload any chat screenshot. Our OCR extracts every word and feeds it to the AI — no copying and pasting needed.", badge: "Smart" },
  { icon: Zap, title: "Cascade AI Models", desc: "We chain 5 advanced AI models together. If one fails or gives a weak answer, the next one tries. Always the best possible output.", badge: "Powerful" },
  { icon: TrendingUp, title: "Interest Level Analysis", desc: "High, Medium, Low — we break down exactly how interested they are based on their word choice, response time cues, and energy.", badge: "Insightful" },
  { icon: Clock, title: "5-Second Turnaround", desc: "No waiting. From screenshot to three perfect responses in under 5 seconds. Never leave a good conversation hanging too long.", badge: "Fast" },
  { icon: Shield, title: "Private by Default", desc: "Your conversations never leave your session. We don't store, train on, or share your chat data. Zero retention policy.", badge: "Secure" },
  { icon: Users, title: "Referral Rewards", desc: "Invite friends and earn bonus credits. Share your unique link and get rewarded every time someone joins Quov AI.", badge: "Free Credits" },
];

const faqs = [
  { q: "What apps does Quov AI work with?", a: "Any app where you can take a screenshot — Tinder, Bumble, Hinge, OkCupid, Instagram DMs, WhatsApp, iMessage, Facebook Messenger, and more. If you can screenshot it, we can analyze it." },
  { q: "How accurate is the Flirt Score?", a: "The Flirt Score uses a combination of linguistic analysis, sentiment detection, and pattern recognition across thousands of conversation signals. It's a guide, not a guarantee — but users report it matching their gut feeling about 85–90% of the time." },
  { q: "Is my data private?", a: "Yes. We use a zero-retention policy. Your screenshots are processed in memory and discarded immediately. We don't train our AI on your conversations, and we don't sell your data. Period." },
  { q: "What's the difference between Charmer, Witty, and Closer?", a: "Charmer focuses on warmth and smooth confidence — great for openers and keeping things light. Witty uses humor and clever wordplay to create spark and personality. Closer is bold and direct — use it when you're ready to move things forward and ask for the date." },
  { q: "How many credits does the free plan include?", a: "The Free plan includes 3 credits per day, resetting every 24 hours. Each message you send uses 1 credit. Upgrade to Plus for 20 credits/day or Pro for unlimited." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. No lock-in, no cancellation fees. Cancel from your account at any time and your plan stays active until the end of your billing period." },
  { q: "Who built Quov AI?", a: "Quov AI is a product of Striller Group, founded by Striller Code (ADE). We build AI-powered tools that give everyday people an edge in the things that matter most." },
  { q: "What AI technology powers Quov AI?", a: "We use a proprietary AI cascade system — a chain of 5 top-tier language models from providers including Google, Meta, Mistral, OpenAI, and Anthropic. If one model is unavailable, the next takes over automatically. This means near-zero downtime and consistently great responses." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/app-logo.png`} alt="Logo" className="size-9 object-contain" />
            <span className="font-bold text-xl tracking-tight text-white">Quov AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5 gap-2">
                Start Free <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge className="mb-8 px-4 py-1.5 text-sm rounded-full bg-primary/10 border border-primary/20 text-primary backdrop-blur-md inline-flex items-center gap-2">
            <Flame className="size-3.5" /> The #1 AI Dating Coach — Trusted by 50,000+ users
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-bold leading-none tracking-tighter mb-6 text-white max-w-5xl"
        >
          Never run out of<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
            things to say.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
        >
          Upload any chat screenshot. Get an instant flirt score, interest analysis, and three perfectly crafted replies — in under 5 seconds. Stop guessing. Start winning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-8 group text-base rounded-full">
              Start Chatting Free
              <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-emerald-500" /> No credit card required
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          {[["50,000+", "Users"], ["4.9★", "Avg Rating"], ["2M+", "Messages Analyzed"], ["< 5s", "Response Time"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{num}</div>
              <div className="text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">From screenshot to perfect reply<br className="hidden md:block" /> in 4 steps</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">No setup. No guesswork. Just results.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" style={{ width: "calc(100% - 2.5rem)", left: "calc(100% - 0.5rem)" }} />
                  )}
                  <Card className={`p-7 h-full bg-gradient-to-br ${step.color} border-white/5 hover:border-white/10 transition-all`}>
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                      <step.icon className="size-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">Step {i + 1}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </Card>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO / MOCKUP SECTION ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-violet-950/10 to-background" />
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">See it in action</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Real analysis. Real responses. Zero cringe.</p>
          </FadeIn>

          <FadeIn>
            <Card className="p-6 md:p-10 bg-card/60 border-white/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Fake chat screenshot */}
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Chat Screenshot</div>
                  <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-3 font-mono text-sm">
                    {[
                      { from: "her", msg: "haha ok fine you win this round 😏" },
                      { from: "you", msg: "I always do 😌" },
                      { from: "her", msg: "don't get too comfortable" },
                      { from: "her", msg: "what are you up to this weekend?" },
                    ].map((m, i) => (
                      <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${m.from === "you" ? "bg-primary/20 text-white" : "bg-white/8 text-white/80"}`}>
                          {m.msg}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis output */}
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">AI Analysis</div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">84</div>
                      <div>
                        <div className="font-bold text-white text-sm">Flirt Score™</div>
                        <div className="text-xs text-muted-foreground">Very High Interest</div>
                      </div>
                      <div className="ml-auto">
                        <Flame className="size-8 text-orange-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[["Energy", "Playful 🎯"], ["Interest", "High 🔥"], ["Risk", "Low ✅"]].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-white/5 border border-white/5 p-2 text-center">
                          <div className="text-muted-foreground mb-0.5">{k}</div>
                          <div className="font-medium text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Suggested Replies</div>
                    {[
                      { tone: "Charmer", emoji: "✨", msg: "Thinking a hike Saturday morning, then making dinner at mine. You should join for both." },
                      { tone: "Witty", emoji: "😂", msg: "My weekend plans just upgraded themselves when you asked that question." },
                      { tone: "Closer", emoji: "🎯", msg: "Free Saturday evening. Come find out how comfortable you should be." },
                    ].map((r) => (
                      <div key={r.tone} className="rounded-xl bg-white/5 border border-white/5 p-3">
                        <div className="text-xs text-muted-foreground mb-1">{r.emoji} {r.tone}</div>
                        <div className="text-sm text-white">{r.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything you need to win</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for modern dating. Powered by the most advanced AI models available.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <Card className="p-6 h-full bg-card/40 border-white/5 hover:border-primary/20 hover:bg-card/60 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <f.icon className="size-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{f.badge}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Social Proof</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Real people. Real results.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">50,000+ users have leveled up their dating game with Quov AI.</p>
          </FadeIn>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.07} className="break-inside-avoid">
                <Card className="p-6 bg-card/50 border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.handle}</div>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium shrink-0">{t.tag}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="size-4 text-primary/40 mb-2" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Pick your level</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start free. Upgrade when you're ready. Cancel anytime.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free", price: "$0", period: "/mo", tag: null,
                desc: "Test the waters.",
                features: ["3 credits per day", "Screenshot OCR", "3-tone responses", "Flirt Score™", "Basic analysis"],
                cta: "Get Started Free", variant: "outline" as const,
              },
              {
                name: "Plus", price: "$8", period: "/mo", tag: "Best Value",
                desc: "For the consistent dater.",
                features: ["20 credits per day", "Everything in Free", "Priority AI cascade", "Advanced analysis", "Referral rewards", "Email support"],
                cta: "Upgrade to Plus", variant: "default" as const,
                highlight: false,
              },
              {
                name: "Pro", price: "$15", period: "/mo", tag: "Most Popular",
                desc: "Unlimited rizz. No limits.",
                features: ["Unlimited credits", "Everything in Plus", "Fastest AI models", "Multi-screenshot batches", "Priority support", "Early access to new features"],
                cta: "Go Pro", variant: "default" as const,
                highlight: true,
              },
            ].map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Card className={`p-8 h-full flex flex-col relative ${plan.highlight ? "border-primary/50 bg-gradient-to-b from-primary/10 to-card shadow-2xl shadow-primary/10 md:-translate-y-3" : "border-white/10 bg-card/40"}`}>
                  {plan.tag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 py-1 text-xs bg-primary text-primary-foreground border-primary">{plan.tag}</Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-muted-foreground mb-1">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <Check className={`size-4 shrink-0 ${plan.highlight ? "text-primary" : "text-emerald-500"}`} />
                        <span className={plan.highlight ? "text-white" : "text-muted-foreground"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant={plan.highlight ? "default" : "outline"} className="w-full">{plan.cta}</Button>
                  </Link>
                </Card>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-12 text-center text-sm text-muted-foreground">
            <Lock className="size-4 inline mr-2 text-emerald-500" />
            Secure payment. Cancel anytime. No hidden fees.
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">FAQ</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Common questions</h2>
            <p className="text-muted-foreground">Everything you need to know before getting started.</p>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <Card
                  className="border-white/5 bg-card/40 overflow-hidden cursor-pointer hover:border-white/10 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="p-6 flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-white text-sm leading-relaxed">{faq.q}</h3>
                    <button className="shrink-0 size-5 rounded-full bg-white/5 flex items-center justify-center mt-0.5">
                      {openFaq === i ? <Minus className="size-3 text-primary" /> : <Plus className="size-3 text-muted-foreground" />}
                    </button>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary/20 via-card to-accent/10 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
              <Sparkles className="size-12 text-primary mx-auto mb-6 relative z-10" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
                Stop leaving good conversations on read.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg relative z-10">
                Join 50,000+ users who never run out of things to say. Start free — no card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 px-10 rounded-full text-base group">
                    Start Free Today
                    <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/app-logo.png`} alt="Quov AI" className="size-7 object-contain" />
            <span className="font-bold text-white">Quov AI</span>
            <span className="hidden sm:block">— The #1 AI Dating Assistant</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="text-center md:text-right">
            <div>© {new Date().getFullYear()} Quov AI by <span className="text-white/70">Striller Group</span>. All rights reserved.</div>
            <div className="text-xs mt-0.5 text-muted-foreground/50">Founded by Striller Code (ADE)</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
