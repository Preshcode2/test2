import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button, Input, Card } from "@/components/ui-elements";
import { useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { User, Mail, Lock, Trash2, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Section = "profile" | "password" | "danger";

export default function SettingsPage() {
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<Section>("profile");

  // Profile form
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      queryClient.setQueryData(getGetMeQueryKey(), data);
      setProfileMsg({ ok: true, text: "Profile updated successfully" });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "Passwords don't match" });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwMsg({ ok: true, text: "Password changed successfully" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      queryClient.clear();
      window.location.replace("/");
    } catch (err: any) {
      setDeleteMsg(err.message);
      setDeleteLoading(false);
    }
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="size-4" /> },
    { id: "password", label: "Password", icon: <Lock className="size-4" /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 className="size-4" /> },
  ];

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-white mb-1">Account Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your profile, security, and account</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Nav */}
            <nav className="md:w-52 shrink-0 flex md:flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left",
                    section === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">{item.icon}{item.label}</span>
                  <ChevronRight className="size-3.5 opacity-50" />
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {section === "profile" && (
                <Card className="p-6">
                  <h2 className="font-display font-semibold text-white text-lg mb-1">Profile Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">Update your display name and email address</p>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="size-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shrink-0">
                      {(user?.displayName || user?.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user?.displayName || "No display name"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium uppercase">{user?.tier}</span>
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="space-y-4">
                    {profileMsg && (
                      <div className={cn("flex items-center gap-2 text-sm p-3 rounded-xl border", profileMsg.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-destructive/10 border-destructive/20 text-red-400")}>
                        {profileMsg.ok ? <CheckCircle className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                        {profileMsg.text}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Your name"
                          className="pl-10 bg-secondary/50 border-border"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 bg-secondary/50 border-border"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" isLoading={profileLoading} className="mt-2">Save Changes</Button>
                  </form>
                </Card>
              )}

              {section === "password" && (
                <Card className="p-6">
                  <h2 className="font-display font-semibold text-white text-lg mb-1">Change Password</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {user?.displayName ? "Update your account password" : "Set a password to enable email login"}
                  </p>
                  <form onSubmit={changePassword} className="space-y-4">
                    {pwMsg && (
                      <div className={cn("flex items-center gap-2 text-sm p-3 rounded-xl border", pwMsg.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-destructive/10 border-destructive/20 text-red-400")}>
                        {pwMsg.ok ? <CheckCircle className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                        {pwMsg.text}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10 bg-secondary/50 border-border" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input type="password" placeholder="Min. 8 characters" className="pl-10 bg-secondary/50 border-border" value={newPw} onChange={e => setNewPw(e.target.value)} minLength={8} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input type="password" placeholder="Repeat new password" className="pl-10 bg-secondary/50 border-border" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                      </div>
                    </div>
                    <Button type="submit" isLoading={pwLoading} className="mt-2">Update Password</Button>
                  </form>
                </Card>
              )}

              {section === "danger" && (
                <Card className="p-6 border-destructive/30">
                  <h2 className="font-display font-semibold text-red-400 text-lg mb-1">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground mb-6">Permanently delete your account and all data. This cannot be undone.</p>
                  {deleteMsg && (
                    <div className="flex items-center gap-2 text-sm p-3 rounded-xl border bg-destructive/10 border-destructive/20 text-red-400 mb-4">
                      <AlertCircle className="size-4 shrink-0" />{deleteMsg}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80">Type <span className="font-mono text-red-400">DELETE</span> to confirm</label>
                    <Input
                      placeholder="DELETE"
                      className="bg-secondary/50 border-destructive/30 font-mono"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                    />
                    <Button
                      onClick={deleteAccount}
                      disabled={deleteConfirm !== "DELETE" || deleteLoading}
                      isLoading={deleteLoading}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      <Trash2 className="size-4 mr-2" /> Delete My Account
                    </Button>
                  </div>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
