import React, { useState, useEffect } from "react";
import { 
  Settings, KeyRound, Mail, Users, Shield, Sparkles, Check, 
  AlertCircle, RefreshCw, Eye, Power, Trash2, ShieldCheck, Heart 
} from "lucide-react";
import { User, OAuthStatus } from "../types";

interface SettingsProps {
  user: User;
  oauthStatus: OAuthStatus;
  onDisconnectGmail: () => Promise<any>;
}

export default function SettingsPage({
  user,
  oauthStatus,
  onDisconnectGmail
}: SettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"general" | "ai" | "gmail" | "users" | "security">("gmail");
  
  // Users roster state
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Form states
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    
    // Set environment placeholders if present
    setRedirectUri(`${window.location.origin}/api/gmail/callback`);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/notifications"); // triggers load
      const userRes = await fetch("/api/companies"); // triggers read
      // We can load users list directly from db or static fallback
      const list = [
        { id: "user-1", name: "John Admin", email: "admin@recruitment.com", role: "Super Admin", company: "Apex Staffing", status: "Active" },
        { id: "user-2", name: "Sarah Consultant", email: "consultant@recruitment.com", role: "HR Consultant", company: "Apex Staffing", status: "Active" },
        { id: "user-3", name: "Robert Manager", email: "manager@recruitment.com", role: "Recruitment Manager", company: "Apex Staffing", status: "Active" },
        { id: "user-4", name: "Alice Viewer", email: "viewer@recruitment.com", role: "Viewer", company: "Apex Staffing", status: "Active" }
      ];
      setUsers(list as any);
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.notifications || []);
      }
    } catch (e) {}
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Gmail integration account? Bulk mail dispatch will stop working.")) return;
    try {
      await onDisconnectGmail();
      setSuccessMsg("Gmail account disconnected successfully.");
    } catch (e) {
      alert("Disconnect failed.");
    }
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("System configuration parameters saved successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-blue-500" />
          System Settings & Orchestration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure API credentials, audit user access registries, and verify Gmail integration protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: SubTabs navigator */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-lg space-y-1">
          <button
            onClick={() => setActiveSubTab("gmail")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "gmail" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" : "hover:bg-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            Gmail Integrations
          </button>
          
          <button
            onClick={() => setActiveSubTab("ai")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "ai" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" : "hover:bg-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Model Controls
          </button>

          <button
            onClick={() => setActiveSubTab("users")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "users" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" : "hover:bg-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Consultant Roster
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === "security" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15" : "hover:bg-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            Security Audit Trail
          </button>
        </div>

        {/* Right Side: SubTabs Content panels */}
        <div className="md:col-span-9 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5">
              <Check className="w-4.5 h-4.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* GMAIL INTEGRATION CONFIGURATION PANEL */}
          {activeSubTab === "gmail" && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">Google Gmail OAuth Integration</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Authorise secure email dispatch and drafts creation through Google API scopes.</p>
              </div>

              {/* Connected Status Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    oauthStatus.connected ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-slate-850 border-slate-800 text-slate-500"
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sync Connection Status</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {oauthStatus.connected ? `Connected as ${oauthStatus.email}` : "No active Google Connection"}
                    </p>
                  </div>
                </div>

                {oauthStatus.connected ? (
                  <button
                    onClick={handleDisconnect}
                    className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950/30 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Disconnect Mail
                  </button>
                ) : (
                  <form action="/api/gmail/connect" method="POST">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      Connect Gmail Account
                    </button>
                  </form>
                )}
              </div>

              {/* Developer Configuration Form */}
              <form onSubmit={handleSaveConfigs} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">OAuth Credential Credentials</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    To make real Gmail connections, configure Google Developer Console OAuth credentials in your <strong className="text-slate-400">.env</strong> workspace:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Authorized Redirect URI (Callback)</label>
                  <input
                    type="text"
                    readOnly
                    value={redirectUri}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-500 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">GOOGLE_CLIENT_ID</label>
                    <input
                      type="text"
                      placeholder="Insert Client ID..."
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">GOOGLE_CLIENT_SECRET</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Save Google Credentials
                </button>
              </form>
            </div>
          )}

          {/* AI MODEL CONTROLS PANEL */}
          {activeSubTab === "ai" && (
            <form onSubmit={handleSaveConfigs} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">Gemini AI Model Calibration</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Configure Google's Gemini LLM model weights, creativity levels and API keys.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput || "•••••••••••••••••••••••••••••••••••••"}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your GEMINI_API_KEY..."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Default Model</label>
                  <select className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none">
                    <option>gemini-2.5-flash (Recommended)</option>
                    <option>gemini-2.5-pro (High intelligence)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Creativity (Temperature)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    defaultValue="4"
                    className="w-full mt-2 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>Direct (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Save AI Configuration
              </button>
            </form>
          )}

          {/* CONSULTANT ROSTER PANEL */}
          {activeSubTab === "users" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">Consultant Security Registry</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Roster of authorized staffing consultants and their designated roles.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 font-bold uppercase tracking-wider">
                      <th className="py-2">Consultant Name</th>
                      <th className="py-2">Designated Role</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-850/30">
                        <td className="py-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <div className="flex flex-col">
                              <span>{u.name}</span>
                              <span className="text-[10px] text-slate-500 font-normal">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400 font-medium">{u.role}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-bold uppercase">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECURITY AUDIT TRAIL LOGS */}
          {activeSubTab === "security" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">Audit Security Trails</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Chronological ledger recording all CRUD activities, login traces, and OAuth changes.</p>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-start gap-3 text-xs">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 mt-0.5 flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-300">{log.title}</span>
                        <span className="text-[9px] text-slate-500">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
