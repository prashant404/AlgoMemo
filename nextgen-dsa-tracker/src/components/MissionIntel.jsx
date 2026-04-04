import React from 'react';
import { Target, Zap, Award, Flame, ShieldAlert, Trophy } from 'lucide-react';

export default function MissionIntel() {
  return (
    <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand/20 rounded-lg text-brand">
          <Trophy size={24} />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Mission Intel: Progression</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranks & Titles */}
        <div className="p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl">
          <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">Neural Rankings</h4>
          <div className="space-y-4">
            {[
              { level: "1-3", title: "Pattern Solver", desc: "Starting the neural synchronization." },
              { level: "4-6", title: "Pattern Architect", desc: "Structuring complex data pathways." },
              { level: "7-9", title: "Pattern Grandmaster", desc: "Elite algorithmic intuition." },
              { level: "10", title: "DSA Guru", desc: "Absolute mastery achieved." }
            ].map((r) => (
              <div key={r.title} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-brand/30 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-0.5">Rank {r.level}</p>
                  <p className="font-bold text-foreground">{r.title}</p>
                </div>
                <p className="text-[10px] text-muted-foreground text-right max-w-[140px] leading-relaxed italic">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 rounded-xl bg-brand/5 border border-brand/10 text-center">
            <p className="text-[10px] text-brand font-bold uppercase tracking-widest">Growth Logic: +1 Level every 5 notes saved</p>
          </div>
        </div>

        {/* Badge Requirements */}
        <div className="p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl">
          <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">Badge Database</h4>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: "Consistency Hero", icon: <Flame size={18}/>, req: "Maintain a 7-Day Streak", color: "text-orange-400", bg: "bg-orange-500/10" },
              { name: "Hard Target", icon: <ShieldAlert size={18}/>, req: "Solve 1 'Hard' Complexity Problem", color: "text-rose-400", bg: "bg-rose-500/10" },
              { name: "Topic Master", icon: <Target size={18}/>, req: "Log 10 Problems in a Single Category", color: "text-brand", bg: "bg-brand/10" }
            ].map((b) => (
              <div key={b.name} className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${b.bg} ${b.color} shadow-lg`}>
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Objective: <span className={b.color}>{b.req}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}