import React, { useState, useEffect } from "react";
import { 
  Mail, Sparkles, Building2, Layers, Cpu, Copy, Save, Send, 
  RefreshCw, Check, ArrowRight, AlertCircle, FileText, CheckCircle 
} from "lucide-react";
import { Company } from "../types";

interface EmailGeneratorProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company | null) => void;
  userRole: string;
}

export default function EmailGenerator({
  companies,
  selectedCompany,
  onSelectCompany,
  userRole
}: EmailGeneratorProps) {
  // Option Controls
  const [proposalType, setProposalType] = useState("Recruitment Proposal");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState<"Short" | "Medium" | "Long">("Medium");

  // Output draft details
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // States
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Auto generate suggestion or reset state when company selection changes
    if (selectedCompany) {
      setSubject("");
      setBody("");
      setStatusMsg(null);
    }
  }, [selectedCompany]);

  const handleGenerate = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    setCopied(false);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          tone,
          length,
          proposalType
        })
      });
      const json = await res.json();
      if (json.success) {
        setSubject(json.data.subject);
        setBody(json.data.body);
      } else {
        throw new Error(json.message);
      }
    } catch (e: any) {
      setStatusMsg({ type: "error", text: "AI Email generation failed. Ensure your GEMINI_API_KEY is active." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!selectedCompany || !subject || !body) return;
    try {
      const res = await fetch("/api/gmail/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          subject,
          body
        })
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: "Draft successfully saved in your connected Gmail account!" });
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to create Gmail draft. Ensure Gmail is connected." });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedCompany || !subject || !body) return;
    if (!confirm(`Are you sure you want to send this email to ${selectedCompany.companyName} (${selectedCompany.email}) immediately via Gmail API?`)) return;
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          subject,
          body
        })
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: "Email proposal dispatched successfully through Gmail API! message ID logged." });
        // Update company state if possible
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to send email. Verify your OAuth permissions." });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Mail className="w-5.5 h-5.5 text-blue-500" />
          AI Recruitment Proposal Generator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compose highly tailored partnership proposals using target technology stacks and automated Gmail syncing.
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Pipeline Targets Selector & Overview */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pipeline Targets</span>
            <select
              value={selectedCompany?.id || ""}
              onChange={(e) => {
                const found = companies.find(c => c.id === e.target.value);
                onSelectCompany(found || null);
              }}
              className="w-full mt-2 bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all font-semibold"
            >
              <option value="">-- Select Active Target Lead --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.industry.substring(0, 15)}...)</option>
              ))}
            </select>
          </div>

          {selectedCompany ? (
            <div className="space-y-4 animate-in fade-in-5 duration-150">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs leading-none">{selectedCompany.companyName}</h3>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">{selectedCompany.city}, {selectedCompany.country}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">Industry:</span>
                  <span className="font-semibold text-slate-300">{selectedCompany.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hiring Indicator:</span>
                  <span className="font-semibold text-blue-400">{selectedCompany.hiringStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Company Size:</span>
                  <span className="font-semibold text-slate-300">{selectedCompany.employees} Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Email:</span>
                  <span className="font-semibold text-slate-300">{selectedCompany.email}</span>
                </div>
              </div>

              {selectedCompany.tags.length > 0 && (
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Identified Technology Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCompany.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-850 border border-slate-800 rounded text-[9px] text-slate-400 font-semibold">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompany.notes && (
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Consultant Directives</span>
                  <p className="text-[10.5px] text-slate-400 italic">"{selectedCompany.notes}"</p>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-1">
              <Building2 className="w-6 h-6 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">No Target Selected</p>
              <p className="text-[10px] text-slate-600">Choose a corporate pipeline lead from the selector dropdown to load details.</p>
            </div>
          )}
        </div>

        {/* Right Side: Proposal configuration & Text draft Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-5">
          
          {/* Tone & Layout Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-800 pb-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Outreach Purpose</label>
              <select
                value={proposalType}
                onChange={(e) => setProposalType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none transition-all font-semibold"
              >
                <option value="Recruitment Proposal">Recruitment Proposal</option>
                <option value="Business Proposal">Business Proposal</option>
                <option value="Follow-up Email">Follow-up Email</option>
                <option value="Reminder">Outreach Reminder</option>
                <option value="CEO outreach">CEO Outreach</option>
                <option value="Business Development">Business Development</option>
                <option value="Thank You">Thank You Greeting</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">AI Pitch Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none transition-all font-semibold"
              >
                <option value="Professional">Professional (Corporate)</option>
                <option value="Corporate">Corporate (Direct)</option>
                <option value="Executive">Executive (High-Tier)</option>
                <option value="Premium">Premium (Value Pitch)</option>
                <option value="Friendly">Friendly (Casual)</option>
                <option value="Formal">Formal (Standard)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Template Length</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-850 rounded-xl">
                {(["Short", "Medium", "Long"] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                      length === l ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Trigger Block */}
          {selectedCompany && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Generated Draft Preview</span>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                    Write Custom Proposal
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status logs */}
          {statusMsg && (
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 ${
              statusMsg.type === "success" 
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              {statusMsg.type === "success" ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Core Text Outputs */}
          {selectedCompany && (subject || body || loading) ? (
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject Header</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject template loads here..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Content Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Body template drafts here..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-3.5 py-3 text-xs text-white outline-none transition-all h-64 resize-none leading-relaxed"
                />
              </div>

              {/* Composition actions panel */}
              {userRole !== "Viewer" && (subject || body) && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap justify-between gap-3">
                  
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Clipboard"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDraft}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Draft
                    </button>
                    
                    <button
                      onClick={handleSendEmail}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/15 cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Send Gmail
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="p-16 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 space-y-4">
              <Mail className="w-10 h-10 mx-auto text-slate-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-300">Outreach Proposal Workspace</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select an active company lead, customize your desired outreach tone/length parameters, and trigger Gemini AI to compose a high-fidelity proposal email.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
