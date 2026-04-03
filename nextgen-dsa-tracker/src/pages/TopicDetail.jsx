// src/pages/TopicDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play, ExternalLink, Sparkles } from 'lucide-react'; 
import api from '../api/axios';
import NoteModal from '../components/NoteModal';
import AIExplainerModal from '../components/AIExplainerModal'; 
import { QUESTION_BANK } from '../data/questions';

export default function TopicDetail() {
  const { topicId } = useParams(); 
  const [notes, setNotes] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Logic to reset filter when topic changes WITHOUT useEffect (Prevents cascading render error)
  const [prevTopicId, setPrevTopicId] = useState(topicId);
  if (topicId !== prevTopicId) {
    setPrevTopicId(topicId);
    setDifficultyFilter('All');
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState(null);

  const fetchTopicNotes = useCallback(async () => {
    try {
      const res = await api.get(`/notes/${topicId}`);
      setNotes(res.data);
    } catch (err) { 
      console.error("Note Fetch Error:", err); 
    }
  }, [topicId]);

  useEffect(() => { 
    fetchTopicNotes(); 
  }, [fetchTopicNotes]);

  const handleOpenAI = (e, q) => { 
    e.stopPropagation(); 
    setAiQuestion(q); 
    setAiModalOpen(true); 
  };

  const questions = (QUESTION_BANK[topicId] || []).filter(q => 
    difficultyFilter === 'All' ? true : q.difficulty === difficultyFilter
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>
        <h1 className="text-4xl font-black mb-2 text-foreground uppercase tracking-tight">
          {topicId.replace(/-/g, ' ')}
        </h1>
        <p className="text-muted-foreground mb-8">Master the patterns. Build your intuition.</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button 
              key={diff} 
              onClick={() => setDifficultyFilter(diff)} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                difficultyFilter === diff ? 'bg-foreground text-background shadow-md' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {questions.map((q) => {
            const isCompleted = notes.some(n => n.questionId === q.id);
            return (
              <div 
                key={q.id} 
                onClick={() => { setSelectedQuestion(q); setIsModalOpen(true); }} 
                className={`flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer ${
                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card/20 border-white/5 hover:bg-card/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isCompleted ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' : 'text-muted-foreground border-border'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <Play size={18} className="ml-1 opacity-50" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{q.title}</h3>
                    <span className={`text-xs font-medium ${
                      q.difficulty === 'Easy' ? 'text-emerald-400' : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleOpenAI(e, q)} className="flex items-center gap-1.5 text-xs font-bold text-brand p-2 rounded-lg hover:bg-brand/10">
                    <Sparkles size={16} /><span>Intuition</span>
                  </button>
                  <a href={q.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand p-2">
                    Solve <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedQuestion && (
        <NoteModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); fetchTopicNotes(); }} 
          questionTitle={selectedQuestion.title} 
          questionId={selectedQuestion.id} 
          topic={topicId} 
          existingNote={notes.find(n => n.questionId === selectedQuestion.id)} 
        />
      )}
      {aiQuestion && (
        <AIExplainerModal 
          isOpen={aiModalOpen} 
          onClose={() => setAiModalOpen(false)} 
          questionTitle={aiQuestion.title} 
          topic={topicId} 
        />
      )}
    </div>
  );
}