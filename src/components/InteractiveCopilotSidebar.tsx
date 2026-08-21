import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Paperclip,
  Send,
  X,
  FileText,
  TrendingDown,
  AlertTriangle,
  HeartPulse,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface InteractiveCopilotSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClose?: () => void;
}

const QUICK_SUGGESTIONS = [
  {
    label: 'Audit findings',
    prompt: 'Explain all audit findings for the active case file.',
    icon: FileText,
    accent: 'text-cyan-400',
  },
  {
    label: 'Score drop reason',
    prompt: 'Why did the compliance score drop for this case?',
    icon: TrendingDown,
    accent: 'text-rose-400',
  },
  {
    label: 'Explain discrepancy',
    prompt: 'Explain the main billing or clinical mistake in simple terms.',
    icon: AlertTriangle,
    accent: 'text-amber-400',
  },
  {
    label: 'CPT 99291 vs 99284',
    prompt: 'What are the CPT documentation rules distinguishing Critical Care (99291) from Emergency Visit (99284)?',
    icon: HeartPulse,
    accent: 'text-emerald-400',
  },
];

export const InteractiveCopilotSidebar: React.FC<InteractiveCopilotSidebarProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <aside className="w-80 sm:w-[370px] flex-shrink-0 bg-[#070b14] border-l border-[#121927] flex flex-col h-full overflow-hidden select-none transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#121927] flex items-center justify-between bg-[#070b14]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]/20" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#ff2a85] uppercase">
            MAUDI COPILOT ASSISTANT
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* ONLINE Badge */}
          <div className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-[#00e676] bg-[#042319] border border-[#055138] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,230,118,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            <span>ONLINE</span>
          </div>

          {/* Close/Dismiss Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d30] transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Copilot Avatar Badge */}
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30">
                  <Sparkles className="w-3.5 h-3.5 fill-white/20" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-[#0d1424] border border-[#162136] text-[#cbd5e1] rounded-tl-none shadow-md font-sans'
                }`}
              >
                {msg.isInitial ? (
                  <div className="space-y-2 font-sans text-xs leading-relaxed text-[#cbd5e1]">
                    <p className="font-semibold text-white flex items-center gap-1.5">
                      <span>👋</span>
                      <span>Welcome to Clinical Forensic Copilot</span>
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Ask about case discrepancies, CPT coding standards (e.g. Critical Care 99291 time limits), clinical negligence findings, or general medical protocols.
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none text-[#cbd5e1] prose-headings:text-[#00e5ff] prose-headings:font-mono prose-strong:text-white">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono mt-1.5 tracking-wider uppercase ${
                    isUser ? 'text-blue-200 text-right' : 'text-[#475569]'
                  }`}
                >
                  {msg.timestamp || 'JUST NOW'}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5 fill-white/20 animate-pulse" />
            </div>
            <div className="bg-[#0d1424] border border-[#162136] rounded-2xl rounded-tl-none p-3 text-xs text-cyan-400 flex items-center gap-2.5 font-sans">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Copilot is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Clean Single-Row Quick Prompt Suggestions */}
      <div className="px-3 py-2 bg-[#060a12] border-t border-[#121927]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {QUICK_SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(item.prompt)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 bg-[#0c1322] hover:bg-[#141f36] border border-[#19263e] hover:border-cyan-500/40 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
              >
                <Icon className={`w-3 h-3 ${item.accent}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern Minimalist Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#121927] bg-[#070b14] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="p-2 text-slate-400 hover:text-white hover:bg-[#0f172a] rounded-lg transition-colors cursor-pointer"
          title="Attach document or note"
        >
          <Paperclip className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Maudi or question findings..."
            disabled={isLoading}
            className="w-full bg-[#0a0f1d] border border-[#192439] focus:border-[#ff2a85]/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-[#ff2a85]/30 font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            inputText.trim() && !isLoading
              ? 'bg-[#ff0055] text-white shadow-[0_0_10px_rgba(255,0,85,0.4)] hover:scale-105'
              : 'bg-[#101726] text-slate-600 border border-[#1a2336] cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
