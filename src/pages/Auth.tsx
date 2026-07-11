import React, { useState } from "react";
import { Sparkles, Mail, Lock, Shield, ArrowRight, UserPlus, KeyRound, Building2 } from "lucide-react";
import { User, UserRole } from "../types";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("admin@recruitment.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("John Admin");
  const [companyName, setCompanyName] = useState("Apex Staffing");
  const [role, setRole] = useState<UserRole>("Super Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering 
      ? { name, email, password, company: companyName, role }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        onLoginSuccess(json.data.user);
      } else {
        setError(json.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("Server connection refused. Double check Express terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut login helper
  const handlePresetLogin = (presetEmail: string, presetName: string, presetRole: UserRole) => {
    setEmail(presetEmail);
    setName(presetName);
    setRole(presetRole);
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Mesh Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Left column: Visual Tagline Illustration */}
        <div className="md:w-1/2 bg-slate-950 p-10 flex flex-col justify-between border-r border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
              AI Recruitment CRM
            </div>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase mt-1">Enterprise Cloud-Native Suite</p>
          </div>

          <div className="my-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Smart recruiting, driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Artificial Intelligence</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automate company scanning, draft elite candidate pitches, and scale personalized outreach directly from your inbox.
            </p>
            
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">✓</div>
                Gemini-powered Company intelligence
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">✓</div>
                Real-time Gmail OAuth Draft syncing
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-xs font-medium">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">✓</div>
                Dynamic Conversion & Lead Quality reports
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Test Demonstration Shortcuts</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => handlePresetLogin("admin@recruitment.com", "John Admin", "Super Admin")}
                className="text-[10px] font-semibold text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 cursor-pointer"
              >
                Super Admin Account
              </button>
              <button 
                onClick={() => handlePresetLogin("consultant@recruitment.com", "Sarah Consultant", "HR Consultant")}
                className="text-[10px] font-semibold text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 cursor-pointer"
              >
                HR Consultant
              </button>
              <button 
                onClick={() => handlePresetLogin("manager@recruitment.com", "Robert Manager", "Recruitment Manager")}
                className="text-[10px] font-semibold text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 cursor-pointer"
              >
                Recruitment Manager
              </button>
              <button 
                onClick={() => handlePresetLogin("viewer@recruitment.com", "Alice Viewer", "Viewer")}
                className="text-[10px] font-semibold text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 cursor-pointer"
              >
                Viewer (Read-only)
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Auth Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{isRegistering ? "Register Agency Account" : "Partner Access Login"}</h2>
            <p className="text-slate-400 text-xs mt-1">Please fill credentials to open CRM controls.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., John Admin"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Agency Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="E.g., Apex Staffing Solutions"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Authorized Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
                  >
                    <option value="Super Admin">Super Admin (Full settings access)</option>
                    <option value="Admin">Admin (Create campaigns & reports)</option>
                    <option value="HR Consultant">HR Consultant (Standard pipelines)</option>
                    <option value="Viewer">Viewer (Read-only dashboard)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Register Account" : "Login Securely"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              {isRegistering ? "Already have an account? Sign in" : "Create new corporate register account"}
            </button>
          </div>
        </div>

      </div>
      
      <div className="mt-8 text-center text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
        © 2026 Apex AI Recruitment CRM. All rights reserved.
      </div>
    </div>
  );
}
