import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { User, Settings, BarChart3, Target, Zap, Award, Save, Lock, ArrowLeft, ShieldAlert, LogOut, CheckCircle2, Trophy } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Pie, PieChart, Cell, Tooltip } from "recharts";
import { ActivityCalendar } from "react-activity-calendar";
import { subDays, format } from "date-fns";

import api from "../api/axios";
import { QUESTION_BANK } from "../data/questions";
import { getAvatarUrl } from "../utils/avatar";
import BadgeRenderer from "../components/BadgeRenderer";
import MissionIntel from "../components/MissionIntel"; // Import the Intel component

const COLORS = ["#10b981", "#fbbf24", "#f43f5e"];

const AVATAR_OPTIONS = [
  { name: 'Robot',       url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Felix&backgroundColor=0f172a' },
  { name: 'Adventurer',  url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Lucky&backgroundColor=0f172a' },
  { name: 'Lorelei',     url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Mimi&backgroundColor=0f172a' },
  { name: 'Avatar',      url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&backgroundColor=0f172a' },
];

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ radar: [], pie: [], total: 0, easy: 0, med: 0, hard: 0, heatmapData: [] });
  const [gameStats, setGameStats] = useState({ level: 1, title: "Pattern Solver", badges: [], solvedCount: 0 });

  const [identityForm, setIdentityForm] = useState({ username: user?.username || "", avatar: user?.avatar || AVATAR_OPTIONS.url });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [settingsMsg, setSettingsMsg] = useState({ type: "", text: "" });
  const [identityLoading, setIdentityLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notesRes, statsRes] = await Promise.all([api.get("/notes"), api.get("/users/profile-stats")]);
      const notes = notesRes.data;
      setGameStats(statsRes.data);

      const activityMap = {};
      notes.forEach(note => {
        const dateStr = note.createdAt ? note.createdAt.split('T') : new Date().toISOString().split('T');
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      });

      const heatmap = [];
      for (let i = 365; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const count = activityMap[date] || 0;
        let level = 0;
        if (count === 1) level = 1;
        if (count === 2) level = 2;
        if (count >= 3 && count <= 4) level = 3;
        if (count >= 5) level = 4;
        heatmap.push({ date, count, level });
      }

      const radarData = Object.keys(QUESTION_BANK).map(topicId => {
        const total = QUESTION_BANK[topicId]?.length || 1;
        const solved = notes.filter(n => n.topic === topicId).length;
        return { subject: topicId.replace(/-/g, ' ').toUpperCase(), score: Math.round((solved / total) * 100) };
      }).filter(d => d.score > 0);

      const diffs = { Easy: 0, Medium: 0, Hard: 0 };
      notes.forEach(n => {
        const q = Object.values(QUESTION_BANK).flat().find(q => q.id === n.questionId);
        if (q) diffs[q.difficulty]++;
      });

      setStats({
        radar: radarData,
        pie: [{ name: "Easy", value: diffs.Easy }, { name: "Medium", value: diffs.Medium }, { name: "Hard", value: diffs.Hard }].filter(d => d.value > 0),
        total: notes.length,
        easy: diffs.Easy, med: diffs.Medium, hard: diffs.Hard,
        heatmapData: heatmap
      });
    } catch (err) { setError("Database sync failed."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  const handleUpdateIdentity = async (e) => {
    e.preventDefault();
    setIdentityLoading(true);
    try {
      const res = await api.put("/users/profile", identityForm);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setSettingsMsg({ type: "success", text: "Profile updated!" });
    } catch (err) { setSettingsMsg({ type: "error", text: "Update failed." }); } finally { setIdentityLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.put("/users/profile", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setSettingsMsg({ type: "success", text: "Password changed!" });
    } catch (err) { setSettingsMsg({ type: "error", text: "Security update failed." }); } finally { setPasswordLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-brand">SYNCING PROFILE...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#1e1e1e] p-6 shrink-0">
        <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground mb-8 uppercase tracking-widest">
          <ArrowLeft size={14} className="mr-2" /> Back
        </Link>
        <div className="space-y-1.5">
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "intel", label: "Mission Intel", icon: Trophy }, // NEW TAB
            { id: "settings", label: "Settings", icon: Settings }
          ].map((t) => (
            <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-brand/20 text-brand shadow-lg" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* OVERVIEW TAB - REFINED SCALE */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Header - Shrunk from text-5xl to text-3xl, p-10 to p-8 */}
              <div className="relative overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[100px]"></div>
                <div className="relative shrink-0">
                  <img src={getAvatarUrl(user)} className="h-24 w-24 rounded-2xl bg-slate-800 object-cover shadow-xl border-2 border-white/10" alt="Avatar" />
                  <div className="absolute -bottom-1.5 -right-1.5 bg-brand text-white p-2 rounded-lg shadow-lg ring-2 ring-background"><Award size={18} /></div>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">{user?.username}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                    <span className="text-sm font-black text-brand italic bg-brand/10 px-2 py-0.5 rounded border border-brand/20 tracking-widest uppercase">LVL {gameStats.level}</span>
                    <span className="text-sm font-bold text-muted-foreground tracking-tight">{gameStats.title}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black rounded-full border border-orange-500/20 uppercase tracking-widest">
                      <Zap size={12} fill="currentColor" /> {gameStats.streak} Day Streak
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Shrunk text sizes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-6 rounded-3xl border border-white/5 bg-card/40 shadow-lg flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Solved Total</p>
                    <h2 className="text-6xl font-black text-foreground tabular-nums tracking-tighter">{stats.total}</h2>
                  </div>
                  <div className="mt-6 space-y-2">
                    {[['Easy', stats.easy, 'text-emerald-400', 'bg-emerald-500/5'], ['Medium', stats.med, 'text-amber-400', 'bg-amber-500/5'], ['Hard', stats.hard, 'text-rose-400', 'bg-rose-500/5']].map(([l, v, c, b]) => (
                      <div key={l} className={`flex justify-between items-center p-3 rounded-xl ${b} border border-white/5`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${c}`}>{l}</span>
                        <span className="text-xl font-black text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 rounded-3xl border border-white/5 bg-card/40 shadow-lg overflow-x-auto flex flex-col justify-between">
                  <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-brand" /> Neural Activity Sync
                  </h3>
                  <div className="flex-1 flex items-center justify-center bg-[#0f172a]/30 p-4 rounded-2xl border border-white/5">
                    <ActivityCalendar 
                      data={stats.heatmapData}
                      theme={{ dark: ['#1e293b', '#4f46e5', '#4338ca', '#3730a3', '#312e81'] }}
                      colorScheme="dark"
                      fontSize={11}
                      blockRadius={2}
                    />
                  </div>
                </div>
              </div>

              {/* Achievements Overview */}
              <div className="rounded-3xl border border-white/5 bg-card/40 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-2">
                  <Award size={16} className="text-brand" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Achievements</h3>
                </div>
                <div className="p-6">
                  <BadgeRenderer badges={gameStats.badges} totalSolved={stats.total} />
                </div>
              </div>
            </div>
          )}

          {/* MISSION INTEL TAB */}
          {activeTab === "intel" && <MissionIntel />}

          {/* ANALYTICS & SETTINGS remain exactly as before... */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="p-6 bg-card/40 border border-white/5 rounded-3xl shadow-lg">
                 <h2 className="text-sm font-black uppercase tracking-widest mb-6">Mastery Radar</h2>
                 <div className="h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart data={stats.radar}>
                       <PolarGrid stroke="#334155" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                       <Radar name="Mastery" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                       <Tooltip />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
               {/* Add Confidence Mix Pie Chart here if needed */}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-6 bg-card/40 border border-white/5 rounded-3xl">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6">Identity Settings</h2>
                <form onSubmit={handleUpdateIdentity} className="space-y-4">
                  <input type="text" value={identityForm.username} onChange={(e) => setIdentityForm({ ...identityForm, username: e.target.value })} 
                    className="w-full bg-background border border-white/10 p-3 rounded-xl outline-none focus:border-brand text-sm" />
                  <button type="submit" className="w-full bg-brand py-3 rounded-xl font-bold">Update Profile</button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}