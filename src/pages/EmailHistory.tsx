import React, { useState, useEffect } from "react";
import { 
  History, Mail, Search, ListFilter, CheckCircle, AlertCircle, Clock, 
  Eye, RefreshCw, AlertTriangle, ArrowRight, User, Building2, Inbox
} from "lucide-react";
import { EmailHistory } from "../types";

interface EmailHistoryProps {
  userRole: string;
}

export default function EmailHistoryPage({ userRole }: EmailHistoryProps) {
  const [histories, setHistories] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailHistory | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState(""); // "Single" or "Campaign"

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchEmailHistories();
  }, []);

  const fetchEmailHistories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email-histories");
      const json = await res.json();
      if (json.success) {
        setHistories(json.data.emailHistories);
      }
    } catch (e) {
      console.error("Failed to load email histories", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySend = async (log: EmailHistory) => {
    if (userRole === "Viewer") return;
    setLoading(true);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: log.companyId,
          campaignId: log.campaignId,
          subject: log.subject,
          body: log.body
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Email successfully re-dispatched via Gmail! Tracking logs refreshed.");
        fetchEmailHistories();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to retry send. Gmail OAuth is required.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter histories
  const filteredHistories = histories.filter(h => {
    const searchTarget = `${h.subject} ${h.body} ${h.companyName || ""} ${h.campaignName || ""}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || h.status === statusFilter;
    const matchesSource = !sourceFilter || 
                          (sourceFilter === "Campaign" && h.campaignId) ||
                          (sourceFilter === "Single" && !h.campaignId);
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <History className="w-5.5 h-5.5 text-blue-500" />
          Outreach Transmission Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify delivery status, audit message headers, and inspect diagnostic errors for individual and bulk corporate mailings.
        </p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-250 ${
          toastMsg.type === "success" 
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
        }`}>
          {toastMsg.type === "success" ? <CheckCircle className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
          <span className="font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search subject, body copy, target company, campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-blue-500 transition-all font-semibold"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-semibold outline-none focus:border-blue-500"
          >
            <option value="">All Delivery Statuses</option>
            <option value="Sent">Sent (Success)</option>
            <option value="Failed">Failed (Error Logged)</option>
            <option value="Replied">Replied (Active Lead)</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-semibold outline-none focus:border-blue-500"
          >
            <option value="">All Dispatch Channels</option>
            <option value="Campaign">Campaign (Bulk Mailer)</option>
            <option value="Single">Single Outreach (Generator)</option>
          </select>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <button
            onClick={fetchEmailHistories}
            className="p-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 font-bold uppercase tracking-wider text-[9px] select-none">
              <tr>
                <th className="p-4">Target Company</th>
                <th className="p-4">Source Channel</th>
                <th className="p-4">Subject Header</th>
                <th className="p-4">Sent Time</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    <span className="text-xs mt-2 block">Refreshing tracking database...</span>
                  </td>
                </tr>
              ) : filteredHistories.length > 0 ? (
                filteredHistories.map(log => (
                  <tr key={log.id} className="hover:bg-slate-950/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <div>
                          <span className="font-bold text-white block">{log.companyName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Inbox className="w-3.5 h-3.5 text-blue-500" />
                        {log.campaignName}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold max-w-xs truncate">{log.subject}</td>
                    <td className="p-4 text-slate-500 text-[10.5px]">
                      {log.sentTime ? new Date(log.sentTime).toLocaleString() : "Awaiting transmission"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-flex items-center gap-1 ${
                        log.status === "Sent"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : log.status === "Failed"
                          ? "bg-rose-500/10 text-rose-400"
                          : log.status === "Replied"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {log.status === "Sent" && <CheckCircle className="w-3 h-3" />}
                        {log.status === "Failed" && <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Inspect Metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {log.status === "Failed" && userRole !== "Viewer" && (
                          <button
                            onClick={() => handleRetrySend(log)}
                            className="p-1.5 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/30 text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                            title="Retry Transmission"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-500 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-semibold text-slate-400">No transmission history found</p>
                    <p className="text-[10px] text-slate-600">Ensure your campaign dispatcher has processed targets or single emails are saved.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit inspect modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl max-w-xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Audit Dispatch Details
                </h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-500 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Meta details cards */}
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950 p-3.5 border border-slate-850 rounded-2xl">
              <div>
                <span className="text-slate-500 block">Target Company:</span>
                <span className="font-bold text-white block mt-0.5">{selectedLog.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Outreach Channel:</span>
                <span className="font-bold text-blue-400 block mt-0.5">{selectedLog.campaignName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gmail Message ID:</span>
                <span className="font-mono text-slate-400 block mt-0.5 select-all truncate">{selectedLog.gmailMessageId || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gmail Thread ID:</span>
                <span className="font-mono text-slate-400 block mt-0.5 select-all truncate">{selectedLog.gmailThreadId || "N/A"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Dispatch Time:</span>
                <span className="font-semibold text-white block mt-0.5">
                  {selectedLog.sentTime ? new Date(selectedLog.sentTime).toLocaleString() : "Not Dispatched"}
                </span>
              </div>
            </div>

            {/* Error panel if failed */}
            {selectedLog.status === "Failed" && selectedLog.error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <span className="font-bold">Transmission Failure Diagnostic:</span>
                  <p className="mt-0.5 text-[10.5px] italic">"{selectedLog.error}"</p>
                </div>
              </div>
            )}

            {/* Content preview */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Delivered Copy Body</span>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-xs space-y-3 leading-relaxed text-slate-300 h-64 overflow-y-auto">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Subject Header:</span>
                  <span className="text-white font-bold">{selectedLog.subject}</span>
                </div>
                <div className="border-t border-slate-850/60 pt-2.5">
                  <span className="text-slate-500 font-bold block mb-1">Email Body:</span>
                  <p className="whitespace-pre-wrap font-medium">{selectedLog.body}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-950 border border-slate-850 text-slate-400 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
              {selectedLog.status === "Failed" && userRole !== "Viewer" && (
                <button
                  onClick={() => {
                    handleRetrySend(selectedLog);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry Now
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
