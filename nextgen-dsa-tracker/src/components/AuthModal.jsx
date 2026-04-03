import React, { useState } from "react";
import { X, Mail, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/users/login" : "/users/register";
    
    // ⚡ FIX: Added to email.split to get a string, not an array
    const payload = isLogin
      ? { email, password }
      : { username: email.split("@"), email, password };

    try {
      const res = await api.post(endpoint, payload);
      
      // Save session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      
      onClose();
      
      // ⚡ FIX: { replace: true } prevents the back-button from reopening the modal
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ⚡ FIX: z- ensures the modal stays on top of the Home page glass effects */
    <div className="fixed inset-0 z- flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/90 backdrop-blur-2xl p-8 shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            {isLogin ? "Welcome back" : "Join AlgoMemo"}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {isLogin ? "Enter your credentials to sync your progress." : "Start your journey toward DSA mastery today."}
          </p>
          
          {error && (
            <div className="mt-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold animate-shake">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/5 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand/50 focus:bg-brand/5 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/5 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand/50 focus:bg-brand/5 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-brand py-4 text-sm font-black text-white shadow-lg shadow-brand/20 hover:bg-brand/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In to Engine" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "New to the platform? " : "Already have an account? "}
          <button
            onClick={() => {
                setError("");
                setIsLogin(!isLogin);
            }}
            className="font-black text-brand hover:text-brand/80 underline underline-offset-4"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}