import React, { useState } from 'react';
import { Network, ArrowUpRight } from 'lucide-react';
import { QUESTION_BANK } from '../data/questions';

export default function SimilarProblems({ currentTopic, currentProblemId }) {
  // ⚡ LAZY STATE INITIALIZATION
  // This runs exactly once upon mounting. No useEffect, no useMemo!
  const [suggestions] = useState(() => {
    if (!currentTopic || !QUESTION_BANK[currentTopic]) return [];
    
    // 1. Get all problems in this topic, remove the current one
    const pool = [...QUESTION_BANK[currentTopic]].filter(q => q.id !== currentProblemId);
    
    // 2. Shuffle safely
    const shuffled = pool.sort(() => 0.5 - Math.random());
    
    // 3. Return the top 2
    return shuffled.slice(0, 2);
  });

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
        <Network size={16} className="text-brand" /> Master The Pattern
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        Solidify your neural pathways. These problems use the exact same underlying logic.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suggestions.map((q) => (
          <a 
            key={q.id} 
            href={q.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group"
          >
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-brand transition-colors">{q.title}</p>
              <p className={`text-xs font-black mt-1 ${
                q.difficulty === 'Easy' ? 'text-emerald-400' : 
                q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {q.difficulty}
              </p>
            </div>
            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-brand transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}