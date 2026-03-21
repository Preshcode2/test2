import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageSquare, LogOut, Plus, Menu, X, Coins, Sparkles, AlertCircle } from "lucide-react";
import { useGetMe, useListChats, useCreateChat } from "@workspace/api-client-react";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: chats, isLoading: isChatsLoading } = useListChats();
  const createChat = useCreateChat();
  const logout = useLogout();

  if (isUserLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!user) {
    window.location.replace("/login");
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  const handleCreateChat = async () => {
    setSidebarError(null);
    try {
      const chat = await createChat.mutateAsync({ data: { title: "New Conversation" } });
      if (!chat?.id) {
        setSidebarError("Could not create chat. Please try again.");
        return;
      }
      setLocation(`/chat/${chat.id}`);
      setMobileOpen(false);
    } catch (err: any) {
      setSidebarError(err?.message?.includes("401") ? "Session expired — please sign out and log back in." : "Failed to create chat.");
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/app-logo.png`} alt="Quov AI" className="size-8 object-contain" />
          <span className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Quov AI</span>
        </Link>
        
        <Button 
          onClick={handleCreateChat}
          className="w-full mt-8 justify-start gap-3 bg-card border border-white/10 hover:border-primary/50 text-foreground"
          variant="outline"
          isLoading={createChat.isPending}
        >
          <Plus className="size-4 text-primary" />
          New Conversation
        </Button>
        {sidebarError && (
          <div className="mt-2 flex items-start gap-2 text-xs text-red-400 bg-destructive/10 rounded-xl px-3 py-2.5 border border-destructive/20">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <span>{sidebarError}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Chats</div>
        {isChatsLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">Loading...</div>
        ) : chats?.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">No chats yet</div>
        ) : (
          chats?.map((chat) => {
            const isActive = location === `/chat/${chat.id}`;
            return (
              <Link key={chat.id} href={`/chat/${chat.id}`} onClick={() => setMobileOpen(false)}>
                <div className={cn(
                  "group flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="truncate">{chat.title || "New Conversation"}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className="p-4 mt-auto">
        <div className="rounded-2xl bg-secondary/50 p-4 border border-border/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles className="size-16" /></div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="size-4 text-accent" />
            <span className="font-semibold text-sm text-white">{user.dailyCredits} Credits Left</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">You are on the <span className="text-primary font-medium uppercase">{user.tier}</span> plan.</p>
          {user.tier === 'free' && (
             <Button size="sm" className="w-full text-xs h-8" onClick={() => setLocation("/upgrade")}>Upgrade to Pro</Button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                {user.email.charAt(0).toUpperCase()}
             </div>
             <div className="text-sm truncate max-w-[120px] font-medium text-white/80">{user.email}</div>
          </div>
          <button onClick={() => logout.mutate()} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Log out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border/50 bg-sidebar/50 backdrop-blur-xl relative z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-border z-50 shadow-2xl md:hidden"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-4 text-muted-foreground hover:text-white">
                <X className="size-6" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-foreground">
               <Menu className="size-6" />
             </button>
             <span className="font-display font-bold text-lg">Quov AI</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
           {children}
        </div>
      </main>
    </div>
  );
}
