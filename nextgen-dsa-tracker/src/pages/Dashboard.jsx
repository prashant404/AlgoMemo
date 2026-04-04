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
  const [allNotes, setAllNotes] = useState([]);
  
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) { return null; }
  });

  const [topics, setTopics] = useState(TOPIC_CONFIG.map(t => ({ ...t, solved: 0, due: 0 })));
  const [recallDue, setRecallDue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/notes');
        const fetchedNotes = res.data;
        setAllNotes(fetchedNotes);

        const today = new Date();
        // ⚡ REVISION DUE LOGIC
        const dueNotes = fetchedNotes.filter(note => new Date(note.nextRevisionDate) <= today);
        setRecallDue(dueNotes.length);

        const dynamicTopics = TOPIC_CONFIG.map(baseTopic => {
          const solvedCount = fetchedNotes.filter(note => note.topic === baseTopic.id).length;
          const dueCount = dueNotes.filter(note => note.topic === baseTopic.id).length;
          return { ...baseTopic, solved: solvedCount, due: dueCount };
        });
        setTopics(dynamicTopics);
      } catch (err) {
        console.error("Fetch failed", err);
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
    <div className="relative min-h-screen w-full pb-12 bg-background text-foreground overflow-x-hidden">
      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-10 md:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2 italic">
              Welcome back, {user?.username || 'Dev'}.
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Neural pathways ready. <span className="text-brand font-bold">{recallDue} patterns</span> require synchronization today.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Day Streak Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl px-5 py-3 shadow-xl">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Flame size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Streak</p>
                <p className="text-xl font-black leading-none">{user?.streak || 0}</p>
              </div>
            </div>
            
            {/* ⚡ RESTORED: Recall Due Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl px-5 py-3 shadow-xl">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand/10 text-brand">
                <BrainCircuit size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Now</p>
                <p className="text-xl font-black leading-none">{recallDue}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-card/40 hover:text-rose-500 transition-all shadow-xl">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <WeaknessDetector notes={allNotes} />

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-8">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:text-white'}`}>
            All Patterns
          </button>
          <button onClick={() => setActiveTab('revision')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'revision' ? 'bg-brand/20 text-brand' : 'text-muted-foreground hover:text-white'}`}>
            Revision Mode {recallDue > 0 && <span className="px-2 py-0.5 rounded-md bg-brand text-[10px] text-white">{recallDue}</span>}
          </button>
        </div>

        {/* TOPICS GRID */}
        {displayedTopics.length === 0 ? (
           <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-white/10">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold">All pathways clear.</h3>
              <p className="text-muted-foreground text-sm">Switch to "All Patterns" to log new memories.</p>
           </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayedTopics.map((topic) => {
              const progress = topic.total > 0 ? Math.min(Math.round((topic.solved / topic.total) * 100), 100) : 0;
              const Icon = topic.icon;
              return (
                <Link to={`/topic/${topic.id}`} key={topic.id} className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-card/40 p-6 shadow-lg transition-all hover:border-brand/50 hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-xl bg-muted/50 ${topic.color}`}><Icon size={20} /></div>
                      {topic.due > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-brand bg-brand/10 px-2 py-1 rounded-lg border border-brand/20 uppercase">
                          <BrainCircuit size={12} /> {topic.due} Due
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-brand transition-colors">{topic.name}</h3>
                  </div>
                  <div className="mt-6">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <span>{progress}% Clear</span>
                      <span>{topic.solved} / {topic.total}</span>
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