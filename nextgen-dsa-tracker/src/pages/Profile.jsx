import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { User, Settings, BarChart3, Target, Zap, Award, Save, Lock, ArrowLeft, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Pie, PieChart, Cell, Tooltip } from "recharts";
import { ActivityCalendar } from "react-activity-calendar";
import { subDays, format } from "date-fns"; // ⚡ NEW IMPORT

import api from "../api/axios";
import { QUESTION_BANK } from "../data/questions";
import { getAvatarUrl } from "../utils/avatar";
import BadgeRenderer from "../components/BadgeRenderer";

const COLORS = ["#10b981", "#fbbf24", "#f43f5e"];

// ✅ Avatar options outside component to avoid re-renders
const AVATAR_OPTIONS = [
  { name: 'Robot',       url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Felix&backgroundColor=0f172a' },
  { name: 'Adventurer',  url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Lucky&backgroundColor=0f172a' },
  { name: 'Lorelei',     url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Mimi&backgroundColor=0f172a' },
  { name: 'Avatar',      url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&backgroundColor=0f172a' },
  { name: 'Robot 2',     url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Aneka&backgroundColor=0f172a' },
  { name: 'Pixel',       url: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Hero&backgroundColor=0f172a' },
  { name: 'Notionists',  url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Prashant&backgroundColor=0f172a' },
  { name: 'Shapes',      url: 'https://api.dicebear.com/9.x/shapes/svg?seed=AlgoMemo&backgroundColor=0f172a' },
];

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ⚡ Added heatmapData to stats state
  const [stats, setStats] = useState({ radar: [], pie: [], total: 0, easy: 0, med: 0, hard: 0, heatmapData: [] });
  const [gameStats, setGameStats] = useState({ level: 1, title: "Pattern Solver", badges: [], solvedCount: 0 });

  // ⚡ FIXED typo: AVATAR_OPTIONS.url instead of AVATAR_OPTIONS.url
  const [identityForm, setIdentityForm] = useState({ username: user?.username || "", avatar: user?.avatar || AVATAR_OPTIONS.url });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [settingsMsg, setSettingsMsg] = useState({ type: "", text: "" });
  const [identityLoading, setIdentityLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notesRes, statsRes] = await Promise.all([
        api.get("/notes"),
        api.get("/users/profile-stats")
      ]);

      const notes = notesRes.data;
      setGameStats(statsRes.data);

      // --- ⚡ HEATMAP LOGIC START ---
      const activityMap = {};
      notes.forEach(note => {
        // Fallback to today if note is missing a date
        const dateStr = note.createdAt ? note.createdAt.split('T') : new Date().toISOString().split('T');
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      });

      // Generate the last 365 days
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
      // --- ⚡ HEATMAP LOGIC END ---

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
        heatmapData: heatmap // ⚡ Save to state
      });
    } catch (err) {
      console.error(err);
      setError("Database is taking too long to respond. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  const showMsg = (type, text) => {
    setSettingsMsg({ type, text });
    setTimeout(() => setSettingsMsg({ type: "", text: "" }), 3000);
  };

  const handleUpdateIdentity = async (e) => {
    e.preventDefault();
    setIdentityLoading(true);
    try {
      const res = await api.put("/users/profile", identityForm);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      window.dispatchEvent(new Event("storage"));
      showMsg("success", "Profile updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.put("/users/profile", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showMsg("success", "Password updated successfully!");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row p-8 gap-8 animate-in fade-in duration-300">
      <aside className="w-full md:w-64 space-y-4 shrink-0">
        <div className="h-4 w-24 bg-white/10 rounded mb-8 animate-pulse"></div>
        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse"></div>
        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse"></div>
        <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse"></div>
      </aside>
      <main className="flex-1 max-w-6xl w-full space-y-6">
        <div className="h-40 w-full bg-card/40 rounded-3xl border border-white/5 animate-pulse flex items-center p-8 gap-6">
          <div className="h-28 w-28 bg-white/10 rounded-2xl shrink-0"></div>
          <div className="space-y-4 w-full max-w-sm">
            <div className="h-10 w-3/4 bg-white/10 rounded-lg"></div>
            <div className="h-6 w-1/2 bg-white/5 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-80 bg-card/40 rounded-3xl border border-white/5 animate-pulse"></div>
          <div className="lg:col-span-2 h-80 bg-card/40 rounded-3xl border border-white/5 animate-pulse"></div>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <ShieldAlert size={48} className="text-rose-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Connection Timeout</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-brand text-white rounded-xl font-bold">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#1e1e1e] p-6 shrink-0">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to App
        </Link>
        <div className="space-y-2">
          {["overview", "analytics", "settings"].map((t) => (
            <button key={t} onClick={() => setSearchParams({ tab: t })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === t ? "bg-brand/20 text-brand" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
              {t === "overview" && <User size={18} />}
              {t === "analytics" && <BarChart3 size={18} />}
              {t === "settings" && <Settings size={18} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="relative overflow-hidden flex flex-col md:flex-row items-center gap-8 p-10 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[100px]"></div>
                <div className="relative shrink-0">
                  <img src={getAvatarUrl(user)} className="h-32 w-32 rounded-3xl bg-slate-800 object-cover shadow-2xl border-2 border-white/10" alt="Avatar" />
                  <div className="absolute -bottom-2 -right-2 bg-brand text-white p-2.5 rounded-xl shadow-lg ring-4 ring-background"><Award size={24} /></div>
                </div>
                <div className="text-center md:text-left space-y-4">
                  <h1 className="text-5xl font-black tracking-tighter text-foreground italic uppercase">{user?.username}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                    <span className="text-xl font-black text-brand italic">LVL {gameStats.level}</span>
                    <span className="text-xl font-bold text-muted-foreground tracking-tight">{gameStats.title}</span>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 text-orange-500 text-xs font-black rounded-full border border-orange-500/20 uppercase tracking-widest">
                      <Zap size={14} fill="currentColor" /> {gameStats.streak} Day Streak
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Solved Total</p>
                    <h2 className="text-8xl font-black text-foreground tabular-nums tracking-tighter">{stats.total}</h2>
                  </div>
                  <div className="mt-10 space-y-3">
                    {[['Easy', stats.easy, 'text-emerald-400', 'bg-emerald-500/5'], ['Medium', stats.med, 'text-amber-400', 'bg-amber-500/5'], ['Hard', stats.hard, 'text-rose-400', 'bg-rose-500/5']].map(([l, v, c, b]) => (
                      <div key={l} className={`flex justify-between items-center p-4 rounded-2xl ${b} border border-white/5`}>
                        <span className={`text-sm font-black uppercase tracking-widest ${c}`}>{l}</span>
                        <span className="text-2xl font-black text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-card/40 shadow-xl overflow-hidden min-h-[400px]">
                  <div className="p-8 border-b border-white/5 bg-white/5"><h3 className="text-lg font-black uppercase tracking-widest">Achievements</h3></div>
                  <div className="p-2"><BadgeRenderer badges={gameStats.badges} totalSolved={stats.total} /></div>
                </div>
              </div>

              {/* ⚡ NEW: NEURAL ACTIVITY HEATMAP */}
              <div className="p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl overflow-x-auto">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-brand" /> Neural Activity Sync
                </h3>
                <div className="min-w-[750px] flex justify-center bg-[#0f172a]/50 p-6 rounded-2xl border border-white/5">
                  <ActivityCalendar 
                    data={stats.heatmapData.length > 0 ? stats.heatmapData : [{ date: new Date().toISOString().split('T'), count: 0, level: 0 }]}
                    theme={{
                      dark: ['#1e293b', '#4f46e5', '#4338ca', '#3730a3', '#312e81']
                    }}
                    colorScheme="dark"
                    labels={{
                      totalCount: '{{count}} problems solved in the last year',
                    }}
                    showWeekdayLabels={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h1 className="text-3xl font-bold mb-6">Progress & Analytics</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* ⚡ RADAR CHART FIX */}
                <div className="p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Target size={20} className="text-brand" /> Mastery Radar</h2>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="50%" data={stats.radar} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                        <Radar name="Mastery" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }} formatter={(v) => [`${v}%`, "Mastery"]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ⚡ PIE CHART FIX */}
                <div className="p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> Confidence Mix</h2>
                  <div className="h-[350px] flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.pie} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                          {stats.pie.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-4 text-xs font-bold uppercase tracking-widest">
                      {[['Easy', 'bg-emerald-500', 'text-emerald-400'], ['Medium', 'bg-amber-500', 'text-amber-400'], ['Hard', 'bg-rose-500', 'text-rose-400']].map(([l, b, t]) => (
                        <div key={l} className={`flex items-center gap-2 ${t}`}><span className={`h-3 w-3 rounded-full ${b}`}></span>{l}</div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
              <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

              {settingsMsg.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 font-bold text-sm ${settingsMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  {settingsMsg.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                  {settingsMsg.text}
                </div>
              )}

              {/* Identity Form */}
              <div className="p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User size={20} className="text-brand" /> Profile Identity
                </h2>
                <form onSubmit={handleUpdateIdentity} className="space-y-6">
                  
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden shadow-xl shrink-0">
                      <img
                        src={identityForm.avatar || AVATAR_OPTIONS.url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = AVATAR_OPTIONS.url; }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Avatar Preview</p>
                      <p className="text-xs text-muted-foreground mt-1">Click any avatar below to select it</p>
                    </div>
                  </div>

                  {/* ✅ Avatar Grid Chooser */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose Avatar</label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => setIdentityForm({ ...identityForm, avatar: av.url })}
                          className={`relative p-1.5 rounded-xl border-2 transition-all hover:scale-105 ${
                            identityForm.avatar === av.url
                              ? 'border-brand shadow-lg shadow-brand/30 scale-105'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            className="h-14 w-14 rounded-lg bg-slate-800 object-cover"
                          />
                          {identityForm.avatar === av.url && (
                            <div className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-brand rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Username</label>
                    <input
                      type="text"
                      value={identityForm.username}
                      onChange={(e) => setIdentityForm({ ...identityForm, username: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:border-brand outline-none transition-all"
                      required
                    />
                  </div>

                  <button type="submit" disabled={identityLoading} className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                    <Save size={18} /> {identityLoading ? "Saving..." : "Save Identity"}
                  </button>
                </form>
              </div>

              {/* Password Form */}
              <div className="p-8 rounded-3xl border border-white/5 bg-card/40 shadow-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-brand" /> Security
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:border-brand outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground focus:border-brand outline-none"
                      required
                    />
                  </div>
                  <button type="submit" disabled={passwordLoading} className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">
                    <Save size={18} /> {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}