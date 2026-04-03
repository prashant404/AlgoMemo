// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Bell, User, BarChart3, Settings, LogOut } from "lucide-react";
import { getAvatarUrl } from "../utils/avatar"; // IMPORT HELPER

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const isAppView = location.pathname !== "/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/"); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-purple-400 text-white shadow-sm">
            <Brain size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Algo<span className="text-brand">Memo</span></span>
        </Link>

        {isAppView && (
          <div className="flex items-center gap-5">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link to="/dashboard" className="text-foreground transition-colors">Topics</Link>
              <Link to="/mock-interview" className="text-muted-foreground hover:text-foreground transition-colors">Mock Interviews</Link>
            </nav>
            
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center outline-none">
                <div className={`h-9 w-9 rounded-full p-0.5 transition-all ${dropdownOpen ? 'bg-brand' : 'bg-white/10 hover:bg-brand/50'}`}>
                  {/* USE AVATAR HELPER */}
                  <img src={getAvatarUrl(user)} alt="User Avatar" className="h-full w-full rounded-full bg-slate-800 object-cover" />
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-64 rounded-xl border border-border bg-card shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-border mb-2 flex items-center gap-3">
                     <img src={getAvatarUrl(user)} className="h-10 w-10 rounded-full bg-slate-800 shadow-sm object-cover" alt="Profile" />
                     <div className="overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">{user?.username}</p>
                     </div>
                  </div>
                  <Link to="/profile?tab=overview" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><User size={16} /> My Profile</Link>
                  <Link to="/profile?tab=analytics" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><BarChart3 size={16} /> Analytics</Link>
                  <Link to="/profile?tab=settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Settings size={16} /> Settings</Link>
                  <div className="h-px bg-border my-2"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"><LogOut size={16} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}