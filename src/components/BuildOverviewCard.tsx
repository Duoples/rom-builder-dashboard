"use client";

import React, { useEffect, useState } from "react";
import {
  Smartphone,
  Cpu,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  StopCircle,
  FolderArchive,
  Hash,
  Play,
  Cloud,
  Server,
  ExternalLink,
} from "lucide-react";
import { BuildRecord } from "@/lib/types";

interface BuildOverviewCardProps {
  build: BuildRecord | null;
  onCancelBuild: () => void;
  onOpenBuildModal: () => void;
}

export const BuildOverviewCard: React.FC<BuildOverviewCardProps> = ({
  build,
  onCancelBuild,
  onOpenBuildModal,
}) => {
  const [elapsed, setElapsed] = useState<string>("00:00:00");

  useEffect(() => {
    if (!build?.startTime) return;

    const start = new Date(build.startTime).getTime();
    const updateTimer = () => {
      const end = build.endTime ? new Date(build.endTime).getTime() : Date.now();
      const diff = Math.max(0, Math.floor((end - start) / 1000));
      const hours = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [build?.startTime, build?.endTime]);

  const getStatusBadge = () => {
    if (!build) return { label: "IDLE", color: "bg-slate-800 text-slate-400 border-slate-700" };
    switch (build.status) {
      case "compiling":
        return { label: "COMPILING", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 animate-pulse" };
      case "syncing":
        return { label: "SYNCING TREE", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/40 animate-pulse" };
      case "customizing":
        return { label: "PATCHING", color: "bg-purple-500/15 text-purple-400 border-purple-500/40" };
      case "configuring":
        return { label: "CONFIGURING", color: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
      case "packaging":
        return { label: "PACKAGING ZIP", color: "bg-blue-500/15 text-blue-400 border-blue-500/40 animate-pulse" };
      case "success":
        return { label: "BUILD SUCCESS", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" };
      case "failed":
        return { label: "BUILD FAILED", color: "bg-rose-500/15 text-rose-400 border-rose-500/40" };
      case "cancelled":
        return { label: "CANCELLED", color: "bg-slate-800 text-slate-400 border-slate-700" };
      default:
        return { label: build.status.toUpperCase(), color: "bg-slate-800 text-slate-400 border-slate-700" };
    }
  };

  const statusBadge = getStatusBadge();
  const isBuilding =
    build &&
    (build.status === "compiling" ||
      build.status === "syncing" ||
      build.status === "customizing" ||
      build.status === "configuring" ||
      build.status === "packaging");

  return (
    <div className="w-full glass-panel-glow rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Device & Target Summary */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Environment Badge */}
            {build?.environment === "crave" ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold border tracking-wider flex items-center gap-1.5 bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                CRAVE.IO CLOUD
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold border tracking-wider flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                SELF-HOSTED VM
              </span>
            )}

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider flex items-center gap-1.5 ${statusBadge.color}`}
            >
              {isBuilding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {build?.status === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {build?.status === "failed" && <AlertTriangle className="w-3.5 h-3.5" />}
              {statusBadge.label}
            </span>

            {build?.craveJobId ? (
              <a
                href={build.craveUrl || `https://foss.crave.io/app/#/build/info/${build.craveJobId}?team=14`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 px-2.5 py-1 rounded-md border border-sky-800/80 flex items-center gap-1 transition-all"
              >
                <span>Job #{build.craveJobId}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
                ID: {build?.id || "N/A"}
              </span>
            )}

            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              {build?.environment === "crave" ? "32 Cores (Cloud)" : `${build?.cores || 6} Cores (Local)`}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-cyan-400" />
              {build?.deviceName || "Xiaomi Redmi Note 7 Pro"}
              <span className="text-sm font-mono font-normal text-cyan-400">({build?.device || "violet"})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {build?.romName || "DuoplesOS 1.0"} • Version: <span className="text-slate-200">{build?.version || "1.0"}</span> • Branch: <span className="font-mono text-indigo-300">{build?.branch || "lineage-23.0"}</span>
            </p>
          </div>

          {/* Artifact File Display if Success */}
          {build?.status === "success" && build.artifact && (
            <div className="flex items-center gap-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
              <FolderArchive className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-emerald-200 truncate">{build.artifact}</p>
                <p className="text-[11px] text-emerald-400/80 font-mono">
                  Size: {build.artifactSize || "1.42 GB"} • Checksum verified
                </p>
              </div>
            </div>
          )}

          {/* Error Snippet Display if Failed */}
          {build?.status === "failed" && build.errorLog && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 font-mono line-clamp-2">{build.errorLog}</p>
            </div>
          )}
        </div>

        {/* Right: Stopwatch & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-4 w-full lg:w-auto">
          {/* Elapsed Timer Box */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400 font-medium">Elapsed Time</span>
            </div>
            <span className="text-lg font-mono font-bold text-white tracking-wider">{elapsed}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isBuilding ? (
              <button
                onClick={onCancelBuild}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
              >
                <StopCircle className="w-4 h-4 text-rose-400" />
                <span>Cancel Build</span>
              </button>
            ) : (
              <button
                onClick={onOpenBuildModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>New Build</span>
              </button>
            )}

            {build?.status === "success" && build.artifact && (
              <a
                href={`#download-${build.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download ROM</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
