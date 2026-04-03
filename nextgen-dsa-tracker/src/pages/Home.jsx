import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from '../components/AuthModal'; 
import { 
  Target, 
  BrainCircuit, 
  LineChart, 
  Code2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Orbit, 
  Cpu
} from "lucide-react";

// ⚡ CUSTOM GITHUB COMPONENT (Zero-dependency fix)
const GithubIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) navigate("/dashboard");
    else setIsModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 overflow-hidden font-sans">
        
        <main className="flex-1">
          {/* --- HERO SECTION --- */}
          <section className="container mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 relative">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-brand/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              
              {/* Left Side: Branding & CTA */}
              <div className="space-y-8">
                <div className="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand">
                  <Sparkles size={12} className="mr-2" />
                  Neural Retention Engine
                </div>

                {/* Adjusted Font Size here: text-5xl to text-6xl */}
                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                  Don't just track. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-indigo-400">
                    Master the Logic.
                  </span>
                </h1>

                <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                  Most trackers are lists. AlgoMemo is a <span className="text-slate-200 font-bold">Neural Sync</span> engine designed to fight the forgetting curve through Spaced Repetition.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleCTA}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-10 text-base font-black text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand/90 hover:scale-[1.02]"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight size={18} />
                  </button>
                  <a href="#features" className="inline-flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-8 text-base font-bold text-slate-200 hover:bg-white/10 transition-all">
                    Features
                  </a>
                </div>
              </div>

              {/* Right Side: Refined Neural Core */}
              <div className="relative mx-auto w-full max-w-[450px] h-[450px] flex items-center justify-center perspective-[1000px]">
                <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_30s_linear_infinite]"></div>
                
                <div className="relative z-10 w-56 h-56 rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-3xl shadow-[0_0_80px_-20px_rgba(139,92,246,0.4)] flex flex-col items-center justify-center group transition-transform duration-700">
                  <Orbit size={110} className="text-brand/10 absolute animate-[spin_20s_linear_infinite]" />
                  <BrainCircuit size={60} className="text-brand mb-3 drop-shadow-[0_0_20px_rgba(139,92,246,0.7)]" />
                  <div className="text-[9px] font-black tracking-[0.4em] text-brand/80 uppercase">Sync Active</div>
                </div>

                {/* Smaller, cleaner widgets */}
                <div className="absolute top-10 -left-4 z-20 p-4 rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl shadow-xl animate-bounce" style={{ animationDuration: '6s' }}>
                  <Zap size={20} className="text-orange-400" fill="currentColor" />
                </div>

                <div className="absolute -bottom-4 right-10 z-20 p-4 rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl shadow-xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                  <div className="text-[10px] font-black text-brand italic">LVL 14</div>
                </div>
              </div>
            </div>
          </section>

          {/* --- FEATURES GRID --- */}
          <section id="features" className="border-t border-white/5 bg-white/[0.01] py-24 relative">
            <div className="container mx-auto max-w-7xl px-6 relative z-10">
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Engineered for Recall.</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-base">
                  A high-performance toolkit designed to move your DSA skills from short-term memory to long-term mastery.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: BrainCircuit, title: "Spaced Repetition", desc: "Our algorithm tracks your mastery and resurfaces problems right before you're likely to forget the logic." },
                  { icon: Sparkles, title: "AI Intuition Coach", desc: "Get high-level hints from Gemini that guide your thought process without spoiling the code implementation." },
                  { icon: Code2, title: "Micro-Journals", desc: "Build a personal cheat sheet by logging 'The Trick'—the core insight behind every complex solution." },
                  { icon: Target, title: "Tagless Practice", desc: "Identity patterns from scratch. We hide labels during mock sessions to build real-world recognition." },
                  { icon: LineChart, title: "Neural Skill Radar", desc: "Visual analytics map your proficiency across patterns, showing you exactly where your weaknesses hide." },
                  { icon: Cpu, title: "Performance UI", desc: "A distraction-free, lightning-fast interface designed for engineers. Zero bloat, pure focus." }
                ].map((f, i) => (
                  <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand/30 hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm">
                    <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6 transition-transform group-hover:scale-110">
                      <f.icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        
        {/* --- FOOTER --- */}
        <footer className="border-t border-white/5 py-10 bg-[#020617] relative z-10">
          <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-400 tracking-tight">AlgoMemo</span>
              <span className="h-4 w-px bg-white/10 hidden md:block"></span>
              <p>© 2026. Elevating engineer careers.</p>
            </div>
            
            <a 
              href="https://github.com/prashant404" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/5 bg-white/5 text-slate-300 hover:text-white hover:border-brand/40 hover:bg-brand/10 transition-all group"
            >
              <GithubIcon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-black tracking-widest uppercase text-[10px]">Built by @prashant404</span>
            </a>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}