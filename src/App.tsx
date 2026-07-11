import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.js";
import Navbar from "./components/Navbar.js";
import Chatbot from "./components/Chatbot.js";
import Auth from "./pages/Auth.js";
import Dashboard from "./pages/Dashboard.js";
import Companies from "./pages/Companies.js";
import Campaigns from "./pages/Campaigns.js";
import EmailGenerator from "./pages/EmailGenerator.js";
import BulkMail from "./pages/BulkMail.js";
import EmailHistoryPage from "./pages/EmailHistory.js";
import Reports from "./pages/Reports.js";
import SettingsPage from "./pages/Settings.js";
import { User, Company, Campaign, DashboardStats, OAuthStatus } from "./types.js";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Core Database Lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ connected: false });
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeCampaigns: 0,
    gmailConnected: false,
    todayEmailsSent: 0,
    repliesReceived: 0,
    avgLeadScore: 70,
    monthlyGrowthRate: 14.5,
    openPositionsEstimate: 0
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Multi-panel focus selectors
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Check current session
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.data.user) {
        setUser(json.data.user);
      }
    } catch (e) {
      console.warn("Session check offline");
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      fetchCompanies(),
      fetchCampaigns(),
      fetchOAuthStatus(),
      fetchAnalytics()
    ]);
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const json = await res.json();
      if (json.success) {
        setCompanies(json.data.companies || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOAuthStatus = async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const json = await res.json();
      if (json.success) {
        setOauthStatus(json.data || { connected: false });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalyticsData(json.data);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // API Callbacks
  const handleAddCompany = async (payload: any) => {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "X-User-Id": user?.id || "", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return json.data.company;
    } else {
      throw new Error(json.message);
    }
  };

  const handleUpdateCompany = async (id: string, payload: any) => {
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "X-User-Id": user?.id || "", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return json.data.company;
    } else {
      throw new Error(json.message);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const res = await fetch(`/api/companies/${id}`, {
      method: "DELETE",
      headers: { "X-User-Id": user?.id || "" }
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return true;
    } else {
      throw new Error(json.message);
    }
  };

  const handleTriggerAIAnalyze = async (companyId: string) => {
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId })
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return json.data.analysis;
    } else {
      throw new Error(json.message);
    }
  };

  const handleCreateCampaign = async (payload: any) => {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "X-User-Id": user?.id || "", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return json.data.campaign;
    } else {
      throw new Error(json.message);
    }
  };

  const handleTriggerBulkSend = async (campaignId: string) => {
    const res = await fetch("/api/gmail/bulk-send", {
      method: "POST",
      headers: { "X-User-Id": user?.id || "", "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId })
    });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return json.data;
    } else {
      throw new Error(json.message);
    }
  };

  const handleDisconnectGmail = async () => {
    const res = await fetch("/api/gmail/disconnect", { method: "POST" });
    const json = await res.json();
    if (json.success) {
      await loadAllData();
      return true;
    } else {
      throw new Error(json.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Sidebar Rail */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300" 
        style={{ paddingLeft: sidebarCollapsed ? "80px" : "256px" }}
      >
        {/* Sticky Header Topbar */}
        <Navbar
          user={user}
          onQuickAdd={() => {
            setSelectedCompany(null);
            setActiveTab("companies");
            // Set simple timer to trigger Companies page add modal
            setTimeout(() => {
              const btn = document.querySelector('[title="New Target Lead"]') || document.querySelector("button:contains('New Target Lead')");
              if (btn) (btn as HTMLButtonElement).click();
            }, 100);
          }}
          setActiveTab={setActiveTab}
          oauthStatus={oauthStatus}
          refreshAll={loadAllData}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1400px] w-full mx-auto">
          
          {activeTab === "dashboard" && (
            <Dashboard
              stats={stats}
              companies={companies}
              campaigns={campaigns}
              analyticsData={analyticsData}
              onSelectCompany={setSelectedCompany}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "companies" && (
            <Companies
              companies={companies}
              onAddCompany={handleAddCompany}
              onUpdateCompany={handleUpdateCompany}
              onDeleteCompany={handleDeleteCompany}
              onTriggerAIAnalyze={handleTriggerAIAnalyze}
              onSelectCompany={setSelectedCompany}
              setActiveTab={setActiveTab}
              userRole={user.role}
            />
          )}

          {activeTab === "campaigns" && (
            <Campaigns
              campaigns={campaigns}
              companies={companies}
              onCreateCampaign={handleCreateCampaign}
              onTriggerBulkSend={handleTriggerBulkSend}
              onDeleteCampaign={onDeleteCampaign => fetch(`/api/campaigns/${onDeleteCampaign}`, { method: 'DELETE' }).then(r=>r.json()).then(()=>loadAllData())}
              setActiveTab={setActiveTab}
              userRole={user.role}
            />
          )}

          {activeTab === "bulk-mail" && (
            <BulkMail
              companies={companies}
              userRole={user.role}
            />
          )}

          {activeTab === "email-generator" && (
            <EmailGenerator
              companies={companies}
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              userRole={user.role}
            />
          )}

          {activeTab === "email-history" && (
            <EmailHistoryPage
              userRole={user.role}
            />
          )}

          {activeTab === "reports" && (
            <Reports
              stats={stats}
              analyticsData={analyticsData}
            />
          )}

          {activeTab === "analytics" && (
            <Reports
              stats={stats}
              analyticsData={analyticsData}
            />
          )}

          {activeTab === "settings" && (
            <SettingsPage
              user={user}
              oauthStatus={oauthStatus}
              onDisconnectGmail={handleDisconnectGmail}
            />
          )}

        </main>
      </div>

      {/* Interactive Floating Chatbot */}
      <Chatbot />

    </div>
  );
}
