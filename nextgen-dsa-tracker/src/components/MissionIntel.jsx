import React from 'react';
import { Target, Zap, Award, Flame, ShieldAlert, Trophy } from 'lucide-react';

export default function MissionIntel() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand/20 rounded-lg text-brand">
          <Trophy size={20} />
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Mission Intel: Neural Progression</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranks & Titles */}
        <div className="p-6 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Rank Hierarchy</h4>
          <div className="space-y-3">
            {[
              { level: "1-3", title: "Pattern Solver", desc: "Starting synchronization." },
              { level: "4-6", title: "Pattern Architect", desc: "Structuring pathways." },
              { level: "7-9", title: "Pattern Grandmaster", desc: "Elite intuition." },
              { level: "10", title: "DSA Guru", desc: "Absolute mastery." }
            ].map((r) => (
              <div key={r.title} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                <div>
                  <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-0.5">Rank {r.level}</p>
                  <p className="font-bold text-foreground text-sm">{r.title}</p>
                </div>
                <p className="text-[10px] text-muted-foreground text-right italic leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-2 rounded-lg bg-brand/5 border border-brand/10 text-center">
            <p className="text-[9px] text-brand font-black uppercase tracking-widest">Growth Engine: +1 LVL every 5 Notes</p>
          </div>
        </div>

        {/* Badge Database */}
        <div className="p-6 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-xl">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Neural Unlockables</h4>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: "Consistency Hero", icon: <Flame size={16}/>, req: "7-Day Streak", color: "text-orange-400", bg: "bg-orange-500/10" },
              { name: "Hard Target", icon: <ShieldAlert size={16}/>, req: "1 'Hard' Problem", color: "text-rose-400", bg: "bg-rose-500/10" },
              { name: "Topic Master", icon: <Target size={16}/>, req: "10 Notes in 1 Topic", color: "text-brand", bg: "bg-brand/10" }
            ].map((b) => (
              <div key={b.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.bg} ${b.color}`}>
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Target: <span className={b.color}>{b.req}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}