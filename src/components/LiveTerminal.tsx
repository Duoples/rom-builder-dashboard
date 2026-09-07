"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Terminal as TerminalIcon,
  Search,
  Download,
  Copy,
  Maximize2,
  Minimize2,
  Trash2,
  Check,
  ArrowDown,
  Filter,
} from "lucide-react";
import { LogEntry } from "@/lib/types";

interface LiveTerminalProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp.split("T")[1].substring(0, 8)}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duoplesos-build-${new Date().toISOString().replace(/[:.]/g, "-")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== "all" && log.level !== filterLevel) return false;
    if (!searchQuery) return true;
    return log.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatLine = (text: string, level: LogEntry["level"]) => {
    if (level === "error" || text.includes("error:") || text.includes("FAILED:")) {
      return <span className="text-rose-400 font-semibold">{text}</span>;
    }
    if (level === "warn" || text.includes("warning:") || text.includes("[W][")) {
      return <span className="text-amber-300">{text}</span>;
    }
    if (text.startsWith("[*]") || text.startsWith("===")) {
      return <span className="text-cyan-300 font-medium">{text}</span>;
    }
    if (text.startsWith("[") && text.includes("%")) {
      const match = text.match(/^(\[\s*\d+%\s*\d+\/\d+\])(.*)/);
      if (match) {
        return (
          <span>
            <span className="text-indigo-400 font-bold">{match[1]}</span>
            <span className="text-slate-300">{match[2]}</span>
          </span>
        );
      }
    }
    return <span className="text-slate-300">{text}</span>;
  };

  return (
    <div
      className={`glass-panel rounded-2xl flex flex-col border border-slate-800/80 transition-all ${
        isFullScreen ? "fixed inset-4 z-50 shadow-2xl bg-slate-950/95" : "w-full h-[520px]"
      }`}
    >
      {/* Terminal Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>live_build_stream.log</span>
            <span className="text-[11px] text-slate-500">({filteredLogs.length} lines)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-3 py-1 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 sm:w-44"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFilterLevel("all")}
              className={`px-2 py-0.5 rounded-md ${
                filterLevel === "all" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterLevel("error")}
              className={`px-2 py-0.5 rounded-md ${
                filterLevel === "error" ? "bg-rose-900/60 text-rose-300 font-medium" : "text-slate-400 hover:text-white"
              }`}
            >
              Errors
            </button>
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              autoScroll
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Toggle Auto-Scroll"
          >
            <ArrowDown className={`w-3.5 h-3.5 ${autoScroll ? "animate-bounce" : ""}`} />
            <span className="hidden sm:inline text-[11px]">Auto-scroll</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Download Log File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 bg-slate-950/90 p-4 font-mono text-xs overflow-y-auto space-y-1 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs">
            No log lines match current filter.
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={log.id || i} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/40 px-1.5 py-0.5 rounded">
              <span className="text-[10px] text-slate-600 select-none shrink-0 w-8 text-right font-mono">
                {i + 1}
              </span>
              <span className="text-[10px] text-slate-500 select-none shrink-0">
                {log.timestamp ? log.timestamp.split("T")[1]?.substring(0, 8) : "--:--:--"}
              </span>
              <div className="break-all whitespace-pre-wrap flex-1">{formatLine(log.text, log.level)}</div>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
