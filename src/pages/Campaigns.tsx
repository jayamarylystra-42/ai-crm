import React, { useState } from "react";
import { 
  Inbox, Sparkles, Plus, Play, Trash2, Eye, X, CheckSquare, 
  AlertCircle, ArrowRight, Layers, BarChart3, Settings, HelpCircle, 
  LogOut, RefreshCw, MailOpen, UserCheck, MessageSquare, Copy, Archive, Edit3, Filter
} from "lucide-react";
import { Campaign, Company } from "../types";

interface CampaignsProps {
  campaigns: Campaign[];
  companies: Company[];
  onCreateCampaign: (campaign: any) => Promise<any>;
  onTriggerBulkSend: (campaignId: string) => Promise<any>;
  onDeleteCampaign: (id: string) => Promise<any>;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

export default function Campaigns({
  campaigns,
  companies,
  onCreateCampaign,
  onTriggerBulkSend,
  onDeleteCampaign,
  setActiveTab,
  userRole
}: CampaignsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [runningCampaignId, setRunningCampaignId] = useState<string | null>(null);

  // Status Filter Tab state
  const [activeStatusTab, setActiveStatusTab] = useState<string>("All");

  // Form State (Create)
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [tone, setTone] = useState("Professional");
  const [subject, setSubject] = useState("Specialized Recruiting Partnerships for {{CompanyName}}");
  const [body, setBody] = useState("Hi hiring leaders at {{CompanyName}},\n\nI noticed your team is currently in expanding mode in {{City}}.\nAt Apex CRM, we match elite developers with companies in the {{Industry}} sector.\n\nLet's coordinate a 10 minute sync this week?\n\nBest regards,\nSarah Consultant");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State (Edit)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTone, setEditTone] = useState("Professional");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSelectedCompanies, setEditSelectedCompanies] = useState<string[]>([]);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const handleSelectCompany = (id: string) => {
    setSelectedCompanies(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map(c => c.id));
    }
  };

  const handleSelectCompanyEdit = (id: string) => {
    setEditSelectedCompanies(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllEdit = () => {
    if (editSelectedCompanies.length === companies.length) {
      setEditSelectedCompanies([]);
    } else {
      setEditSelectedCompanies(companies.map(c => c.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedCompanies.length === 0) {
      setErrorMsg("Please select at least one target company lead for outreach.");
      return;
    }

    try {
      await onCreateCampaign({
        campaignName: name,
        description: desc,
        companies: selectedCompanies,
        aiTone: tone,
        subjectTemplate: subject,
        bodyTemplate: body
      });
      setShowCreateModal(false);
      // Reset form
      setName("");
      setDesc("");
      setSelectedCompanies([]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create outreach campaign.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg(null);
    if (!editingCampaign) return;

    if (editSelectedCompanies.length === 0) {
      setEditErrorMsg("Please select at least one target company lead.");
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: editName,
          description: editDesc,
          aiTone: editTone,
          subjectTemplate: editSubject,
          bodyTemplate: editBody,
          companies: editSelectedCompanies
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowEditModal(false);
        window.location.reload();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setEditErrorMsg(err.message || "Failed to edit campaign.");
    }
  };

  const handleDuplicateCampaign = async (id: string) => {
    if (userRole === "Viewer") return;
    try {
      const res = await fetch(`/api/campaigns/duplicate/${id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert("Failed to duplicate campaign");
    }
  };

  const handleArchiveCampaign = async (id: string) => {
    if (userRole === "Viewer") return;
    if (!confirm("Are you sure you want to mark this campaign as Completed (Archived)?")) return;
    try {
      const res = await fetch(`/api/campaigns/archive/${id}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert("Failed to archive campaign");
    }
  };

  const handleRunCampaign = async (campaignId: string) => {
    if (!confirm("Execute bulk campaign? This will formulate personalized templates using Gemini AI and dispatch via Gmail API immediately.")) return;
    setRunningCampaignId(campaignId);
    try {
      await onTriggerBulkSend(campaignId);
    } catch (e) {
      alert("Failed to complete bulk mail run. Ensure OAuth status is active.");
    } finally {
      setRunningCampaignId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete outreach campaign: '${name}'?`)) return;
    try {
      await onDeleteCampaign(id);
    } catch (e) {
      alert("Failed to delete campaign.");
    }
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setEditName(c.campaignName);
    setEditDesc(c.description || "");
    setEditTone(c.aiTone || "Professional");
    setEditSubject(c.subjectTemplate);
    setEditBody(c.bodyTemplate);
    setEditSelectedCompanies(c.companies || []);
    setShowEditModal(true);
  };

  // Filter campaigns based on Active Status Tab
  const filteredCampaigns = campaigns.filter(c => {
    if (activeStatusTab === "All") return true;
    return c.status === activeStatusTab;
  });

  const statuses = ["All", "Draft", "Running", "Completed", "Paused", "Cancelled"];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Inbox className="w-5.5 h-5.5 text-blue-500" />
            AI Bulk Campaign Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build target cohorts, assign templates, duplicate active workflows, and dispatch high-volume customized mail sequences seamlessly.
          </p>
        </div>

        {userRole !== "Viewer" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Outreach Cohort
          </button>
        )}
      </div>

      {/* Status Tabs Bar */}
      <div className="flex border-b border-slate-800 pb-px gap-1 overflow-x-auto select-none">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setActiveStatusTab(st)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === st
                ? "border-blue-500 text-white bg-slate-900/40"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {st} Campaigns ({campaigns.filter(c => st === "All" || c.status === st).length})
          </button>
        ))}
      </div>

      {/* Campaigns list rendering */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-16 text-center border border-slate-800 bg-slate-900 rounded-3xl space-y-4">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No {activeStatusTab !== "All" ? activeStatusTab : ""} Campaigns Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create an outreach cohort, multi-select target leads, configure subject parameters, and launch bulk emails.</p>
          {userRole !== "Viewer" && activeStatusTab === "All" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/15 cursor-pointer"
            >
              Get Started
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCampaigns.map((c) => {
            const isRunning = runningCampaignId === c.id;
            const openRate = c.emailsSent > 0 ? Math.round((c.opened / c.emailsSent) * 100) : 0;
            const replyRate = c.emailsSent > 0 ? Math.round((c.replied / c.emailsSent) * 100) : 0;

            return (
              <div 
                key={c.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{c.aiTone} Outreach</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      c.status === "Running" ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 animate-pulse" :
                      c.status === "Completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                      c.status === "Paused" ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                      c.status === "Cancelled" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" :
                      "bg-slate-800 text-slate-400 border border-slate-750"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{c.campaignName}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{c.description || "No description provided."}</p>
                  
                  {/* Scope info */}
                  <div className="flex items-center gap-2 mt-3.5 text-[11px] text-slate-500 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Target Cohort: {c.companies?.length || 0} corporate leads</span>
                  </div>
                </div>

                {/* Statistics panel */}
                {c.emailsSent > 0 && (
                  <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850 text-center my-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Sent</span>
                      <span className="text-sm font-black text-white mt-1 block">{c.emailsSent}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Open %</span>
                      <span className="text-sm font-black text-blue-400 mt-1 block flex items-center justify-center gap-1">
                        <MailOpen className="w-3.5 h-3.5 text-blue-500" />
                        {openRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Reply %</span>
                      <span className="text-sm font-black text-emerald-400 mt-1 block flex items-center justify-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        {replyRate}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                  
                  <div className="flex gap-1.5">
                    {userRole !== "Viewer" && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
                          title="Edit Campaign Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateCampaign(c.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
                          title="Duplicate Campaign"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {c.status !== "Completed" && (
                          <button
                            onClick={() => handleArchiveCampaign(c.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
                            title="Complete & Archive Campaign"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}

                    {userRole !== "Viewer" && c.status === "Draft" && (
                      <button
                        onClick={() => handleRunCampaign(c.id)}
                        disabled={isRunning}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Dispatch
                          </>
                        )}
                      </button>
                    )}
                    
                    {userRole !== "Viewer" && (
                      <button
                        onClick={() => handleDelete(c.id, c.campaignName)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 transition-colors border border-rose-950/20 cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Create New Outreach Cohort</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-5 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Q3 High-Growth Tech Outreach"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cohort Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="E.g. Outreach targeting logistics operations and software development companies."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>

              {/* Multi Select companies check list */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Select Target Leads ({selectedCompanies.length} selected)</label>
                  <button 
                    type="button" 
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {selectedCompanies.length === companies.length ? "Deselect All" : "Select All Leads"}
                  </button>
                </div>
                
                <div className="border border-slate-850 bg-slate-950 rounded-2xl p-3 max-h-24 overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
                  {companies.map(c => {
                    const isChecked = selectedCompanies.includes(c.id);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => handleSelectCompany(c.id)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                          isChecked 
                            ? "bg-blue-600/10 border-blue-500 text-white" 
                            : "bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700"
                        }`}>
                          {isChecked && "✓"}
                        </span>
                        <span className="truncate">{c.companyName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Subject Template</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">AI Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Executive">Executive</option>
                    <option value="Premium">Premium</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Body Outreach Template</label>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tags: {'{{CompanyName}}'}, {'{{City}}'}, {'{{Industry}}'}</span>
                </div>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all h-28 resize-none font-mono leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Create Campaign
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Edit Campaign Blueprint</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="mx-5 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cohort Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all"
                />
              </div>

              {/* Multi Select companies check list */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Target Leads ({editSelectedCompanies.length} selected)</label>
                  <button 
                    type="button" 
                    onClick={handleSelectAllEdit}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {editSelectedCompanies.length === companies.length ? "Deselect All" : "Select All Leads"}
                  </button>
                </div>
                
                <div className="border border-slate-850 bg-slate-950 rounded-2xl p-3 max-h-24 overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
                  {companies.map(c => {
                    const isChecked = editSelectedCompanies.includes(c.id);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => handleSelectCompanyEdit(c.id)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                          isChecked 
                            ? "bg-blue-600/10 border-blue-500 text-white" 
                            : "bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700"
                        }`}>
                          {isChecked && "✓"}
                        </span>
                        <span className="truncate">{c.companyName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Subject Template</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">AI Tone</label>
                  <select
                    value={editTone}
                    onChange={(e) => setEditTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Executive">Executive</option>
                    <option value="Premium">Premium</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Body Outreach Template</label>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tags: {'{{CompanyName}}'}, {'{{City}}'}, {'{{Industry}}'}</span>
                </div>
                <textarea
                  required
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none h-28 resize-none font-mono leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
