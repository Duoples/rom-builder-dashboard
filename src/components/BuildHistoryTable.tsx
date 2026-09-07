"use client";

import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Check,
  FolderArchive,
  Layers,
} from "lucide-react";
import { BuildRecord } from "@/lib/types";

interface BuildHistoryTableProps {
  history: BuildRecord[];
}

export const BuildHistoryTable: React.FC<BuildHistoryTableProps> = ({ history }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySha = (id: string, sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Recent Build Archives & History</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{history.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Device & Target</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Package Artifact</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/40 transition-all">
                {/* Device & Target */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-white flex items-center gap-1.5 font-sans">
                    <span>{item.deviceName || item.device}</span>
                    <span className="text-[11px] font-mono text-cyan-400">({item.device})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.romName} • {item.branch}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      item.status === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : item.status === "failed"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : item.status === "compiling"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {item.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                    {item.status === "failed" && <AlertTriangle className="w-3 h-3" />}
                    {item.status.toUpperCase()}
                  </span>
                </td>

                {/* Duration */}
                <td className="py-3 px-3 text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.duration || "Active"}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(item.startTime).toLocaleDateString()}
                  </div>
                </td>

                {/* Artifact Package */}
                <td className="py-3 px-3">
                  {item.artifact ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate max-w-xs">
                        <FolderArchive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{item.artifact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{item.artifactSize || "1.4 GB"}</span>
                        {item.artifactSha256 && (
                          <button
                            onClick={() => handleCopySha(item.id, item.artifactSha256!)}
                            className="text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-all"
                            title="Copy SHA256 Checksum"
                          >
                            <span>SHA256</span>
                            {copiedId === item.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs italic font-sans">
                      {item.status === "failed" ? "No package generated" : "Building package..."}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right">
                  {item.artifact && item.status === "success" ? (
                    <a
                      href={`/api/build-event?download=${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all font-sans"
                    >
                      <Download className="w-3 h-3" />
                      <span>ZIP</span>
                    </a>
                  ) : (
                    <span className="text-slate-600 text-xs font-sans">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
