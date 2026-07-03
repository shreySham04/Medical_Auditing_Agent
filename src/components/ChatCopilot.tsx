import React from "react";
import { Sparkles, Paperclip, Send } from "lucide-react";
import { MarkdownViewer } from "./MarkdownViewer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string;
}

interface ChatCopilotProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  chatLoading: boolean;
  chatAttachedImage: string | null;
  onSendMessage: (presetText?: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachedImage: () => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  onClose?: () => void;
}

export const ChatCopilot: React.FC<ChatCopilotProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  chatAttachedImage,
  onSendMessage,
  onImageChange,
  onRemoveAttachedImage,
  imageInputRef,
  onClose,
}) => {
  return (
    <div className="bg-[#0D1117] flex flex-col h-full w-full select-text overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3.5 bg-[#121620] border-b border-[#21262D] flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          {/* Custom Gemini Sparkle Icon with Gradient */}
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 animate-pulse animate-duration-1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gemini-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="30%" stopColor="#FFD93D" />
                <stop offset="70%" stopColor="#4D96FF" />
                <stop offset="100%" stopColor="#6BCB77" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
              fill="url(#gemini-gradient-header)"
            />
          </svg>
          <span className="font-bold text-[11px] text-pink-400 tracking-wider uppercase font-mono">
            Interactive Audit Copilot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-emerald-400 font-mono px-2 py-0.5 bg-[#0D1117] rounded border border-emerald-950/40 select-none">
            ONLINE
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#21262D] transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090D14]">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[90%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"
            }`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold select-none ${
                msg.role === "user"
                  ? "bg-blue-600/30 border border-blue-500/20 text-blue-300"
                  : "bg-pink-600/25 border border-pink-500/20 text-pink-300"
              }`}
            >
              {msg.role === "user" ? "USER" : "COPI"}
            </div>

            <div className="space-y-1.5 max-w-full">
              <div
                className={`p-3 rounded-xl border leading-relaxed text-[11px] text-left ${
                  msg.role === "user"
                    ? "bg-[#1c212e]/80 border-[#3b82f6]/10 text-gray-200"
                    : "bg-[#121620]/90 border-[#21262D] text-gray-300"
                }`}
              >
                <div className="space-y-1">
                  <MarkdownViewer content={msg.text} />
                </div>

                {msg.image && (
                  <div className="mt-2.5 max-w-[200px] border border-[#21262D] rounded-lg overflow-hidden">
                    <img
                      src={msg.image}
                      alt="Attached record"
                      className="w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-pink-600/25 border border-pink-500/20 text-pink-300 flex items-center justify-center text-[9px] font-bold select-none">
              COPI
            </div>
            <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px] bg-[#121620] border border-[#21262D] px-3.5 py-2 rounded-xl">
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce animate-duration-1000" />
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce animate-duration-1000 [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce animate-duration-1000 [animation-delay:0.4s]" />
              <span className="ml-1 select-none">Reviewing case...</span>
            </div>
          </div>
        )}
      </div>

      {/* Presets and Interactive Controls */}
      <div className="p-3.5 bg-[#121620] border-t border-[#21262D] space-y-3 shrink-0">
        {/* Preset quick suggestions */}
        <div className="flex flex-wrap gap-1.5 select-none">
          <button
            onClick={() => onSendMessage("What are the audit findings?")}
            disabled={chatLoading}
            className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262d] border border-[#21262D] text-[10px] font-mono text-blue-400 hover:text-white transition-colors text-left cursor-pointer"
          >
            📋 Audit findings
          </button>
          <button
            onClick={() => onSendMessage("Why did the audit score drop?")}
            disabled={chatLoading}
            className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262d] border border-[#21262D] text-[10px] font-mono text-amber-500 hover:text-white transition-colors text-left cursor-pointer"
          >
            📉 Score drop
          </button>
          <button
            onClick={() => onSendMessage("Explain the mistake in this clinical record.")}
            disabled={chatLoading}
            className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262d] border border-[#21262D] text-[10px] font-mono text-red-400 hover:text-white transition-colors text-left cursor-pointer"
          >
            ⚠️ Explain mistake
          </button>
          <button
            onClick={() => onSendMessage("What is the standard supportive treatment and medicine for a common cold or cough?")}
            disabled={chatLoading}
            className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262d] border border-[#21262D] text-[10px] font-mono text-[#D29922] hover:text-white transition-colors text-left cursor-pointer"
          >
            🤒 Cold/Cough Remedies
          </button>
        </div>

        {/* Custom input form */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={imageInputRef}
            onChange={onImageChange}
            accept="image/*"
            className="hidden"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={chatLoading}
              className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                chatAttachedImage
                  ? "bg-pink-950/40 border-pink-700 text-pink-400"
                  : "bg-[#0D1117] border-[#21262D] hover:bg-[#1C2128] text-gray-400 hover:text-white"
              }`}
              title="Attach supplementary image"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            {chatAttachedImage && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            )}
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              disabled={chatLoading}
              placeholder="Ask Copilot or drop image..."
              className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg px-3 py-1.5 text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 disabled:opacity-50 pr-20"
            />

            {chatAttachedImage && (
              <div className="absolute right-2 top-1.5 flex items-center gap-1.5 bg-[#121620] border border-[#21262D] px-1.5 py-0.5 rounded text-[8px] text-pink-400 select-none">
                <span>Img Ready</span>
                <button
                  type="button"
                  onClick={onRemoveAttachedImage}
                  className="text-red-400 hover:text-red-300 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={chatLoading || (!chatInput.trim() && !chatAttachedImage)}
            className="p-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
