import React from "react";
import { 
  LayoutDashboard, Building2, Mail, Sparkles, Inbox, 
  BarChart3, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Send, History
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  user, 
  onLogout 
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "HR Consultant", "Viewer"] },
    { id: "companies", label: "Companies", icon: Building2, roles: ["Super Admin", "Admin", "HR Consultant", "Viewer"] },
    { id: "campaigns", label: "Campaign Manager", icon: Inbox, roles: ["Super Admin", "Admin", "HR Consultant", "Recruitment Manager"] },
    { id: "bulk-mail", label: "Bulk Mail", icon: Send, roles: ["Super Admin", "Admin", "HR Consultant", "Recruitment Manager"] },
    { id: "email-generator", label: "Email Generator", icon: Mail, roles: ["Super Admin", "Admin", "HR Consultant"] },
    { id: "email-history", label: "Email History", icon: History, roles: ["Super Admin", "Admin", "HR Consultant", "Recruitment Manager", "Viewer"] },
    { id: "reports", label: "Reports", icon: FileSpreadsheet, roles: ["Super Admin", "Admin", "HR Consultant", "Recruitment Manager", "Viewer"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["Super Admin", "Admin", "HR Consultant", "Recruitment Manager", "Viewer"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["Super Admin"] },
  ];

  // Map icons since we want to avoid import issues
  function FileSpreadsheet(props: any) {
    return <Mail {...props} />;
  }

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col justify-between text-slate-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                Apex CRM
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Enterprise Suite v2.0</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1">
          {allowedItems.map((item) => {
            const Icon = item.id === "reports" ? BarChart3 : item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!collapsed && <span>{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <img 
            src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"} 
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate font-medium">{user.role}</p>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <button 
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg border border-rose-950/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        )}
      </div>
    </aside>
  );
}
