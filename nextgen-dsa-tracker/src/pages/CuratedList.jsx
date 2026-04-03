// src/pages/CuratedList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, BrainCircuit, Play, ExternalLink, Filter, ListChecks } from 'lucide-react'; 
import api from '../api/axios';
import NoteModal from '../components/NoteModal';
import { QUESTION_BANK } from '../data/questions';

const LIST_NAMES = {
  'blind-75': 'Blind 75',
  'neetcode-150': 'NeetCode 150'
};

export default function CuratedList() {
  const { listId } = useParams(); 
  const [notes, setNotes] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // MAGIC: Flatten the entire question bank and filter by the requested list!
  const allListQuestions = Object.entries(QUESTION_BANK).flatMap(([topicId, questions]) => {
    return questions
      .filter(q => q.lists && q.lists.includes(listId))
      .map(q => ({ ...q, topic: topicId })); // Inject the topic so the save function works
  });

  // Apply the difficulty filter
  const displayedQuestions = allListQuestions.filter(q => 
    difficultyFilter === 'All' ? true : q.difficulty === difficultyFilter
  );

  const fetchAllNotes = async () => {
    try {
      // Since a curated list spans multiple topics, we fetch ALL the user's notes
      const res = await api.get(`/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    fetchAllNotes().catch(console.error);
    setDifficultyFilter('All');
  }, [listId]);

  const handleOpenModal = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchAllNotes(); 
  };

  // Calculate progress for this specific list
  const solvedCount = allListQuestions.filter(q => notes.some(n => n.questionId === q.id)).length;
  const progressPercentage = allListQuestions.length > 0 
    ? Math.round((solvedCount / allListQuestions.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-brand">
            <ListChecks size={24} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {LIST_NAMES[listId] || 'Curated List'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <p className="text-muted-foreground">
            {solvedCount} of {allListQuestions.length} completed
          </p>
          <div className="flex-1 h-2 max-w-xs overflow-hidden rounded-full bg-background/50 inset-shadow-sm border border-white/5">
            <div 
              className="h-full rounded-full bg-brand shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-brand/50 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-muted-foreground mr-2" />
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                difficultyFilter === diff 
                ? 'bg-foreground text-background shadow-md' 
                : 'bg-card border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {displayedQuestions.map((q) => {
            const savedNote = notes.find(n => n.questionId === q.id);
            const isCompleted = !!savedNote;
            const isDue = savedNote && new Date(savedNote.nextRevisionDate) <= new Date();

            return (
              <div 
                key={q.id}
                onClick={() => handleOpenModal(q)}
                className={`group flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer shadow-sm
                  ${isCompleted 
                    ? 'bg-card/40 border-border hover:border-brand/50' 
                    : 'bg-card/20 border-white/5 hover:bg-card/40 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border shrink-0
                    ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-muted/50 border-border text-muted-foreground'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <Play size={18} className="ml-1 opacity-50" />}
                  </div>

                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-foreground/80'}`}>
                      {q.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                      <span className="text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded text-[10px]">
                        {q.topic.replace('-', ' ')}
                      </span>
                      <span className={`
                        ${q.difficulty === 'Easy' ? 'text-emerald-400' : ''}
                        ${q.difficulty === 'Medium' ? 'text-amber-400' : ''}
                        ${q.difficulty === 'Hard' ? 'text-rose-400' : ''}
                      `}>
                        {q.difficulty}
                      </span>
                      
                      {isCompleted && savedNote.confidence && (
                        <>
                          <span className="text-border">•</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            Confidence: <span className="text-foreground">{savedNote.confidence}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isDue && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                      <BrainCircuit size={14} /> Review Due
                    </div>
                  )}
                  
                  <a 
                    href={q.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand transition-colors p-2 rounded-md hover:bg-brand/10"
                    title="Solve on LeetCode"
                  >
                    Solve <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}

          {displayedQuestions.length === 0 && (
            <div className="text-center p-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No {difficultyFilter !== 'All' ? difficultyFilter : ''} questions found in this list.</p>
            </div>
          )}
        </div>
      </div>

      {selectedQuestion && (
        <NoteModal 
          isOpen={isModalOpen} 
          onClose={handleModalClose} 
          questionTitle={selectedQuestion.title}
          questionId={selectedQuestion.id}
          topic={selectedQuestion.topic} 
          existingNote={notes.find(n => n.questionId === selectedQuestion.id)} 
        />
      )}
    </div>
  );
}