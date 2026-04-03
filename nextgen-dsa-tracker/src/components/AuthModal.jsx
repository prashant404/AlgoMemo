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
    const payload = isLogin
      ? { email, password }
      : { username: email.split("@")[0], email, password };

    try {
      const res = await api.post(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      onClose();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      
      {/* 🔥 Background Overlay */}
      <div 
        className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-[9998]"
        onClick={onClose}
      />

      {/* 🔥 Modal Card */}
      <div className="relative z-[9999] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a] p-10 shadow-[0_0_100px_-20px_rgba(139,92,246,0.5)] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 top-8 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-6">
            <ShieldCheck size={32} />
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white leading-none">
            {isLogin ? "Welcome back" : "Join the Engine"}
          </h2>

          <p className="text-slate-400 mt-3 text-sm font-medium">
            {isLogin ? "Sync your neural progress." : "Start mastering patterns today."}
          </p>
          
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Identity
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand/50 focus:bg-brand/5 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
              Access Key
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-brand/50 focus:bg-brand/5 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-2xl bg-brand py-4 text-sm font-black text-white shadow-xl shadow-brand/20 hover:bg-brand/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-10 text-center text-sm text-slate-500">
          {isLogin ? "New here? " : "Already registered? "}
          <button
            onClick={() => {
              setError("");
              setIsLogin(!isLogin);
            }}
            className="font-black text-brand hover:underline underline-offset-8 transition-all"
          >
            {isLogin ? "Create Account" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}