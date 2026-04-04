// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, BrainCircuit, CheckCircle2, ChevronRight, LayoutList, GitMerge, 
  Maximize, GitCommit, Database, Layers, LogOut, Box, Search, Share2, 
  ArrowUpFromLine, GitPullRequest, SearchCode, Calendar, Banknote, 
  Binary, Calculator, Activity, Repeat, ArrowDownAZ, PenTool, Type 
} from 'lucide-react';
import api from '../api/axios';
import { QUESTION_BANK } from '../data/questions';
import WeaknessDetector from '../components/WeaknessDetector';

const TOPIC_CONFIG = [
  { id: 'arrays', name: 'Arrays & Hashing', total: QUESTION_BANK['arrays']?.length || 0, icon: LayoutList, color: 'text-blue-400' },
  { id: 'two-pointers', name: 'Two Pointers', total: QUESTION_BANK['two-pointers']?.length || 0, icon: GitMerge, color: 'text-brand' },
  { id: 'sliding-window', name: 'Sliding Window', total: QUESTION_BANK['sliding-window']?.length || 0, icon: Maximize, color: 'text-accent' },
  { id: 'stack', name: 'Stack', total: QUESTION_BANK['stack']?.length || 0, icon: Box, color: 'text-pink-400' },
  { id: 'binary-search', name: 'Binary Search', total: QUESTION_BANK['binary-search']?.length || 0, icon: Search, color: 'text-emerald-400' },
  { id: 'linked-list', name: 'Linked List', total: QUESTION_BANK['linked-list']?.length || 0, icon: GitCommit, color: 'text-teal-400' },
  { id: 'trees', name: 'Trees', total: QUESTION_BANK['trees']?.length || 0, icon: Layers, color: 'text-green-500' },
  { id: 'tries', name: 'Tries', total: QUESTION_BANK['tries']?.length || 0, icon: SearchCode, color: 'text-emerald-300' },
  { id: 'graphs', name: 'Graphs', total: QUESTION_BANK['graphs']?.length || 0, icon: Share2, color: 'text-indigo-400' },
  { id: 'advanced-graphs', name: 'Advanced Graphs', total: QUESTION_BANK['advanced-graphs']?.length || 0, icon: Activity, color: 'text-indigo-500' },
  { id: 'dp', name: 'Dynamic Prog', total: QUESTION_BANK['dp']?.length || 0, icon: Database, color: 'text-purple-400' },
  { id: 'heap', name: 'Heap / Priority Queue', total: QUESTION_BANK['heap']?.length || 0, icon: ArrowUpFromLine, color: 'text-orange-400' },
  { id: 'backtracking', name: 'Backtracking', total: QUESTION_BANK['backtracking']?.length || 0, icon: GitPullRequest, color: 'text-rose-400' },
  { id: 'intervals', name: 'Intervals', total: QUESTION_BANK['intervals']?.length || 0, icon: Calendar, color: 'text-yellow-400' },
  { id: 'greedy', name: 'Greedy', total: QUESTION_BANK['greedy']?.length || 0, icon: Banknote, color: 'text-amber-500' },
  { id: 'bit-manipulation', name: 'Bit Manipulation', total: QUESTION_BANK['bit-manipulation']?.length || 0, icon: Binary, color: 'text-cyan-400' },
  { id: 'math', name: 'Math & Geometry', total: QUESTION_BANK['math']?.length || 0, icon: Calculator, color: 'text-blue-500' },
  { id: 'recursion', name: 'Recursion', total: QUESTION_BANK['recursion']?.length || 0, icon: Repeat, color: 'text-fuchsia-400' },
  { id: 'sorting', name: 'Sorting & Searching', total: QUESTION_BANK['sorting']?.length || 0, icon: ArrowDownAZ, color: 'text-sky-400' },
  { id: 'strings', name: 'String Manipulation', total: QUESTION_BANK['strings']?.length || 0, icon: Type, color: 'text-violet-400' },
  { id: 'design', name: 'Design / OOP', total: QUESTION_BANK['design']?.length || 0, icon: PenTool, color: 'text-rose-300' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [allNotes, setAllNotes] = useState([]); // ⚡ Keep full notes for WeaknessDetector
  
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [topics, setTopics] = useState(TOPIC_CONFIG.map(t => ({ ...t, solved: 0, due: 0 })));
  const [recallDue, setRecallDue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/notes');
        const fetchedNotes = res.data;
        setAllNotes(fetchedNotes); // ⚡ Store notes for weakness analysis

        const today = new Date();
        const dueNotes = fetchedNotes.filter(note => new Date(note.nextRevisionDate) <= today);
        setRecallDue(dueNotes.length);

        const dynamicTopics = TOPIC_CONFIG.map(baseTopic => {
          const solvedCount = fetchedNotes.filter(note => note.topic === baseTopic.id).length;
          const dueCount = dueNotes.filter(note => note.topic === baseTopic.id).length;
          return { ...baseTopic, solved: solvedCount, due: dueCount };
        });
        setTopics(dynamicTopics);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); 
  };

  const displayedTopics = activeTab === 'revision' 
    ? topics.filter(t => t.due > 0) 
    : topics;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full pb-12 overflow-hidden bg-background text-foreground">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        <div className="absolute -left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-brand/20 blur-[100px]"></div>
        <div className="absolute right-[-5%] top-[20%] h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px]"></div>
      </div>

      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-10 md:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
              Welcome back, {user?.username || 'Developer'}.
            </h1>
            <p className="text-muted-foreground">
              You have <span className="font-semibold text-accent">{recallDue} questions</span> due for revision today.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl px-4 py-3 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
                <Flame size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Day Streak</p>
                <p className="text-xl font-bold text-foreground leading-none">{user?.streak || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl px-4 py-3 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <BrainCircuit size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recall Due</p>
                <p className="text-xl font-bold text-foreground leading-none">{recallDue}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="hidden md:flex items-center justify-center h-12 w-12 rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl hover:border-rose-500/30 hover:text-rose-500 transition-all shadow-lg text-muted-foreground">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* ⚡ NEW: WEAKNESS DETECTOR COMPONENT */}
        <WeaknessDetector notes={allNotes} />

        {/* Tab Selection & Playlists */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:text-foreground'}`}>
              All Topics
            </button>
            <button onClick={() => setActiveTab('revision')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'revision' ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:text-foreground'}`}>
              Revision Mode {recallDue > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">{recallDue}</span>}
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Playlists:</span>
            <Link to="/list/blind-75" className="px-3 py-1.5 rounded-lg border border-white/10 bg-card/40 text-sm font-medium hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center gap-2 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Blind 75
            </Link>
            <Link to="/list/neetcode-150" className="px-3 py-1.5 rounded-lg border border-white/10 bg-card/40 text-sm font-medium hover:border-accent/50 hover:text-accent transition-all flex items-center gap-2 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(167,139,250,0.8)]"></span> NeetCode 150
            </Link>
          </div>
        </div>

        {/* Grid OR Empty State */}
        {displayedTopics.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-card/20 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="mx-auto h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">You're all caught up!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No topics are due for revision right now. Switch to "All Topics" to learn something new.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedTopics.map((topic) => {
              const isComplete = topic.total > 0 && topic.solved >= topic.total;
              const progressPercentage = topic.total > 0 ? Math.min(Math.round((topic.solved / topic.total) * 100), 100) : 0;
              const Icon = topic.icon;

              return (
                <Link to={`/topic/${topic.id}`} key={topic.id} className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl p-6 shadow-lg transition-all hover:border-brand/50 hover:-translate-y-1 overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 ${topic.color}`}>
                        <Icon size={20} />
                      </div>
                      {topic.due > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent border border-accent/20 tracking-wider">
                          <BrainCircuit size={12} /> {topic.due} Due
                        </span>
                      ) : isComplete ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Mastered
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">{topic.solved} / {topic.total}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-brand transition-colors">{topic.name}</h3>
                  </div>
                  <div className="mt-6">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50 mb-4">
                      <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-brand'}`} style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <div className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      Explore Questions <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}