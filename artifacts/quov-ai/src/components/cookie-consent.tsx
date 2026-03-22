import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, BarChart2, Settings } from "lucide-react";
import { Button } from "@/components/ui-elements";

const STORAGE_KEY = "quov_cookie_consent";

export type CookiePrefs = {
  essential: true;
  analytics: boolean;
  preferences: boolean;
};

export function getCookieConsent(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(prefs: CookiePrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const accept = () => {
    setCookieConsent({ essential: true, analytics: true, preferences: true });
    setVisible(false);
  };

  const decline = () => {
    setCookieConsent({ essential: true, analytics: false, preferences: false });
    setVisible(false);
  };

  const saveCustom = () => {
    setCookieConsent({ essential: true, analytics, preferences });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 p-5">
            {!showCustomize ? (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Cookie className="size-4 text-primary" />
                    </div>
                    <span className="font-display font-semibold text-white">We use cookies</span>
                  </div>
                  <button onClick={decline} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  We use cookies to keep you signed in, remember your preferences, and improve your experience. Your session data is stored securely in our database.
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={accept} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                    Accept all cookies
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowCustomize(true)} variant="outline" className="flex-1 text-sm">
                      Customize
                    </Button>
                    <Button onClick={decline} variant="outline" className="flex-1 text-sm">
                      Essential only
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display font-semibold text-white">Cookie preferences</span>
                  <button onClick={() => setShowCustomize(false)} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  {/* Essential - always on */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Essential</p>
                        <p className="text-xs text-muted-foreground">Login sessions, security</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-400 font-medium">Always on</span>
                  </div>
                  {/* Analytics */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-white">Analytics</p>
                        <p className="text-xs text-muted-foreground">Usage stats, performance</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAnalytics(v => !v)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${analytics ? "bg-primary" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${analytics ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {/* Preferences */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Settings className="size-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-white">Preferences</p>
                        <p className="text-xs text-muted-foreground">Theme, sidebar state</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreferences(v => !v)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${preferences ? "bg-primary" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${preferences ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
                <Button onClick={saveCustom} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                  Save preferences
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
