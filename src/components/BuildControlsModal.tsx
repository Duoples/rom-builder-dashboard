"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Smartphone,
  Cpu,
  GitBranch,
  Cloud,
  Server,
  CheckCircle2,
  Zap,
  Monitor,
  Gamepad2,
  Terminal,
  Shield,
} from "lucide-react";
import { BuildTargetEnvironment } from "@/lib/types";

interface BuildControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSystemType?: "android_rom" | "custom_linux";
  onTriggerBuild: (params: {
    device: string;
    branch: string;
    cores: number;
    environment: BuildTargetEnvironment;
    systemType?: "android_rom" | "custom_linux";
    desktops?: string[];
    features?: string[];
  }) => void;
}

export const BuildControlsModal: React.FC<BuildControlsModalProps> = ({
  isOpen,
  onClose,
  initialSystemType = "android_rom",
  onTriggerBuild,
}) => {
  const [systemType, setSystemType] = useState<"android_rom" | "custom_linux">(initialSystemType);
  const [environment, setEnvironment] = useState<BuildTargetEnvironment>(
    initialSystemType === "custom_linux" ? "self_hosted" : "crave"
  );
  const [device, setDevice] = useState(initialSystemType === "custom_linux" ? "generic_arm64" : "lavender");
  const [branch, setBranch] = useState("lineage-23.2");
  const [cores, setCores] = useState(6);
  const [isStarting, setIsStarting] = useState(false);

  // Linux Modular Customizations Checklists
  const [selectedDesktops, setSelectedDesktops] = useState<string[]>(["kde"]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "gaming",
    "vulkan",
    "ssh",
    "appstore",
    "devtools",
  ]);

  React.useEffect(() => {
    setSystemType(initialSystemType);
    if (initialSystemType === "custom_linux") {
      setEnvironment("self_hosted");
      setDevice("generic_arm64");
    } else {
      setEnvironment("crave");
      setDevice("lavender");
    }
  }, [initialSystemType]);

  if (!isOpen) return null;

  const toggleDesktop = (id: string) => {
    setSelectedDesktops((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    onTriggerBuild({
      device,
      branch,
      cores,
      environment,
      systemType,
      desktops: selectedDesktops,
      features: selectedFeatures,
    });
    setTimeout(() => {
      setIsStarting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl glass-panel-glow rounded-2xl border border-slate-700/80 p-6 relative max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-base font-bold text-white">
              {systemType === "custom_linux" ? "Build Duoples Linux Distribution" : "Start New ROM Build"}
            </h3>
            <p className="text-xs text-slate-400">
              {systemType === "custom_linux"
                ? "Configure Desktops, Gaming & Hardware Drivers"
                : "Choose compilation farm and target device"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSystemType("android_rom");
                setEnvironment("crave");
                setDevice("lavender");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                systemType === "android_rom"
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Custom ROM</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemType("custom_linux");
                setEnvironment("self_hosted");
                setDevice("generic_arm64");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                systemType === "custom_linux"
                  ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Duoples Linux Distro</span>
            </button>
          </div>

          {systemType === "custom_linux" ? (
            /* Duoples Linux Customization Suite */
            <div className="space-y-4">
              {/* Architecture */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target CPU Architecture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDevice("generic_arm64")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      device === "generic_arm64"
                        ? "bg-cyan-500/15 border-cyan-500 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>ARM64 (aarch64)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Apple Silicon, Pi 4/5, UTM</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("x86_64")}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      device === "x86_64"
                        ? "bg-cyan-500/15 border-cyan-500 text-white font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div>AMD64 (x86_64)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Intel, AMD, Cloud servers</div>
                  </button>
                </div>
              </div>

              {/* Desktop Environment Checklists */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  Desktop Environments (Check to Install)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "kde", name: "KDE Plasma 6", sub: "Feature-rich UI" },
                    { id: "gnome", name: "GNOME 46", sub: "Modern & Smooth" },
                    { id: "cinnamon", name: "Cinnamon", sub: "Traditional & Elegant" },
                    { id: "xfce", name: "XFCE 4.18", sub: "Fast & Lightweight" },
                    { id: "lxqt", name: "LXQt", sub: "Minimal RAM usage" },
                    { id: "headless", name: "Headless / CLI", sub: "Pure Server Console" },
                  ].map((d) => (
                    <div
                      key={d.id}
                      onClick={() => toggleDesktop(d.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedDesktops.includes(d.id)
                          ? "bg-cyan-500/15 border-cyan-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{d.name}</span>
                        {selectedDesktops.includes(d.id) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{d.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaming, Drivers & Utilities Checklists */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  Gaming, Graphics Drivers & System Services
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gaming", name: "Gaming Stack (Vulkan/Wine)", desc: "Steam, Lutris, GameMode ready" },
                    { id: "vulkan", name: "Mesa 3D & Vulkan Drivers", desc: "Full hardware 3D acceleration" },
                    { id: "nvidia", name: "NVIDIA Drivers (DKMS)", desc: "Proprietary GPU acceleration" },
                    { id: "audio", name: "PipeWire Audio Server", desc: "Low-latency modern sound" },
                    { id: "ssh", name: "OpenSSH Server (Port 22)", desc: "Remote terminal management" },
                    { id: "appstore", name: "Duoples Appstore Client", desc: "Pre-installed native store" },
                    { id: "devtools", name: "Developer Toolchain", desc: "GCC, Python, Git, Build Tools" },
                    { id: "docker", name: "Docker Container Runtime", desc: "Container virtualization" },
                  ].map((f) => (
                    <div
                      key={f.id}
                      onClick={() => toggleFeature(f.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedFeatures.includes(f.id)
                          ? "bg-purple-500/15 border-purple-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{f.name}</span>
                        {selectedFeatures.includes(f.id) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Android ROM Builder Configuration */
            <div className="space-y-4">
              {/* Target Device */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  Target Codename / Architecture
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="lavender">lavender (Xiaomi Redmi Note 7 / 7S - SDM660)</option>
                  <option value="violet">violet (Xiaomi Redmi Note 7 Pro - SM6150)</option>
                  <option value="marble">marble (Xiaomi POCO F5)</option>
                  <option value="generic_arm64">generic_arm64 (AOSP GSI)</option>
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
                  <option value="lineage-23.2">lineage-23.2 (Android 16 / 17 Base - bp4a)</option>
                  <option value="lineage-22.2">lineage-22.2 (Android 15)</option>
                  <option value="lineage-21.0">lineage-21.0 (Android 14)</option>
                </select>
              </div>

              {/* Environment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Build Execution Farm
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnvironment("crave")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      environment === "crave"
                        ? "bg-cyan-500/15 border-cyan-500 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Crave.io Cloud</span>
                      {environment === "crave" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">32-96 Cores Google Cloud Farm</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnvironment("self_hosted")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      environment === "self_hosted"
                        ? "bg-indigo-500/15 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Self-Hosted VM</span>
                      {environment === "self_hosted" && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Ubuntu Server ARM (8 vCPUs)</p>
                  </button>
                </div>
              </div>
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
                  ? "Starting..."
                  : systemType === "custom_linux"
                  ? "Build Duoples Linux"
                  : "Start ROM Compilation"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
