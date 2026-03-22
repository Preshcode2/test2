import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui-elements";
import { useGetMe, useListChats, useGetReferrals } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, MessageSquare, Zap, Users, Calendar, TrendingUp, Star, BarChart2 } from "lucide-react";

function useStats() {
  return useQuery({
    queryKey: ["/api/profile/stats"],
    queryFn: async () => {
      const res = await fetch("/api/profile/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json() as Promise<{
        totalChats: number; totalMessages: number; streak: number;
        memberDays: number; tier: string; dailyCredits: number;
      }>;
    },
  });
}

export default function StatsPage() {
  const { data: user } = useGetMe();
  const { data: chats } = useListChats();
  const { data: referrals } = useGetReferrals();
  const { data: stats } = useStats();

  // Chat activity by day of week
  const dayActivity = Array(7).fill(0);
  chats?.forEach(c => {
    const d = new Date(c.createdAt).getDay();
    dayActivity[d]++;
  });
  const maxDay = Math.max(...dayActivity, 1);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Chats per week (last 8 weeks)
  const weeklyData: number[] = Array(8).fill(0);
  const now = Date.now();
  chats?.forEach(c => {
    const weeksAgo = Math.floor((now - new Date(c.createdAt).getTime()) / (7 * 86400000));
    if (weeksAgo < 8) weeklyData[7 - weeksAgo]++;
  });
  const maxWeek = Math.max(...weeklyData, 1);

  const statCards = [
    { label: "Total Sessions", value: stats?.totalChats ?? chats?.length ?? 0, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
    { label: "Messages Sent", value: stats?.totalMessages ?? 0, icon: BarChart2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Day Streak 🔥", value: stats?.streak ?? 0, icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Referrals", value: referrals?.referralCount ?? 0, icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Credits Left", value: user?.dailyCredits ?? 0, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Member Days", value: stats?.memberDays ?? 0, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full pb-16 space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-white mb-1">Your Stats</h1>
            <p className="text-muted-foreground">Track your progress and activity</p>
          </motion.div>

          {/* Streak banner */}
          {(stats?.streak ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="p-5 bg-gradient-to-r from-orange-500/10 via-card to-yellow-500/10 border-orange-500/20 flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="font-display font-bold text-white text-lg">{stats?.streak}-day streak!</p>
                  <p className="text-sm text-muted-foreground">Keep it up — consistency is the key to mastery.</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Stat cards */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((s) => (
              <Card key={s.label} className="p-5 bg-card/40">
                <div className={`size-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`size-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </Card>
            ))}
          </motion.div>

          {/* Weekly activity chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-6 bg-card/40">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="font-semibold text-white">Weekly Activity</h3>
                <span className="text-xs text-muted-foreground ml-auto">Last 8 weeks</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {weeklyData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-colors"
                      style={{ height: `${Math.max(4, (v / maxWeek) * 80)}px` }}
                      title={`${v} session${v !== 1 ? "s" : ""}`}
                    />
                    <span className="text-[10px] text-muted-foreground">{i === 7 ? "Now" : `W${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Day of week heatmap */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 bg-card/40">
              <div className="flex items-center gap-2 mb-6">
                <Star className="size-4 text-accent" />
                <h3 className="font-semibold text-white">Most Active Days</h3>
              </div>
              <div className="flex gap-2">
                {dayLabels.map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-lg transition-colors"
                      style={{
                        height: "48px",
                        background: `rgba(var(--primary-rgb, 139, 92, 246), ${Math.max(0.08, dayActivity[i] / maxDay * 0.9)})`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Plan info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-6 bg-card/40 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <p className="text-2xl font-display font-bold text-white uppercase">{user?.tier ?? "Free"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Daily Credits</p>
                <p className="text-2xl font-display font-bold text-yellow-400">{user?.dailyCredits ?? 0}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
