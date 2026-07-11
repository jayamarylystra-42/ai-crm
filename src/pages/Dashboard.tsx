import React from "react";
import { 
  Building2, Mail, Users, Star, BarChart3, TrendingUp, CheckCircle, 
  Clock, ArrowRight, Sparkles, Inbox, RefreshCw, Layers 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { Company, Campaign, DashboardStats } from "../types";

interface DashboardProps {
  stats: DashboardStats;
  companies: Company[];
  campaigns: Campaign[];
  analyticsData: any;
  onSelectCompany: (company: Company) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ 
  stats, 
  companies, 
  campaigns, 
  analyticsData, 
  onSelectCompany, 
  setActiveTab 
}: DashboardProps) {
  
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const handleCompanyClick = (company: Company) => {
    onSelectCompany(company);
    setActiveTab("companies");
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-white">Apex Recruitment Intelligence Platform</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Analyze market sectors, generate targeted proposals using Google's Gemini AI, and automate Gmail campaigns securely from one unified dashboard.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("companies")}
            className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            Manage Pipelines
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 hover:scale-[1.01] transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">Total Lead Companies</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{stats.totalCompanies}</span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.5% MoM expansion</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 hover:scale-[1.01] transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">Today's Mail Outbox</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Mail className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{stats.todayEmailsSent}</span>
            <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold mt-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.repliesReceived} replies received</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 hover:scale-[1.01] transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">Recruitment Potential</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">~{stats.openPositionsEstimate}</span>
            <div className="flex items-center gap-1 text-[10px] text-violet-400 font-bold mt-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
              <span>Active headcount gaps</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700/80 hover:scale-[1.01] transition-all shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">Average Lead Quality</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Star className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{stats.avgLeadScore}%</span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>High AI scoring accuracy</span>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Email Outbox trends */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Outreach & Conversion Performance
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Last 7 Business Days</span>
          </div>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.emailSentTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} labelStyle={{ color: "#fff" }} />
                <Legend />
                <Bar dataKey="Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Replied" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Lead Scoring distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Corporate Lead Quality Status
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Distribution of AI computed lead score buckets</p>
          </div>

          <div className="h-48 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.scoreBuckets || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(analyticsData?.scoreBuckets || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold">
            {(analyticsData?.scoreBuckets || []).map((bucket: any, index: number) => (
              <div key={bucket.name} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{bucket.name}: {bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Widgets & lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent target companies leads table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-blue-500" />
              Recent Pipeline Targets
            </h3>
            <button 
              onClick={() => setActiveTab("companies")}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
            >
              View All Pipeline
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-2.5 font-bold">Company</th>
                  <th className="py-2.5 font-bold">Sector</th>
                  <th className="py-2.5 font-bold">Hiring Status</th>
                  <th className="py-2.5 font-bold">AI Score</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {companies.slice(0, 4).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850 transition-colors group">
                    <td className="py-3 font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{c.companyName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{c.city}, {c.country}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{c.industry}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.hiringStatus === "Mass Hiring" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        c.hiringStatus === "Hiring Soon" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {c.hiringStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-black text-xs ${
                        c.leadScore >= 90 ? "text-emerald-400" :
                        c.leadScore >= 70 ? "text-amber-400" :
                        "text-rose-400"
                      }`}>
                        {c.leadScore}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleCompanyClick(c)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Analyze Lead"
                      >
                        <ArrowRight className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: AI Follow up suggestions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-yellow-500 animate-pulse" />
              AI Intelligent Suggestions
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Recommended pitches and best outreach windows</p>
          </div>

          <div className="space-y-3.5">
            <div className="p-3 bg-blue-950/20 border border-blue-800/30 rounded-2xl text-xs">
              <div className="flex items-center justify-between font-bold text-blue-400">
                <span>Best Outreach Time</span>
                <span className="text-[10px] uppercase bg-blue-500/10 px-2 py-0.5 rounded-full">High probability</span>
              </div>
              <p className="text-slate-300 mt-2 font-semibold">Tuesday, 10:15 AM</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                TechNovus Solutions shows a 94% open potential index inside this morning slot. Pitch Senior Cloud Engineers.
              </p>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-400">
                <span>Funding Intelligence</span>
                <span className="text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">Recruit Now</span>
              </div>
              <p className="text-slate-300 mt-2 font-semibold">Scribe Health AI (Series A)</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                $8.5M secured. Recommended tone: <strong className="text-emerald-400">Premium / Professional</strong>. Emphasize medical machine learning compliance vetting.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
