// src/pages/MockInterview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Timer, Play, RefreshCw, ExternalLink, Trophy, AlertCircle, Brain } from 'lucide-react';
import api from '../api/axios'; // Ensure API is imported
import { QUESTION_BANK } from '../data/questions';

export default function MockInterview() {
  const [step, setStep] = useState('setup');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // --- SMART LOGIC: Pick questions based on performance ---
  const startSmartSession = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notes');
      const userNotes = res.data;
      const today = new Date();

      // Flatten all questions
      const allQuestions = Object.entries(QUESTION_BANK).flatMap(([topicId, questions]) => 
        questions.map(q => ({ ...q, topic: topicId }))
      );

      // Filter questions by categories
      const hardQuestions = allQuestions.filter(q => 
        userNotes.find(n => n.questionId === q.id && n.confidence === 'Hard')
      );
      const dueQuestions = allQuestions.filter(q => 
        userNotes.find(n => n.questionId === q.id && new Date(n.nextRevisionDate) <= today)
      );
      const newQuestions = allQuestions.filter(q => !userNotes.find(n => n.questionId === q.id));

      // SMART MIX: 1 Hard (or new), 1 Due (or new), 1 Brand New
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      
      const sessionSelection = [];
      
      // 1. Target a weakness
      sessionSelection.push(hardQuestions.length > 0 ? pick(hardQuestions) : pick(newQuestions));
      
      // 2. Target a revision
      const remainingDue = dueQuestions.filter(q => !sessionSelection.includes(q));
      sessionSelection.push(remainingDue.length > 0 ? pick(remainingDue) : pick(newQuestions.filter(q => !sessionSelection.includes(q))));
      
      // 3. Something fresh
      const remainingNew = newQuestions.filter(q => !sessionSelection.includes(q));
      sessionSelection.push(pick(remainingNew));

      setSelectedQuestions(sessionSelection.filter(Boolean));
      setStep('active');
      setIsActive(true);
    } catch (err) {
      console.error("Smart selection failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setStep('finished');
      setIsActive(false);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>

        {step === 'setup' && (
          <div className="text-center py-12 px-6 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mb-6">
              <Brain size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Smart Mock Interview</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our algorithm will pick a mix of questions you've struggled with, questions due for review, and brand new patterns.
            </p>
            <button 
              onClick={startSmartSession}
              disabled={loading}
              className="flex items-center gap-2 mx-auto px-8 py-4 bg-brand text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
            >
              <Play size={20} fill="currentColor" /> {loading ? "Generating..." : "Start Practice Session"}
            </button>
          </div>
        )}

        {step === 'active' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-card/60 sticky top-4 z-20 backdrop-blur-md">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Time Remaining</p>
                <h2 className={`text-4xl font-mono font-bold ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-foreground'}`}>
                  {formatTime(timeLeft)}
                </h2>
              </div>
              <button onClick={() => setStep('finished')} className="px-4 py-2 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-sm font-bold">End Session</button>
            </div>

            <div className="grid gap-4">
              {selectedQuestions.map((q, idx) => (
                <div key={q.id} className="p-6 rounded-xl border border-white/5 bg-card/20 flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground/30">0{idx + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold">{q.title}</h3>
                      <div className="flex gap-2 items-center mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-muted uppercase`}>{q.topic.replace('-', ' ')}</span>
                        <span className={`text-xs font-bold ${q.difficulty === 'Easy' ? 'text-emerald-400' : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>{q.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-bold text-sm hover:opacity-90 transition-all">
                    Solve <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-200/80 text-sm">
              <AlertCircle className="shrink-0" size={18} />
              <p>Focus on communicating the logic. Use the "The Trick" field in your notes once you finish!</p>
            </div>
          </div>
        )}

        {step === 'finished' && (
          <div className="text-center py-12 px-6 rounded-2xl border border-emerald-500/20 bg-card/40 backdrop-blur-xl">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Trophy size={32} />
            </div>
            <h1 className="text-4xl font-bold mb-2">Session Complete!</h1>
            <p className="text-muted-foreground mb-8">How did it go? Make sure to go back and update your "Mastery" notes for these questions.</p>
            <div className="flex gap-4 justify-center">
               <button onClick={() => { setTimeLeft(45*60); setStep('setup'); }} className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all">
                <RefreshCw size={18} /> Try Again
              </button>
              <Link to="/dashboard" className="px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-all">Go to Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}