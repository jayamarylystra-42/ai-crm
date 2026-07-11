import React, { useState, useEffect } from "react";
import { 
  Bell, Search, Plus, Sparkles, AlertCircle, RefreshCw, 
  Settings, Check, CheckSquare, Trash2, Mail, ExternalLink, ShieldCheck 
} from "lucide-react";
import { User, Notification, OAuthStatus } from "../types";

interface NavbarProps {
  user: User;
  onQuickAdd: () => void;
  setActiveTab: (tab: string) => void;
  oauthStatus: OAuthStatus;
  refreshAll: () => void;
}

export default function Navbar({ 
  user, 
  onQuickAdd, 
  setActiveTab, 
  oauthStatus,
  refreshAll
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll notifications
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setRefreshing(true);
    await refreshAll();
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 800);
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
      
      {/* Left side: Search & Integrations */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search leads, campaigns, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: Actions, Notifications, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
          title="Sync Pipeline"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-500" : ""}`} />
          {!refreshing && <span className="hidden md:inline">Sync</span>}
        </button>

        {/* Quick Add Button */}
        {user.role !== "Viewer" && (
          <button
            onClick={onQuickAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Lead</span>
          </button>
        )}

        {/* Gmail Status Badge */}
        <div 
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold cursor-pointer transition-all ${
            oauthStatus.connected 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
          }`}
          title={oauthStatus.connected ? `Connected as ${oauthStatus.email}` : "Gmail Disconnected"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${oauthStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
          <span className="hidden lg:inline">Gmail: {oauthStatus.connected ? "Connected" : "Disconnected"}</span>
          <span className="lg:hidden">Gmail</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950 transition-all cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backing Overlay */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3.5 w-80 z-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-5 duration-150">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity Logs</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.read;
                      return (
                        <div 
                          key={notif.id} 
                          onClick={(e) => isUnread && markRead(notif.id, e)}
                          className={`p-3.5 text-xs transition-colors cursor-pointer flex gap-3 items-start ${
                            isUnread ? "bg-blue-950/15 hover:bg-blue-950/25" : "hover:bg-slate-850"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border flex-shrink-0 mt-0.5 ${
                            notif.type === "AI" ? "bg-violet-950/30 border-violet-850/45 text-violet-400" :
                            notif.type === "Email" ? "bg-cyan-950/30 border-cyan-850/45 text-cyan-400" :
                            notif.type === "Security" ? "bg-amber-950/30 border-amber-850/45 text-amber-400" :
                            "bg-blue-950/30 border-blue-850/45 text-blue-400"
                          }`}>
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-slate-200">{notif.title}</span>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-1">{notif.message}</p>
                            <span className="text-[9px] text-slate-500 font-medium block mt-1.5">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div 
                  onClick={() => { setShowNotifications(false); setActiveTab("settings"); }}
                  className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  View Audit Trails
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Card / Dropdown */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{user.role}</span>
          </div>
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-slate-700"
          />
        </div>

      </div>
    </header>
  );
}
