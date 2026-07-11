import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Trash2, Maximize2, Sparkles, SendHorizontal } from "lucide-react";
import { ChatMessage } from "../types";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chatbot/messages");
      const json = await res.json();
      if (json.success) {
        setMessages(json.data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load chat messages", e);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setLoading(true);

    // Optimistically update UI
    const tempUserMsg: ChatMessage = {
      id: "temp-user-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      });
      const json = await response.json();
      if (json.success) {
        await fetchMessages();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      // Add error message optimistically
      const tempBotMsg: ChatMessage = {
        id: "temp-bot-" + Date.now(),
        sender: "bot",
        text: "I experienced an error analyzing that. Please ensure your GEMINI_API_KEY is configured in the settings or secrets panel.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!confirm("Are you sure you want to clear your conversation history?")) return;
    try {
      const res = await fetch("/api/chatbot/clear", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setMessages([]);
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-500/30 flex items-center justify-center"
        title="AI Assistant Companion"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-600/10 rounded-lg border border-blue-500/20">
                <Bot className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  Apex AI Companion
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={clearChat}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/60 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-500" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none font-medium shadow-md shadow-blue-600/10" 
                      : "bg-slate-850 text-slate-300 border border-slate-800 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
                <div className="p-3 bg-slate-850 text-slate-400 border border-slate-800 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for proposals, candidates, or lead score..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/15 cursor-pointer flex items-center justify-center transition-all"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
