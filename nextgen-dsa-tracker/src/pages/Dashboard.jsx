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
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || "{}"));
  const [topics, setTopics] = useState(TOPIC_CONFIG.map(t => ({ ...t, solved: 0, due: 0 })));
  const [recallDue, setRecallDue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/notes');
        const fetchedNotes = res.data;
        setAllNotes(fetchedNotes);
        const today = new Date();
        const dueNotes = fetchedNotes.filter(note => new Date(note.nextRevisionDate) <= today);
        setRecallDue(dueNotes.length);
        const dynamicTopics = TOPIC_CONFIG.map(baseTopic => {
          const solvedCount = fetchedNotes.filter(note => note.topic === baseTopic.id).length;
          const dueCount = dueNotes.filter(note => note.topic === baseTopic.id).length;
          return { ...baseTopic, solved: solvedCount, due: dueCount };
        });
        setTopics(dynamicTopics);
      } catch (err) { console.error(err); }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); 
  };

  const displayedTopics = activeTab === 'revision' ? topics.filter(t => t.due > 0) : topics;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full pb-12 overflow-hidden bg-background">
      <main className="container relative z-10 mx-auto max-w-7xl px-4 pt-10 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Welcome back, {user?.username}.</h1>
            <p className="text-muted-foreground">You have <span className="font-semibold text-accent">{recallDue} questions</span> due today.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl px-4 py-3 shadow-lg">
                <Flame size={20} className="text-orange-500" />
                <p className="text-xl font-bold">{user?.streak || 0}</p>
             </div>
             <button onClick={handleLogout} className="md:flex hidden h-12 w-12 items-center justify-center rounded-xl bg-card border border-white/5 hover:text-rose-500 transition-all"><LogOut size={20}/></button>
          </div>
        </div>

        <WeaknessDetector notes={allNotes} />

        <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-8">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'all' ? 'bg-brand/20 text-brand' : 'text-muted-foreground'}`}>All Topics</button>
          <button onClick={() => setActiveTab('revision')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'revision' ? 'bg-brand/20 text-brand' : 'text-muted-foreground'}`}>Revision {recallDue > 0 && `(${recallDue})`}</button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedTopics.map((topic) => (
            <Link to={`/topic/${topic.id}`} key={topic.id} className="group relative flex flex-col justify-between rounded-xl border border-white/5 bg-card/40 p-6 hover:border-brand/50 transition-all">
               <div className="flex justify-between items-center mb-4">
                  <div className={`p-2 rounded-lg bg-muted ${topic.color}`}><topic.icon size={20}/></div>
                  <span className="text-xs font-bold text-muted-foreground">{topic.solved}/{topic.total}</span>
               </div>
               <h3 className="text-lg font-bold">{topic.name}</h3>
               <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand transition-all" style={{ width: `${(topic.solved/topic.total)*100}%` }} />
               </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}