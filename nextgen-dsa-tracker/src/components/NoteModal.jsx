// src/components/NoteModal.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lightbulb, Zap, Save, Trash2, AlertTriangle, Clock, Box } from "lucide-react";
import api from "../api/axios";
import SimilarProblems from "./SimilarProblems";

export default function NoteModal({
  isOpen,
  onClose,
  questionTitle,
  questionId,
  topic,
  existingNote,
}) {
  const [note, setNote] = useState("");
  const [confidence, setConfidence] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [timeComplexity, setTimeComplexity] = useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [theTrick, setTheTrick] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (existingNote) {
        setNote(existingNote.content || "");
        setConfidence(existingNote.confidence || "Medium");
        setTimeComplexity(existingNote.timeComplexity || "O(N)");
        setSpaceComplexity(existingNote.spaceComplexity || "O(1)");
        setTheTrick(existingNote.theTrick || "");
      } else {
        setNote("");
        setConfidence("Medium");
        setTimeComplexity("O(N)");
        setSpaceComplexity("O(1)");
        setTheTrick("");
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, existingNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/notes", {
        questionId,
        topic,
        content: note,
        confidence: confidence,
        timeComplexity,
        spaceComplexity,
        theTrick
      });

      if (res.data && res.data.streak !== undefined) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.streak = res.data.streak;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
      onClose();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/notes/${questionId}`);
      onClose();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete note.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 99999 }}>
      {/* CSS for custom slick scrollbar */}
      <style>{`
        .slick-scroll::-webkit-scrollbar { width: 6px; }
        .slick-scroll::-webkit-scrollbar-track { background: transparent; }
        .slick-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .slick-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Main Modal Container - Fixed Height with Flexbox */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-card shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* STICKY HEADER */}
        <div className="shrink-0 px-8 pt-8 pb-4 border-b border-white/5 bg-card/95 backdrop-blur z-20 flex justify-between items-start">
          <div className="pr-4">
            <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-[10px] mb-2">
              <Lightbulb size={14} /> Engineer's Journal
            </div>
            <h2 className="text-2xl font-black text-foreground leading-tight">{questionTitle}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 -mt-2 -mr-2">
            <X size={20} />
          </button>
        </div>

        {/* DELETE CONFIRMATION OVERRIDE */}
        {showDeleteConfirm ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Forget this memory?</h2>
            <p className="text-muted-foreground text-sm mb-8 px-4 leading-relaxed">
              This will permanently delete your notes and reset your mastery progress for <span className="font-semibold text-foreground text-brand">"{questionTitle}"</span>.
            </p>
            <div className="flex w-full gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-foreground font-semibold hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-3.5 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        ) : (
          
          /* FORM BODY & FOOTER */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            
            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 slick-scroll bg-gradient-to-b from-card to-background/50">
              
              {/* Complexity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 tracking-wider">
                    <Clock size={12} /> Time Complexity
                  </label>
                  <select 
                    value={timeComplexity} 
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-sm text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all hover:border-white/20"
                  >
                    {['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(2^N)'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 tracking-wider">
                    <Box size={12} /> Space Complexity
                  </label>
                  <select 
                    value={spaceComplexity} 
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-sm text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all hover:border-white/20"
                  >
                    {['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>

              {/* The Trick Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">The Core Logic (The "Aha!" moment)</label>
                <textarea
                  value={theTrick}
                  onChange={(e) => setTheTrick(e.target.value)}
                  placeholder="The 'one sentence' that explains how to solve this..."
                  className="w-full h-20 rounded-xl border border-white/10 bg-[#0f172a]/50 p-4 text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/50 outline-none transition-all resize-none hover:border-white/20 placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Detailed Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Implementation Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detailed edge cases, step-by-step logic..."
                  className="w-full h-32 rounded-xl border border-white/10 bg-[#0f172a]/50 p-4 text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/50 outline-none transition-all hover:border-white/20 placeholder:text-muted-foreground/50"
                  required
                />
              </div>

              {/* Confidence Level */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" /> Confidence Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Hard", "Medium", "Easy"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConfidence(level)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        confidence === level 
                          ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-[1.02]" 
                          : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {level === "Hard" ? "Struggled" : level === "Medium" ? "Alright" : "Crushed it"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master The Pattern - Injected into the scroll area */}
              {existingNote && (
                <div className="pb-4">
                  <SimilarProblems 
                    key={questionId} 
                    currentTopic={topic} 
                    currentProblemId={questionId} 
                  />
                </div>
              )}
              
            </div>

            {/* STICKY FOOTER */}
            <div className="shrink-0 p-6 border-t border-white/5 bg-card/95 backdrop-blur z-20 flex gap-3">
              {existingNote && (
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-3.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                  <Trash2 size={20} />
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 py-3.5 text-sm font-black hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50">
                <Save size={18} /> {loading ? "Saving..." : existingNote ? "Update Mastery" : "Save Logic"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}