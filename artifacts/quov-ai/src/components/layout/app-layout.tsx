import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useListChats, useCreateChat, useDeleteChat, useGetMe } from "@workspace/api-client-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  MessageSquarePlus, Settings, BarChart2, LogOut, Pin, PinOff,
  Pencil, Check, X, Search, ChevronLeft, ChevronRight, Trash2,
} from "lucide-react";

const PINNED_KEY = "quov_pinned_chats";

function getPinned(): string[] {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) || "[]"); } catch { return []; }
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: chats, refetch: refetchChats } = useListChats();
  const { data: user } = useGetMe();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();

  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [pinned, setPinnedState] = useState<string[]>(getPinned);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
  }, [pinned]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleNewChat = async () => {
    try {
      const chat = await createChat.mutateAsync({ data: { title: "New Conversation" } });
      if (chat?.id) setLocation(`/chat/${chat.id}`);
    } catch {}
  };

  useKeyboardShortcuts([{ key: "k", meta: true, action: handleNewChat }]);

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
    queryClient.clear();
    setLocation("/");
  };

  const togglePin = (id: string) => {
    setPinnedState(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const commitRename = async (id: string) => {
    const title = renameValue.trim();
    if (title) {
      try {
        await fetch(`/api/chats/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title }),
        });
        refetchChats();
      } catch {}
    }
    setRenamingId(null);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await deleteChat.mutateAsync({ chatId: id });
    if (location === `/chat/${id}`) setLocation("/dashboard");
    refetchChats();
  };

  const filtered = (chats ?? []).filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );
  const pinnedChats = filtered.filter(c => pinned.includes(c.id));
  const unpinnedChats = filtered.filter(c => !pinned.includes(c.id));
  const activeChatId = location.startsWith("/chat/") ? location.split("/chat/")[1] : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className={cn(
        "flex flex-col bg-card/50 border-r border-border/50 transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-64"
      )}>
        <div className="flex items-center justify-between px-3 py-4 border-b border-border/50 shrink-0">
          {!collapsed && (
            <Link href="/dashboard">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/images/app-logo.png" alt="VelxoAI" className="size-7 rounded-lg object-cover" />
                <span className="font-display font-bold text-white text-sm">VelxoAI</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className={cn("p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <div className="px-2 pt-3 pb-2 shrink-0">
          <button
            onClick={handleNewChat}
            disabled={createChat.isPending}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary transition-all text-sm font-medium",
              collapsed && "justify-center px-0"
            )}
            title="New Conversation (Ctrl+K)"
          >
            <MessageSquarePlus className="size-4 shrink-0" />
            {!collapsed && <><span className="flex-1 text-left">New Conversation</span><kbd className="text-[10px] text-primary/60 font-mono">Ctrl+K</kbd></>}
          </button>
        </div>

        {!collapsed && (
          <div className="px-2 pb-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/50 border border-border/50">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-white">
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
          {!collapsed && pinnedChats.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 py-1.5">Pinned</p>
              {pinnedChats.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChatId === chat.id}
                  isPinned
                  isRenaming={renamingId === chat.id}
                  renameValue={renameValue}
                  renameInputRef={renameInputRef}
                  onRenameChange={setRenameValue}
                  onRenameCommit={() => commitRename(chat.id)}
                  onRenameCancel={() => setRenamingId(null)}
                  onStartRename={() => startRename(chat.id, chat.title || "")}
                  onTogglePin={() => togglePin(chat.id)}
                  onDelete={(e) => handleDeleteChat(chat.id, e)}
                />
              ))}
              {unpinnedChats.length > 0 && (
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 py-1.5 mt-2">Recent</p>
              )}
            </>
          )}
          {(collapsed ? filtered : unpinnedChats).map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              isPinned={pinned.includes(chat.id)}
              isRenaming={renamingId === chat.id}
              renameValue={renameValue}
              renameInputRef={renameInputRef}
              onRenameChange={setRenameValue}
              onRenameCommit={() => commitRename(chat.id)}
              onRenameCancel={() => setRenamingId(null)}
              onStartRename={() => startRename(chat.id, chat.title || "")}
              onTogglePin={() => togglePin(chat.id)}
              onDelete={(e) => handleDeleteChat(chat.id, e)}
              collapsed={collapsed}
            />
          ))}
          {!collapsed && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-8 px-4">
              {search ? "No chats match your search" : "No conversations yet"}
            </p>
          )}
        </div>

        <div className={cn("border-t border-border/50 p-2 space-y-0.5 shrink-0", collapsed && "flex flex-col items-center")}>
          <NavButton href="/stats" icon={<BarChart2 className="size-4" />} label="Stats" collapsed={collapsed} active={location === "/stats"} />
          <NavButton href="/settings" icon={<Settings className="size-4" />} label="Settings" collapsed={collapsed} active={location === "/settings"} />
          {!collapsed && user?.displayName && (
            <div className="px-3 py-1 text-xs text-muted-foreground truncate">{user.displayName}</div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-colors text-sm",
              collapsed && "justify-center px-0 w-10"
            )}
            title="Sign out"
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

interface ChatItemProps {
  chat: { id: string; title?: string | null; createdAt: string };
  isActive: boolean;
  isPinned: boolean;
  isRenaming: boolean;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onStartRename: () => void;
  onTogglePin: () => void;
  onDelete: (e: React.MouseEvent) => void;
  collapsed?: boolean;
}

function ChatItem({
  chat, isActive, isPinned, isRenaming, renameValue, renameInputRef,
  onRenameChange, onRenameCommit, onRenameCancel, onStartRename,
  onTogglePin, onDelete, collapsed,
}: ChatItemProps) {
  if (collapsed) {
    return (
      <Link href={`/chat/${chat.id}`}>
        <div
          className={cn(
            "size-9 mx-auto flex items-center justify-center rounded-lg transition-colors cursor-pointer mb-0.5",
            isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
          title={chat.title || "Conversation"}
        >
          <MessageSquarePlus className="size-4" />
        </div>
      </Link>
    );
  }

  return (
    <div className={cn(
      "group relative flex items-center rounded-lg px-2 py-2 transition-colors",
      isActive ? "bg-primary/15 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
    )}>
      {isRenaming ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onRenameCommit();
              if (e.key === "Escape") onRenameCancel();
            }}
            className="flex-1 min-w-0 bg-background/80 border border-primary/40 rounded px-2 py-0.5 text-xs text-white outline-none"
            maxLength={80}
          />
          <button onClick={onRenameCommit} className="text-green-400 hover:text-green-300 shrink-0 p-0.5">
            <Check className="size-3.5" />
          </button>
          <button onClick={onRenameCancel} className="text-muted-foreground hover:text-white shrink-0 p-0.5">
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <Link href={`/chat/${chat.id}`} className="flex-1 min-w-0 cursor-pointer">
            <span className="text-xs truncate block">{chat.title || "Conversation"}</span>
          </Link>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
            <button onClick={e => { e.preventDefault(); onStartRename(); }} className="p-1 rounded hover:bg-white/10" title="Rename">
              <Pencil className="size-3" />
            </button>
            <button onClick={e => { e.preventDefault(); onTogglePin(); }} className="p-1 rounded hover:bg-white/10" title={isPinned ? "Unpin" : "Pin"}>
              {isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
            </button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/20 hover:text-red-400" title="Delete">
              <Trash2 className="size-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface NavButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
}

function NavButton({ href, icon, label, collapsed, active }: NavButtonProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer",
          active ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5",
          collapsed && "justify-center px-0 w-10 mx-auto"
        )}
        title={collapsed ? label : undefined}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
}
