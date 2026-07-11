import React, { useState, useEffect } from "react";
import { 
  Send, Sparkles, Building2, ListFilter, Play, Pause, XCircle, RefreshCw, 
  Clock, CheckCircle, AlertCircle, FileText, ChevronRight, Eye, Calendar,
  Search, Users, Mail, Plus, Trash2, ArrowRight
} from "lucide-react";
import { Company, Campaign, CampaignRecipient } from "../types";

interface BulkMailProps {
  companies: Company[];
  userRole: string;
}

export default function BulkMail({ companies, userRole }: BulkMailProps) {
  // App states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<(CampaignRecipient & { companyName: string; email: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);

  // Form states for creating campaign
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [aiTone, setAiTone] = useState("Professional");
  const [subjectTemplate, setSubjectTemplate] = useState("Partnership Proposal with {{CompanyName}}");
  const [bodyTemplate, setBodyTemplate] = useState(
    "Dear {{ContactName}},\n\nI was impressed by {{CompanyName}}'s continuous innovation in the {{Industry}} sector.\n\nWe would love to discuss a strategic recruitment partnership to help you scale your technology teams in {{City}}.\n\nBest regards,\nApex Recruitment Consulting Team"
  );

  // Filter/Search states for Company Selector
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [intensityFilter, setIntensityFilter] = useState("");

  // Scheduling states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  // Toast status
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Poll for active running campaigns
  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(() => {
      fetchCampaigns(true); // silent reload
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync recipients when selectedCampaign changes
  useEffect(() => {
    if (selectedCampaign) {
      fetchRecipients(selectedCampaign.id);
    } else {
      setRecipients([]);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async (silent = false) => {
    if (!silent) setCampaignLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data.campaigns);
        // Sync selected campaign status
        if (selectedCampaign) {
          const current = json.data.campaigns.find((c: Campaign) => c.id === selectedCampaign.id);
          if (current) setSelectedCampaign(current);
        }
      }
    } catch (e) {
      console.error("Failed to load campaigns", e);
    } finally {
      if (!silent) setCampaignLoading(false);
    }
  };

  const fetchRecipients = async (campaignId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/recipients`);
      const json = await res.json();
      if (json.success) {
        setRecipients(json.data.recipients);
      }
    } catch (e) {
      console.error("Failed to load recipients", e);
    } finally {
      setLoading(false);
    }
  };

  // Create campaign submit
  const handleCreateCampaign = async () => {
    if (!newCampaignName || selectedCompanyIds.length === 0) {
      showToast("error", "Campaign Name and at least 1 company are required.");
      return;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: newCampaignName,
          description: newDescription,
          companies: selectedCompanyIds,
          aiTone,
          subjectTemplate,
          bodyTemplate
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Campaign created successfully as Draft!");
        setIsCreating(false);
        // Reset fields
        setNewCampaignName("");
        setNewDescription("");
        setSelectedCompanyIds([]);
        fetchCampaigns();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to create campaign");
    }
  };

  // Generate AI Templates
  const handleAIGenerateTemplates = async () => {
    if (selectedCompanyIds.length === 0) {
      showToast("error", "Select at least 1 targeted company to prompt Gemini AI.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyIds[0], // Use first selected company as seed
          tone: aiTone,
          length: "Medium",
          proposalType: "Recruitment Proposal"
        })
      });
      const json = await res.json();
      if (json.success) {
        // Swap seed company name with template variable placeholder
        const seedCompany = companies.find(c => c.id === selectedCompanyIds[0]);
        let bodyText = json.data.body;
        let subjectText = json.data.subject;
        if (seedCompany) {
          const compRegex = new RegExp(seedCompany.companyName, "gi");
          const cityRegex = new RegExp(seedCompany.city, "gi");
          const indRegex = new RegExp(seedCompany.industry, "gi");
          bodyText = bodyText
            .replace(compRegex, "{{CompanyName}}")
            .replace(cityRegex, "{{City}}")
            .replace(indRegex, "{{Industry}}");
          subjectText = subjectText.replace(compRegex, "{{CompanyName}}");
        }
        setSubjectTemplate(subjectText);
        setBodyTemplate(bodyText);
        showToast("success", "AI generated templates crafted dynamically from seed company details!");
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", "Failed to consult Gemini. Ensure API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  // Campaign controls
  const handleStartCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/start`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Campaign execution started. Background workers dispatched.");
        fetchCampaigns();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to start campaign");
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/pause`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Campaign paused.");
        fetchCampaigns();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to pause campaign");
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/cancel`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Campaign cancelled successfully.");
        fetchCampaigns();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to cancel campaign");
    }
  };

  // Scheduling trigger
  const handleScheduleCampaign = async () => {
    if (!scheduleTime) {
      showToast("error", "Please select a valid schedule date & time.");
      return;
    }
    if (!selectedCampaign) return;

    try {
      const res = await fetch("/api/gmail/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          scheduleTime: new Date(scheduleTime).toISOString()
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Campaign scheduled successfully for ${new Date(scheduleTime).toLocaleString()}`);
        setShowScheduleModal(false);
        fetchCampaigns();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to schedule campaign");
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Company Selector calculations
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !industryFilter || c.industry === industryFilter;
    const matchesIntensity = !intensityFilter || c.recruitmentIntensity === intensityFilter;
    return matchesSearch && matchesIndustry && matchesIntensity;
  });

  const handleToggleSelectCompany = (id: string) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter(cid => cid !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCompanies.map(c => c.id);
    const allSelected = filteredIds.every(id => selectedCompanyIds.includes(id));
    if (allSelected) {
      setSelectedCompanyIds(selectedCompanyIds.filter(id => !filteredIds.includes(id)));
    } else {
      const unique = Array.from(new Set([...selectedCompanyIds, ...filteredIds]));
      setSelectedCompanyIds(unique);
    }
  };

  // Get distinct industries
  const industries = Array.from(new Set(companies.map(c => c.industry)));

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Send className="w-5.5 h-5.5 text-blue-500" />
            AI Bulk Outreach Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch, schedule, and live-track automated recruitment proposals across multiple corporate pipeline targets.
          </p>
        </div>
        {userRole !== "Viewer" && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Back to Tracking" : "Create Outreach Campaign"}
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {statusMsg && (
        <div className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-250 ${
          statusMsg.type === "success" 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
        }`}>
          {statusMsg.type === "success" ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {/* Creation Mode */}
      {isCreating ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Details & AI Template setup */}
          <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-500" />
              Campaign Outreach Blueprint
            </h2>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g., Q3 Fintech Executive Outreach"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Campaign Pitch Description</label>
                <input
                  type="text"
                  placeholder="Purpose of this outreach..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Gemini Generative Tone</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold"
                  >
                    <option value="Professional">Professional (Corporate)</option>
                    <option value="Executive">Executive (High-Tier)</option>
                    <option value="Premium">Premium Pitch</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Formal">Formal</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAIGenerateTemplates}
                    disabled={loading || selectedCompanyIds.length === 0}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 disabled:opacity-40 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[38px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generative AI Smart-Template
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subject Template Header</label>
                  <span className="text-[9px] text-slate-500 italic">Supported variables: {'{{CompanyName}}'}</span>
                </div>
                <input
                  type="text"
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Proposal Body Template</label>
                  <span className="text-[9px] text-slate-500 italic">Variables: {'{{CompanyName}}'}, {'{{City}}'}, {'{{Industry}}'}, {'{{ContactName}}'}</span>
                </div>
                <textarea
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-3.5 py-3 text-xs text-white outline-none transition-all h-60 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={selectedCompanyIds.length === 0 || !newCampaignName}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/15 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  Create Blueprint Draft
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Company Selection Filters & List */}
          <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  Target Cohort ({selectedCompanyIds.length} Selected)
                </h3>
                <span className="text-[10px] text-slate-500">Select pipeline target companies for this outreach list</span>
              </div>
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Toggle Page All
              </button>
            </div>

            {/* Quick Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-xs text-slate-400 outline-none"
              >
                <option value="">All Industries</option>
                {industries.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* List box */}
            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 select-none">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map(comp => {
                  const isSelected = selectedCompanyIds.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => handleToggleSelectCompany(comp.id)}
                      className={`p-3 border rounded-2xl flex justify-between items-center gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-blue-600/10 border-blue-500 text-white" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate block">{comp.companyName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                            comp.recruitmentIntensity === "High" 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : comp.recruitmentIntensity === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}>{comp.recruitmentIntensity}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {comp.industry} • {comp.city} • Lead Score: {comp.leadScore}%
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "bg-blue-600 border-blue-500" : "border-slate-700"
                      }`}>
                        {isSelected && <span className="text-[9px] text-white">✓</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <p className="text-xs">No matching target companies</p>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Tracking / Status Dashboard Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Campaigns List panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <ListFilter className="w-4 h-4 text-blue-500" />
              Active Blueprints ({campaigns.length})
            </h2>

            {campaignLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Syncing campaigns...</span>
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {campaigns.map(camp => {
                  const isSelected = selectedCampaign?.id === camp.id;
                  const total = camp.companies.length;
                  const sent = camp.emailsSent || 0;
                  const failed = camp.emailsFailed || 0;
                  const percent = total > 0 ? Math.round((sent + failed) / total * 100) : 0;

                  return (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCampaign(camp)}
                      className={`p-3.5 border rounded-2xl cursor-pointer transition-all space-y-3.5 ${
                        isSelected 
                          ? "bg-slate-950 border-blue-500 shadow-md shadow-blue-600/5" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs truncate leading-snug">{camp.campaignName}</h4>
                          <span className="text-[10px] text-slate-500 mt-1 block truncate">
                            {camp.description || "Outreach Campaign Blueprint"}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                          camp.status === "Running" 
                            ? "bg-emerald-500/10 text-emerald-400 animate-pulse" 
                            : camp.status === "Paused" 
                            ? "bg-amber-500/10 text-amber-400" 
                            : camp.status === "Completed"
                            ? "bg-blue-500/10 text-blue-400"
                            : camp.status === "Cancelled"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-slate-850 text-slate-500"
                        }`}>{camp.status}</span>
                      </div>

                      {/* Micro Progress */}
                      {camp.status !== "Draft" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                            <span>Dispatch Progress: {sent + failed} / {total}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-850/80 pt-2">
                        <span>{total} Targeted Co.</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          View Panel <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">No campaigns found</p>
                <p className="text-[10px] text-slate-600">Click the button top right to generate your first email outreach campaign.</p>
              </div>
            )}
          </div>

          {/* Right Column: Live Campaign Management details dashboard */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-5">
            {selectedCampaign ? (
              <div className="space-y-6">
                
                {/* Campaign Header Details */}
                <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Selected Campaign Blueprint</span>
                    <h3 className="text-base font-black text-white mt-1">{selectedCampaign.campaignName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedCampaign.description || "Active Outreach Campaign Blueprint"}</p>
                    {selectedCampaign.startDate && (
                      <span className="text-[10px] text-slate-500 font-semibold mt-2 block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Dispatched: {new Date(selectedCampaign.startDate).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar (Send/Pause/Schedule/Cancel) */}
                  {userRole !== "Viewer" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedCampaign.status === "Draft" && (
                        <>
                          <button
                            onClick={() => handleStartCampaign(selectedCampaign.id)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/10 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Send Outreach
                          </button>
                          
                          <button
                            onClick={() => setShowScheduleModal(true)}
                            className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Schedule
                          </button>
                        </>
                      )}

                      {selectedCampaign.status === "Running" && (
                        <button
                          onClick={() => handlePauseCampaign(selectedCampaign.id)}
                          className="px-3.5 py-1.5 bg-amber-600/10 border border-amber-600/25 hover:bg-amber-600/25 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          Pause Campaign
                        </button>
                      )}

                      {selectedCampaign.status === "Paused" && (
                        <button
                          onClick={() => handleStartCampaign(selectedCampaign.id)}
                          className="px-3.5 py-1.5 bg-emerald-600/15 border border-emerald-500/25 hover:bg-emerald-600/25 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Resume Outreach
                        </button>
                      )}

                      {(selectedCampaign.status === "Running" || selectedCampaign.status === "Paused") && (
                        <button
                          onClick={() => handleCancelCampaign(selectedCampaign.id)}
                          className="px-3.5 py-1.5 bg-rose-600/10 border border-rose-600/25 hover:bg-rose-600/20 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tracking stats display row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Total Targets</span>
                    <span className="text-lg font-black text-white mt-1 block">{selectedCampaign.companies.length}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">Delivered</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">{selectedCampaign.emailsSent || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block">Failed</span>
                    <span className="text-lg font-black text-rose-400 mt-1 block">{selectedCampaign.emailsFailed || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block">Replies</span>
                    <span className="text-lg font-black text-blue-400 mt-1 block">{selectedCampaign.replied || 0}</span>
                  </div>
                </div>

                {/* Templates preview collapse */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-850/60 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Generative Copy Templates
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-600/10 text-blue-400 font-bold rounded">Tone: {selectedCampaign.aiTone || "Professional"}</span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="text-[11px] font-bold text-slate-300 truncate">
                      <span className="text-slate-500 mr-1.5">Subject:</span>
                      {selectedCampaign.subjectTemplate}
                    </p>
                    <p className="text-[10.5px] text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/60 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {selectedCampaign.bodyTemplate}
                    </p>
                  </div>
                </div>

                {/* Target recipients list logs */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    Interactive Dispatch Queue
                  </span>
                  
                  <div className="max-h-[300px] overflow-y-auto border border-slate-850 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-500 border-b border-slate-850 font-bold uppercase tracking-wider text-[9px]">
                        <tr>
                          <th className="p-3">Target Company</th>
                          <th className="p-3">Target Email</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3">Log / Error Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 select-none">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                              <RefreshCw className="w-4 h-4 animate-spin inline mr-1.5" />
                              Loading Queue...
                            </td>
                          </tr>
                        ) : recipients.length > 0 ? (
                          recipients.map(r => (
                            <tr key={r.id} className="hover:bg-slate-950/40">
                              <td className="p-3 font-semibold text-white">{r.companyName}</td>
                              <td className="p-3 text-slate-400 font-mono text-[10.5px]">{r.email}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  r.status === "Sent" 
                                    ? "bg-emerald-500/10 text-emerald-400" 
                                    : r.status === "Failed" 
                                    ? "bg-rose-500/10 text-rose-400" 
                                    : "bg-slate-800 text-slate-400 animate-pulse"
                                }`}>{r.status}</span>
                              </td>
                              <td className="p-3 text-[10.5px] text-slate-500 italic max-w-xs truncate">
                                {r.error ? r.error : r.gmailMessageId ? `Gmail ID: ${r.gmailMessageId}` : "Awaiting queue dispatch"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                              No cohort recipients linked. They will generate automatically on campaign start.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-24 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 space-y-4">
                <Send className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-300">Outreach Campaign Manager Workspace</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Select an active outreach blueprint from the left navigation panel to view delivery progress, pause/cancel, or schedule draft dispatches.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Scheduler Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                Schedule Dispatch Date
              </h4>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-500 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400">
              Pick the future date and time to automatically trigger and begin this bulk campaign.
            </p>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Target Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 rounded-lg text-xs font-medium cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleScheduleCampaign}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
