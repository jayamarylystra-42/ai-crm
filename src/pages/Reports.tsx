import React from "react";
import { 
  FileText, Download, Sparkles, Star, Layers, CheckCircle, ArrowRight,
  TrendingUp, BarChart3, PieChart as PieIcon, Globe, MapPin 
} from "lucide-react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from "recharts";
import { DashboardStats } from "../types";

interface ReportsProps {
  stats: DashboardStats;
  analyticsData: any;
}

export default function Reports({ stats, analyticsData }: ReportsProps) {
  
  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  const handlePrintPDF = () => {
    // Open a new tab pointed to `/api/reports/pdf`
    window.open("/api/reports/pdf", "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5.5 h-5.5 text-blue-500" />
            CRM Reports & Intelligence Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit conversion velocities, generate executive summaries, and export data spreadsheets.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/api/reports/excel"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CRM Excel
          </a>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Print Executive PDF
          </button>
        </div>
      </div>

      {/* Analytics Summary block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Candidate Quality Index</span>
            <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{stats.avgLeadScore}%</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Based on historical interview pipelines and matched profiles to targeted enterprise requirements.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Agency Success Index</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">76.5%</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Average open-to-reply ratio across the standard running recruitment campaign outreach pipelines.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Staffing Projects</span>
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">~{stats.openPositionsEstimate}</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Estimate of high value hiring positions currently available in your CRM pipeline.
            </p>
          </div>
        </div>

      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Industry Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              Target Pipeline Distribution
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Distribution across market sectors and industries</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.industryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(analyticsData?.industryDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Campaigns Success radar chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 animate-pulse" />
              Campaign Performance Metrics
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Campaign conversion, response and delivery statistics</p>
          </div>

          <div className="h-64 w-full text-xs flex items-center justify-center">
            {analyticsData?.campaignPerformance && analyticsData.campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analyticsData.campaignPerformance}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" stroke="#64748b" />
                  <PolarRadiusAxis stroke="#334155" />
                  <Radar name="Dispatched" dataKey="Sent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Replies" dataKey="Replied" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="p-8 text-center text-slate-600 font-semibold">No active campaigns tracked yet.</div>
            )}
          </div>
        </div>

        {/* Chart 3: Geography density column chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                Target Geography Map Densities
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Location metrics across primary active cities</p>
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase">Cities with highest outreach</span>
          </div>

          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.cityDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} labelStyle={{ color: "#fff" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#cbd5e1' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
