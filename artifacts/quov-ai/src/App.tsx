import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsent } from "@/components/cookie-consent";
import { lazy, Suspense } from "react";

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ChatPage = lazy(() => import("@/pages/chat"));
const UpgradePage = lazy(() => import("@/pages/upgrade"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const StatsPage = lazy(() => import("@/pages/stats"));
const NotFound = lazy(() => import("@/pages/not-found"));
import { Onboarding } from "@/components/onboarding";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/chat/:chatId" component={ChatPage} />
        <Route path="/upgrade" component={UpgradePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/stats" component={StatsPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <CookieConsent />
        <Onboarding />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
