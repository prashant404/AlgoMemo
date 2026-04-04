import React, { useMemo } from 'react';
import { ShieldAlert, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WeaknessDetector({ notes }) {
  const weaknesses = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    const topicStats = {};

    notes.forEach(note => {
      if (!topicStats[note.topic]) {
        topicStats[note.topic] = { total: 0, struggles: 0 };
      }
      topicStats[note.topic].total += 1;
      
      if (note.difficulty === 'Hard') {
        topicStats[note.topic].struggles += 1;
      }
    });

    const detected = [];
    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.total >= 2 && (stats.struggles / stats.total) >= 0.5) {
        const formattedTopic = topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        detected.push(formattedTopic);
      }
    }

    return detected;
  }, [notes]);

  if (weaknesses.length === 0) return null;

  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/20 rounded-xl text-rose-500 shrink-0">
          <ShieldAlert size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
            Neural Weakness Detected
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </h3>

          {/* ✅ Fixed — escaped > symbol */}
          <p className="text-sm text-rose-300/80 mt-1 mb-4 font-medium">
            Our telemetry indicates a high struggle rate (&gt;50%) with the following patterns. We recommend immediate review.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {weaknesses.map(w => (
              <span key={w} className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-sm font-bold flex items-center gap-2">
                <Activity size={14} /> {w}
              </span>
            ))}
          </div>

          <Link to="/gauntlet" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl transition-colors">
            Run Focused Gauntlet <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}