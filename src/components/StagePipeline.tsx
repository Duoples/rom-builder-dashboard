"use client";

import React from "react";
import { Check, Loader2, AlertCircle, Clock, GitBranch, Layers, Terminal, Cpu, HardDrive, PackageCheck } from "lucide-react";
import { BuildStage, BuildStatus } from "@/lib/types";

interface StagePipelineProps {
  currentStage: BuildStage;
  status: BuildStatus;
  progress: number;
}

interface StepInfo {
  id: BuildStage;
  label: string;
  description: string;
  icon: React.ElementType;
}

const steps: StepInfo[] = [
  {
    id: "repo_sync",
    label: "Repo Sync",
    description: "LineageOS 23.0 & trees",
    icon: GitBranch,
  },
  {
    id: "apply_patches",
    label: "Customizations",
    description: "Branding & violet patches",
    icon: Layers,
  },
  {
    id: "envsetup_lunch",
    label: "Target Setup",
    description: "duoples_violet lunch",
    icon: Terminal,
  },
  {
    id: "soong_analysis",
    label: "Soong Graph",
    description: "Android.bp parsing",
    icon: HardDrive,
  },
  {
    id: "ninja_compilation",
    label: "Compilation",
    description: "mka bacon (-j6)",
    icon: Cpu,
  },
  {
    id: "packaging_zip",
    label: "Packaging",
    description: "Signed ROM zip",
    icon: PackageCheck,
  },
];

const stageOrder: BuildStage[] = [
  "repo_sync",
  "apply_patches",
  "envsetup_lunch",
  "soong_analysis",
  "ninja_compilation",
  "packaging_zip",
  "completed",
];

export const StagePipeline: React.FC<StagePipelineProps> = ({ currentStage, status, progress }) => {
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Build Pipeline Stages</h3>
          <p className="text-xs text-slate-400">Step-by-step ROM compilation workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-cyan-400">{progress}% Complete</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 mb-6 overflow-hidden p-[2px] border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === "failed"
              ? "bg-rose-500"
              : status === "success"
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 animate-pulse"
          }`}
          style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const stepIndex = stageOrder.indexOf(step.id);
          const isFinished = status === "success" || stepIndex < currentIndex;
          const isCurrent = step.id === currentStage && status !== "success" && status !== "failed";
          const isFailed = step.id === currentStage && status === "failed";
          const IconComponent = step.icon;

          return (
            <div
              key={step.id}
              className={`flex flex-col p-3 rounded-xl border transition-all ${
                isFinished
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : isCurrent
                  ? "bg-cyan-950/30 border-cyan-500/50 text-cyan-200 shadow-lg shadow-cyan-500/10"
                  : isFailed
                  ? "bg-rose-950/30 border-rose-500/50 text-rose-300"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isFinished
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-cyan-500/20 text-cyan-400"
                      : isFailed
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-slate-800 text-slate-600"
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>

                <div>
                  {isFinished && <Check className="w-4 h-4 text-emerald-400" />}
                  {isCurrent && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {isFailed && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  {!isFinished && !isCurrent && !isFailed && (
                    <span className="text-[10px] font-mono text-slate-600">0{idx + 1}</span>
                  )}
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-200 leading-tight">{step.label}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 truncate">{step.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
