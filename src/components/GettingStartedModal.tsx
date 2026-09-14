"use client";

import React, { useState } from "react";
import {
  X,
  Rocket,
  Smartphone,
  Server,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  HelpCircle,
  Cpu,
  Mail,
  Zap,
} from "lucide-react";
import { BuildTargetEnvironment } from "@/lib/types";

interface GettingStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: {
    systemType: "android_rom" | "custom_linux";
    environment: BuildTargetEnvironment;
    device: string;
    serverHost: string;
  }) => void;
}

export const GettingStartedModal: React.FC<GettingStartedModalProps> = ({
  isOpen,
  onClose,
  onApplyConfig,
}) => {
  const [step, setStep] = useState<number>(1);
  const [systemType, setSystemType] = useState<"android_rom" | "custom_linux">("android_rom");
  const [environment, setEnvironment] = useState<BuildTargetEnvironment>("crave");
  const [device, setDevice] = useState<string>("lavender");
  const [serverHost, setServerHost] = useState<string>("192.168.2.192");
  const [emailAlert, setEmailAlert] = useState<string>("duoples77@gmail.com");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generatedCommand =
    systemType === "android_rom"
      ? environment === "crave"
        ? `# 1-Command Crave.io Cloud Trigger for ${device}:\n./agent/crave_agent.sh`
        : `# 1-Command Local VM Compilation for ${device}:\n./build_local.sh 2>&1 | tee build.log`
      : `# 1-Command Duoples Linux 1.0 LTS Distribution Build:\n/bin/bash /home/duoples-linux/build_duoples_linux.sh`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyConfig({
      systemType,
      environment,
      device,
      serverHost,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl glass-panel-glow rounded-2xl border border-slate-700/80 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Getting Started & Environment Setup</h3>
            <p className="text-xs text-slate-400">
              Configure your dashboard with tailored prompts for your environment
            </p>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          {[
            { num: 1, title: "Target Type" },
            { num: 2, title: "Infrastructure" },
            { num: 3, title: "Parameters" },
            { num: 4, title: "Command & Apply" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : step > s.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-900 border border-slate-700 text-slate-400"
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline font-medium ${
                  step === s.num ? "text-white" : "text-slate-500"
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: System Type */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-sm font-semibold text-white">
              What do you want to build and track?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSystemType("android_rom")}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  systemType === "android_rom"
                    ? "bg-cyan-500/15 border-cyan-500 text-white shadow-md shadow-cyan-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-white">Android Custom ROM</span>
                  </div>
                  {systemType === "android_rom" && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  DuoplesOS, LineageOS, PixelOS, or AOSP flashable OTA ZIPs for mobile devices (Redmi Note 7, violet, marble).
                </p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  Android 16 / 17 Trunk
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSystemType("custom_linux")}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  systemType === "custom_linux"
                    ? "bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-bold text-white">Duoples Linux Distribution</span>
                  </div>
                  {systemType === "custom_linux" && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Full-fledged Debian/Ubuntu ecosystem with APT package manager, custom Linux 6.6 kernel, systemd, and SSH.
                </p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/50">
                  Full Debian / APT Ecosystem
                </div>
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Infrastructure */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-sm font-semibold text-white">Choose Your Compilation Infrastructure</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setEnvironment("crave")}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  environment === "crave"
                    ? "bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-400" />
                    <span className="text-sm font-bold text-white">Crave.io Cloud Farm</span>
                  </div>
                  {environment === "crave" && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Runs on Crave's 32–96 Core Google Cloud nodes. Zero local CPU or storage load. Pre-cached AOSP snapshots.
                </p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800/50">
                  FOSS Compliant (resync.sh)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEnvironment("self_hosted")}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  environment === "self_hosted"
                    ? "bg-indigo-500/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Self-Hosted VM / Server</span>
                  </div>
                  {environment === "self_hosted" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Compiles locally on your Ubuntu Server ARM VM (UTM, Apple Silicon, or bare metal) with Ccache and Swap.
                </p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                  Local 8 vCPUs • 64 GB Swap
                </div>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Parameters */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-sm font-semibold text-white">Configure Your Target Parameters</h4>

            {systemType === "android_rom" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Device Codename
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="lavender">lavender (Redmi Note 7 / 7S - SDM660)</option>
                  <option value="violet">violet (Redmi Note 7 Pro - SM6150)</option>
                  <option value="marble">marble (Xiaomi POCO F5)</option>
                  <option value="generic">generic_arm64 (AOSP GSI)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Linux Kernel & Target Architecture
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="generic_arm64">arm64 (Apple Silicon / QEMU Virt / Raspberry Pi 4/5)</option>
                  <option value="x86_64">x86_64 (Standard PC / Intel / AMD Cloud Instances)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Build Server Host IP / Domain
              </label>
              <input
                type="text"
                value={serverHost}
                onChange={(e) => setServerHost(e.target.value)}
                placeholder="192.168.2.192 or localhost"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                Notification Email (for build alerts)
              </label>
              <input
                type="email"
                value={emailAlert}
                onChange={(e) => setEmailAlert(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-600/20"
              >
                <span>Generate Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Output Command & One-Click Apply */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="text-sm font-semibold text-white">Your Tailored Command is Ready</h4>

            <div className="relative">
              <pre className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedCommand}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                Clicking <strong className="text-white">Apply to Dashboard</strong> will update your live dashboard to track <strong>{systemType === "android_rom" ? `DuoplesOS for ${device}` : "Duoples Linux 1.0 LTS"}</strong> and configure your environment.
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to Dashboard Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
