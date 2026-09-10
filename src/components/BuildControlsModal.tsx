"use client";

import React, { useState } from "react";
import { X, Play, Smartphone, Cpu, GitBranch, Cloud, Server, CheckCircle2, Zap } from "lucide-react";
import { BuildTargetEnvironment } from "@/lib/types";

interface BuildControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerBuild: (params: {
    device: string;
    branch: string;
    cores: number;
    environment: BuildTargetEnvironment;
  }) => void;
}

export const BuildControlsModal: React.FC<BuildControlsModalProps> = ({
  isOpen,
  onClose,
  onTriggerBuild,
}) => {
  const [environment, setEnvironment] = useState<BuildTargetEnvironment>("crave");
  const [device, setDevice] = useState("violet");
  const [branch, setBranch] = useState("lineage-23.0");
  const [cores, setCores] = useState(6);
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    onTriggerBuild({ device, branch, cores, environment });
    setTimeout(() => {
      setIsStarting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg glass-panel-glow rounded-2xl border border-slate-700/80 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Start New ROM Build</h3>
            <p className="text-xs text-slate-400">Choose compilation farm and target device</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Environment Selector: Crave vs Self-Hosted */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Build Execution Environment
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Crave Option */}
              <button
                type="button"
                onClick={() => setEnvironment("crave")}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  environment === "crave"
                    ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/15"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Cloud className={`w-4 h-4 ${environment === "crave" ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-white">Crave.io Cloud</span>
                  </div>
                  {environment === "crave" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  32-96 Core High-Speed Cluster. Zero load on local machine.
                </p>
                <div className="mt-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  LOS 23.2 Project #99
                </div>
              </button>

              {/* Self-Hosted Option */}
              <button
                type="button"
                onClick={() => setEnvironment("self_hosted")}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  environment === "self_hosted"
                    ? "bg-indigo-500/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/15"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${environment === "self_hosted" ? "text-indigo-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-white">Self-Hosted VM</span>
                  </div>
                  {environment === "self_hosted" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Local Ubuntu Server ARM VM (UTM / Apple Silicon).
                </p>
                <div className="mt-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                  192.168.2.192
                </div>
              </button>
            </div>
          </div>

          {/* Target Device */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Target Device Codename
            </label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="violet">violet (Xiaomi Redmi Note 7 Pro - SM6150)</option>
              <option value="marble">marble (Xiaomi POCO F5)</option>
              <option value="generic">generic_arm64 (AOSP GSI)</option>
            </select>
          </div>

          {/* Source Branch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              Base Source Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="lineage-23.0">lineage-23.0 (Android 16 Trunk / BP2A)</option>
              <option value="lineage-22.2">lineage-22.2 (Android 15)</option>
              <option value="lineage-21.0">lineage-21.0 (Android 14)</option>
            </select>
          </div>

          {/* Cores configuration (only for Self-Hosted) */}
          {environment === "self_hosted" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Local Parallel Compilation Jobs
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 7, 8].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCores(c)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      cores === c
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    -j{c} {c === 6 ? "(Optimal)" : ""}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                -j6 leaves 2 cores free on the VM for SSH and file I/O responsiveness.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-center gap-3">
              <Cloud className="w-5 h-5 text-cyan-400 shrink-0" />
              <p className="text-[11px] text-cyan-200">
                Crave automatically provisions a dedicated multi-core build node (typically 32 cores, 128 GB RAM) with pre-synced Ceph/ZFS snapshots.
              </p>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStarting}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isStarting
                  ? "Triggering..."
                  : environment === "crave"
                  ? "Dispatch to Crave Cloud"
                  : "Start Local Build"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
