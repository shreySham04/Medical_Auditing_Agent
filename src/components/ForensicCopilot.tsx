import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { MessageSquareCode, Send, Bot, User, Sparkles, Terminal, ShieldAlert } from 'lucide-react';

interface ForensicCopilotProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const ForensicCopilot: React.FC<ForensicCopilotProps> = ({
  messages,
  onSendMessage,
  isLoading
}) => {
  const [input, setInput] = useState('');

  const quickPrompts = [
    "List high-risk upcoding cases in the database",
    "Audit Sarah Jenkins CPT 99285 for billing fraud",
    "Explain how the multi-agent referee supervisor resolves conflicts",
    "Show CPT benchmark accuracy stats for Cardiology"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    await onSendMessage(userText);
  };

  const handleQuickPromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-[720px] flex flex-col justify-between shadow-xl">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Forensic Medical Copilot
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Connected to Python Agent Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">Ask natural language queries regarding CPT benchmarks, EHR audits, or clinical negligence.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>MCP Server Ready</span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Forensic Copilot is ready</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Ask questions about clinical guidelines, billing fraud algorithms, or trigger live re-audits directly from chat.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`text-[10px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono animate-pulse p-2">
            <Bot className="w-4 h-4" />
            <span>Python Multi-Agent Copilot analyzing query...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPromptClick(qp)}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or query to Forensic Medical Copilot..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Copilot</span>
          </button>
        </form>
      </div>
    </div>
  );
};
