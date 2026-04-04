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

      // ✅ Fixed — use 'confidence' not 'difficulty'
      if (note.confidence === 'Hard') {
        topicStats[note.topic].struggles += 1;
      }
    });

    const detected = [];
    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.total >= 2 && (stats.struggles / stats.total) >= 0.5) {
        const formattedTopic = topic
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        detected.push({ topic, formattedTopic });
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
          <p className="text-sm text-rose-300/80 mt-1 mb-4 font-medium">
            High struggle rate (&gt;50%) detected in the following topics. Immediate review recommended.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {weaknesses.map(({ topic, formattedTopic }) => (
              // ✅ Each tag links directly to that topic
              <Link
                to={`/topic/${topic}`}
                key={topic}
                className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-sm font-bold flex items-center gap-2 hover:bg-rose-500/30 transition-colors"
              >
                <Activity size={14} /> {formattedTopic}
              </Link>
            ))}
          </div>

          <p className="text-xs text-rose-400/60 font-medium">
            💡 Click a topic above to go practice it directly
          </p>
        </div>
      </div>
    </div>
  );
}