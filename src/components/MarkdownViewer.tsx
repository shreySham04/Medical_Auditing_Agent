import React from "react";

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  if (!content) return null;

  // Render text cleanly with support for simple Markdown styles
  const lines = content.split("\n");
  
  return (
    <div className="space-y-1 font-mono text-[11px] leading-relaxed select-text">
      {lines.map((line, idx) => {
        // Heading styles
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-md font-bold text-gray-100 border-b border-[#30363D] pb-1.5 mt-3 mb-2 tracking-tight flex items-center gap-1.5 font-sans">
              <span className="text-[#58A6FF]/70">#</span> {line.replace("#", "").trim()}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-sm font-semibold text-gray-200 mt-2.5 mb-1.5 tracking-tight flex items-center gap-1.5 font-sans">
              <span className="text-[#3FB950]/70">##</span> {line.replace("##", "").trim()}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-xs font-semibold text-blue-300 uppercase tracking-widest mt-2 px-1.5 py-0.5 rounded bg-[#1C2128] border border-[#30363D] inline-block font-sans mb-1.5">
              {line.replace("###", "").trim()}
            </h3>
          );
        }

        // Tag and bold styles
        const exactBoundaryRegex = /(\*\*.*?\*\*|\bPASS\b|\bFLAGGED\b)/g;
        const fragments = line.split(exactBoundaryRegex);

        const computedLine = fragments.map((frag, idx2) => {
          if (!frag) return null;
          if (frag.startsWith("**") && frag.endsWith("**")) {
            return (
              <strong key={idx2} className="text-blue-200 font-semibold">
                {frag.substring(2, frag.length - 2)}
              </strong>
            );
          } else if (frag === "PASS") {
            return (
              <span key={idx2} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/70 border border-[#2ea043]/30 text-[#3FB950] font-bold tracking-wide">
                {frag}
              </span>
            );
          } else if (frag === "FLAGGED") {
            return (
              <span key={idx2} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/70 border border-[#9e7a28]/30 text-[#D29922] font-bold tracking-wide">
                {frag}
              </span>
            );
          }
          return <span key={idx2}>{frag}</span>;
        });

        if (line.startsWith("- ")) {
          return (
            <div key={idx} className="flex gap-2 pl-2 mb-1 text-gray-300 font-mono text-[11px] leading-relaxed">
              <span className="text-[#58A6FF]/80 font-bold">•</span>
              <div>{computedLine}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="font-mono text-[11px] text-[#C9D1D9] leading-relaxed mb-1 px-1">
            {computedLine}
          </p>
        );
      })}
    </div>
  );
};
