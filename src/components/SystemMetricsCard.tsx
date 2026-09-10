"use client";

import React, { useState } from "react";
import { Cpu, Server, HardDrive, Database, Zap, Cloud, Globe, ExternalLink } from "lucide-react";
import { SystemStats } from "@/lib/types";

interface SystemMetricsCardProps {
  stats: SystemStats | null;
}

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({ stats }) => {
  const [viewEnv, setViewEnv] = useState<"crave" | "self_hosted">("crave");

  const ramPercent = stats
    ? Math.round((stats.usedMemoryMB / stats.totalMemoryMB) * 100)
    : 10;
  const swapPercent = stats && stats.swapTotalMB > 0
    ? Math.round((stats.swapUsedMB / stats.swapTotalMB) * 100)
    : 0;
  const diskPercent = stats
    ? Math.round(((stats.diskTotalGB - stats.diskFreeGB) / stats.diskTotalGB) * 100)
    : 16;
  const ccachePercent = stats && stats.ccacheMaxGB > 0
    ? Math.round((stats.ccacheSizeGB / stats.ccacheMaxGB) * 100)
    : 0;

  return (
    <div className="w-full space-y-3">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hardware & Cluster Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewEnv("crave")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewEnv === "crave"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Crave.io Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => setViewEnv("self_hosted")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewEnv === "self_hosted"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Self-Hosted VM</span>
          </button>
        </div>
      </div>

      {viewEnv === "crave" ? (
        /* Crave Cloud Farm View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
          {/* 1. Cloud Cores */}
          <div className="glass-panel p-4 rounded-xl border border-sky-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Cloud Compute</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">32 - 96 Cores</div>
              <div className="text-[11px] text-sky-300 font-mono">Google Cloud Cluster</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: "90%" }} />
            </div>
          </div>

          {/* 2. Crave Project Base */}
          <div className="glass-panel p-4 rounded-xl border border-sky-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Target Base</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">LOS 23.2</div>
              <div className="text-[11px] text-slate-400 font-mono">Project ID: 99</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          {/* 3. Sync Pipeline */}
          <div className="glass-panel p-4 rounded-xl border border-sky-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Sync Engine</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">resync.sh</div>
              <div className="text-[11px] text-amber-300 font-mono">FOSS Compliant</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          {/* 4. Persistence & Storage */}
          <div className="glass-panel p-4 rounded-xl border border-sky-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Storage Backend</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">Ceph / ZFS</div>
              <div className="text-[11px] text-emerald-300 font-mono">Snapclone cached</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </div>

          {/* 5. Cloud Status Link */}
          <div className="glass-panel p-4 rounded-xl border border-sky-900/40 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Crave Console</span>
              <Cloud className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">Active</div>
              <a
                href="https://foss.crave.io/app/#/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 mt-0.5"
              >
                <span>Open Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      ) : (
        /* Self-Hosted VM View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
          {/* 1. CPU Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">CPU Allocation</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">8 vCPUs</div>
              <div className="text-[11px] text-cyan-400 font-mono">6 Cores in Build (-j6)</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: "75%" }} />
            </div>
          </div>

          {/* 2. RAM Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Physical Memory</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                {stats ? (stats.totalMemoryMB / 1024).toFixed(1) : "10.0"} GB
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {stats ? (stats.usedMemoryMB / 1024).toFixed(1) : "1.0"} GB used ({ramPercent}%)
              </div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${ramPercent}%` }} />
            </div>
          </div>

          {/* 3. Swap Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Swapfile</span>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">64.0 GB</div>
              <div className="text-[11px] text-emerald-400 font-mono">Persistent / safe</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.max(2, swapPercent)}%` }} />
            </div>
          </div>

          {/* 4. NVMe Disk Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Disk Space</span>
              <HardDrive className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                {stats?.diskFreeGB || 396} GB Free
              </div>
              <div className="text-[11px] text-slate-400 font-mono">500 GB Partition ({diskPercent}% used)</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${diskPercent}%` }} />
            </div>
          </div>

          {/* 5. Ccache & Rosetta Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Ccache & Engine</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">50 GB Limit</div>
              <div className="text-[11px] text-slate-400 font-mono">Apple Silicon VirtIO</div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "25%" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
