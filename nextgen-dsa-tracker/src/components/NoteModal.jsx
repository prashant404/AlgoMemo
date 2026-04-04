// src/components/NoteModal.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lightbulb, Zap, Save, Trash2, AlertTriangle, Clock, Box } from "lucide-react";
import api from "../api/axios";
import SimilarProblems from "./SimilarProblems"; // ⚡ IMPORTED THE NEW COMPONENT

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

  // --- FEYNMAN UPGRADE FIELDS ---
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
        // Send new fields to backend
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
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-card p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors">
          <X size={20} />
        </button>

        {showDeleteConfirm ? (
          <div className="py-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Forget this memory?</h2>
            <p className="text-muted-foreground text-sm mb-8 px-4">
              This will permanently reset your progress for <span className="font-semibold text-foreground">"{questionTitle}"</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-wider text-xs mb-1">
                <Lightbulb size={14} /> Engineer's Journal
              </div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">{questionTitle}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Complexity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Clock size={12} /> Time Complexity
                  </label>
                  <select 
                    value={timeComplexity} 
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground outline-none focus:border-brand"
                  >
                    {['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(2^N)'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Box size={12} /> Space Complexity
                  </label>
                  <select 
                    value={spaceComplexity} 
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground outline-none focus:border-brand"
                  >
                    {['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* The Trick Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">The Core Logic (The "Aha!" moment)</label>
                <textarea
                  value={theTrick}
                  onChange={(e) => setTheTrick(e.target.value)}
                  placeholder="The 'one sentence' that explains how to solve this..."
                  className="w-full h-20 rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-brand outline-none transition-all resize-none"
                />
              </div>

              {/* Detailed Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Implementation Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detailed edge cases, step-by-step logic..."
                  className="w-full h-28 rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-brand outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" /> Confidence Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Hard", "Medium", "Easy"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setConfidence(level)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        confidence === level ? "bg-brand border-brand text-white shadow-lg" : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {level === "Hard" ? "Struggled" : level === "Medium" ? "Alright" : "Crushed it"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {existingNote && (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all">
                    <Trash2 size={20} />
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-bold text-background hover:bg-foreground/90 transition-all disabled:opacity-50">
                  <Save size={18} /> {loading ? "Saving..." : existingNote ? "Update Mastery" : "Save Logic"}
                </button>
              </div>
            </form>

            {/* ⚡ PLUGGED IN SIMILAR PROBLEMS COMPONENT ⚡ */}
            {/* We only show this if they are editing an existing note (not adding a brand new one) */}
            {existingNote && (
              <SimilarProblems 
                key={questionId} 
                currentTopic={topic} 
                currentProblemId={questionId} 
              />
            )}
            
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}