import { AppLayout } from "@/components/layout/app-layout";
import { Button, Card, Badge } from "@/components/ui-elements";
import {
  Bitcoin, CreditCard, Smartphone, ChevronRight, Lock, Shield, Sparkles, Check, ArrowLeft, Zap, Infinity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";

const PLANS = [
  {
    id: "plus",
    name: "Plus",
    price: "$9",
    period: "/month",
    credits: "20 credits/day",
    color: "from-blue-500 to-violet-600",
    badge: null,
    features: ["20 AI analysis sessions/day", "All 3 response tones", "Screenshot OCR", "Priority support", "Referral bonuses"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    credits: "Unlimited",
    color: "from-primary to-accent",
    badge: "Most Popular",
    features: ["Unlimited AI sessions", "All 3 response tones", "Screenshot OCR", "Advanced Flirt Score™ history", "Priority AI cascade", "Early access to new features", "Referral bonuses"],
  },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, color: "text-blue-400", desc: "Visa, Mastercard, Amex" },
  { id: "crypto", label: "Cryptocurrency", icon: Bitcoin, color: "text-orange-400", desc: "BTC, ETH, USDT & more" },
  { id: "apple", label: "Apple Pay", icon: Smartphone, color: "text-white", desc: "Pay with Touch ID or Face ID" },
  { id: "google", label: "Google Pay", icon: Smartphone, color: "text-green-400", desc: "Fast checkout with Google" },
];

export default function UpgradePage() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showMethods, setShowMethods] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowMethods(true);
  };

  const handleMethodClick = (methodId: string) => {
    setComingSoon(methodId);
  };

  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10 pb-20">

          {/* Back */}
          <button
            onClick={() => showMethods ? setShowMethods(false) : setLocation("/dashboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" /> {showMethods ? "Back to plans" : "Back to dashboard"}
          </button>

          <AnimatePresence mode="wait">

            {/* Plan Selection */}
            {!showMethods && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-10">
                  <Badge className="mb-4 px-3 py-1 text-xs rounded-full bg-primary/10 border border-primary/20 text-primary inline-flex items-center gap-1.5">
                    <Sparkles className="size-3" /> Upgrade Quov AI
                  </Badge>
                  <h1 className="text-3xl font-display font-bold text-white mb-3">Unlock Your Full Potential</h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    More sessions, unlimited responses, and priority AI. Choose the plan that fits your game.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {PLANS.map((p) => (
                    <Card
                      key={p.id}
                      className={`p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        p.badge ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card" : "border-white/5 bg-card/40"
                      }`}
                      onClick={() => handleSelectPlan(p.id)}
                    >
                      {p.badge && (
                        <div className="mb-4">
                          <Badge className="px-2.5 py-1 text-xs bg-primary/20 border-primary/30 text-primary">
                            ⭐ {p.badge}
                          </Badge>
                        </div>
                      )}
                      <div className={`inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br ${p.color} mb-4 shadow-lg`}>
                        {p.id === "pro" ? <Infinity className="size-6 text-white" /> : <Zap className="size-6 text-white" />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-3xl font-display font-bold text-white">{p.price}</span>
                        <span className="text-muted-foreground mb-1">{p.period}</span>
                      </div>
                      <div className="text-sm text-primary font-medium mb-5">{p.credits}</div>
                      <ul className="space-y-2.5 mb-6">
                        {p.features.map(f => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Check className="size-4 text-emerald-400 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full gap-2 bg-gradient-to-r ${p.color}`}>
                        Choose {p.name} <ChevronRight className="size-4" />
                      </Button>
                    </Card>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
                  <Lock className="size-3" /> Secure payment · Cancel anytime · No hidden fees
                </p>
              </motion.div>
            )}

            {/* Payment Method Selection */}
            {showMethods && (
              <motion.div
                key="methods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="max-w-lg mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Select Payment Method</h2>
                    <p className="text-muted-foreground text-sm">
                      Upgrading to <span className="text-primary font-medium">{plan?.name}</span> — {plan?.price}/month
                    </p>
                  </div>

                  {/* Order Summary */}
                  <Card className="p-5 bg-card/40 border-white/5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Quov AI {plan?.name}</span>
                      <span className="text-white font-semibold">{plan?.price}/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                      <span>Billed monthly · Cancel anytime</span>
                      <span className="flex items-center gap-1"><Shield className="size-3 text-emerald-400" /> Secure</span>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodClick(method.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/40 transition-all text-left group"
                      >
                        <div className="size-11 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                          <method.icon className={`size-5 ${method.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
                    <Lock className="size-3" /> All payments are encrypted and secure
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {comingSoon && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setComingSoon(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
            >
              <Card className="p-8 text-center bg-card border-primary/20 shadow-2xl shadow-primary/10">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                  <Sparkles className="size-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {PAYMENT_METHODS.find(m => m.id === comingSoon)?.label} payments are being set up and will be available very soon. Stay tuned!
                </p>
                <Button onClick={() => setComingSoon(null)} className="w-full">Got it</Button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
