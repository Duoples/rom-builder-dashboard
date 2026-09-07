"use client";

import React from "react";
import { Cpu, Server, HardDrive, Database, Gauge, Zap } from "lucide-react";
import { SystemStats } from "@/lib/types";

interface SystemMetricsCardProps {
  stats: SystemStats | null;
}

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({ stats }) => {
  const ramPercent = stats
    ? Math.round((stats.usedMemoryMB / stats.totalMemoryMB) * 100)
    : 10;
  const swapPercent = stats && stats.swapTotalMB > 0
    ? Math.round((stats.swapUsedMB / stats.swapTotalMB) * 100)
    : 0;
  const diskPercent = stats
    ? Math.round(((stats.diskTotalGB - stats.diskFreeGB) / stats.diskTotalGB) * 100)
    : 24;
  const ccachePercent = stats && stats.ccacheMaxGB > 0
    ? Math.round((stats.ccacheSizeGB / stats.ccacheMaxGB) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
      {/* 1. CPU Card */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">CPU Allocation</span>
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-tight">8 Cores</div>
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
            {stats?.diskFreeGB || 373} GB Free
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
          <div className="text-[11px] text-emerald-400 font-mono">Rosetta 2 Active</div>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
          <div className="bg-amber-500 h-full rounded-full" style={{ width: "10%" }} />
        </div>
      </div>
    </div>
  );
};
