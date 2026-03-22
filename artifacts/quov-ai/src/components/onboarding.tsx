import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, MessageSquare, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui-elements";

const STORAGE_KEY = "quov_onboarded";

const STEPS = [
  {
    icon: <MessageSquare className="size-10 text-primary" />,
    title: "Paste any message",
    desc: "Copy a message from Tinder, Instagram, WhatsApp — paste it here and get instant AI analysis with a Flirt Score™.",
    tip: "Try: \"She said: hey, how was your weekend?\"",
  },
  {
    icon: <Upload className="size-10 text-accent" />,
    title: "Upload screenshots",
    desc: "Take a screenshot of your conversation and upload it. Our OCR reads the text automatically — no typing needed.",
    tip: "Works with any dating app screenshot.",
  },
  {
    icon: <Sparkles className="size-10 text-yellow-400" />,
    title: "Pick your tone",
    desc: "Get 3 AI-crafted responses: Charmer (warm), Witty (playful), or Closer (bold). Tap any to use it instantly.",
    tip: "Switch tones anytime — each one fits a different moment.",
  },
];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={finish}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto p-8 relative">
              <button onClick={finish} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
                <X className="size-5" />
              </button>

              {/* Step dots */}
              <div className="flex gap-1.5 mb-8">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-6" : i < step ? "bg-primary/50 w-3" : "bg-border w-3"}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="size-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                    {STEPS[step].icon}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-3">{STEPS[step].title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">{STEPS[step].desc}</p>
                  <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm text-muted-foreground border border-border/50">
                    💡 {STEPS[step].tip}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8">
                <button onClick={finish} className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Skip tour
                </button>
                <Button onClick={next} className="gap-2">
                  {step < STEPS.length - 1 ? <><span>Next</span><ArrowRight className="size-4" /></> : <><Check className="size-4" /><span>Let's go</span></>}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
