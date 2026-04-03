import React, { useState, useEffect, useCallback } from 'react';
import { X, Brain, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function AIExplainerModal({ isOpen, onClose, questionTitle, topic }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchExplanation = useCallback(async () => {
    setLoading(true);
    setError(false);
    setExplanation('');
    try {
      const res = await api.post('/ai/explain', { questionTitle, topic });
      setExplanation(res.data.explanation);
    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      setError(true);
      setExplanation(
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "AI coach is offline."
      );
    } finally {
      setLoading(false);
    }
  }, [questionTitle, topic]);

  useEffect(() => {
    if (isOpen) fetchExplanation();
  }, [isOpen, fetchExplanation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand/30 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-purple-500 to-accent"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-brand">
                <Brain size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold">Pattern Intuition</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate max-w-[200px]">
                  {questionTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[160px] flex items-center justify-center text-center">
            {loading ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 text-brand animate-spin mx-auto" />
                <p className="text-sm font-medium text-brand animate-pulse">
                  Scanning pattern archives...
                </p>
              </div>
            ) : error ? (
              // ✅ Error state with retry button
              <div className="space-y-4 w-full">
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-left">
                  <p className="text-sm text-rose-400 leading-relaxed">
                    ⚠️ {explanation}
                  </p>
                </div>
                <button
                  onClick={fetchExplanation}
                  className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-brand/30 text-brand text-sm font-bold hover:bg-brand/10 transition-all"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            ) : (
              // ✅ Success state
              <div className="p-5 rounded-2xl bg-brand/5 border border-brand/10 text-left flex gap-4 animate-in slide-in-from-bottom-2 duration-500 w-full">
                <Lightbulb className="text-brand shrink-0 mt-0.5" size={20} />
                <p className="text-sm leading-relaxed italic text-foreground">
                  "{explanation}"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            {!loading && !error && (
              <button
                onClick={fetchExplanation}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-muted-foreground text-sm font-bold hover:text-foreground hover:border-brand/30 transition-all"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-brand text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-brand/20"
            >
              Got it, let's solve! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}