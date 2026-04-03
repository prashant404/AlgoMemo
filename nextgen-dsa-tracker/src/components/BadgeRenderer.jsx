// src/components/BadgeRenderer.jsx
import React from 'react';
import { Flame, Target, ShieldAlert, Award } from 'lucide-react';

const getIcon = (iconName, size) => {
  switch (iconName) {
    case 'Flame': return <Flame size={size} />;
    case 'Target': return <Target size={size} />;
    case 'ShieldAlert': return <ShieldAlert size={size} />;
    default: return <Award size={size} />;
  }
};

const getBadgeColor = (iconName) => {
  switch (iconName) {
    case 'Flame': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'Target': return 'bg-brand/10 text-brand border border-brand/20';
    case 'ShieldAlert': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default: return 'bg-accent/10 text-accent border border-accent/20';
  }
};

export default function BadgeRenderer({ badges = [], totalSolved = 0 }) {
  if (badges.length === 0) {
    return (
      <div className="p-8 rounded-3xl border border-dashed border-border bg-card/10 text-center animate-in fade-in duration-300">
        <Target size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-1">DSA Master Badges</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Currently locked. {totalSolved === 0 ? "Solve your first question" : "Keep pushing"} to unlock dynamic badges for consistency and mastery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-brand" />
        <h2 className="text-xl font-bold">Earned Badges ({badges.length})</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(badge => (
          <div key={badge.id} className={`p-5 rounded-2xl flex gap-4 ${getBadgeColor(badge.icon)}`}>
            <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getBadgeColor(badge.icon)}`}>
               {getIcon(badge.icon, 20)}
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">{badge.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}