"use client";

import React, { useState } from "react";
import {
  Bell,
  BellOff,
  Mail,
  Play,
  RotateCw,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  Layers,
  ArrowUp,
} from "lucide-react";
import { SystemStats, BuildRecord } from "@/lib/types";

interface HeaderProps {
  systemStats: SystemStats | null;
  activeBuild: BuildRecord | null;
  pbConnected: boolean;
  pushSubscribed: boolean;
  onTogglePush: () => void;
  onOpenEmailModal: () => void;
  onOpenBuildModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemStats,
  activeBuild,
  pbConnected,
  pushSubscribed,
  onTogglePush,
  onOpenEmailModal,
  onOpenBuildModal,
  onRefresh,
  isRefreshing,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCrave = activeBuild?.environment === "crave";
  const progressPct = activeBuild?.progress || 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 relative backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & ROM branding */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  DuoplesOS <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Builder v1.0</span>
                </h1>

                {/* Header Live Progress Pill */}
                {activeBuild && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {progressPct}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      {activeBuild.stage.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Xiaomi Redmi Note 7 Pro (<span className="font-mono text-cyan-300">violet</span>) • LineageOS 23.0 Base
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Refresh status"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Status Indicators & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Active Build Environment Pill */}
          {activeBuild && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                isCrave
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
              }`}
            >
              {isCrave ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span>Crave Cloud {activeBuild.craveJobId ? `#${activeBuild.craveJobId}` : ""}</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Self-Hosted VM</span>
                </>
              )}
            </div>
          )}

          {/* PocketBase status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
              pbConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-slate-800/60 border-slate-700 text-slate-400"
            }`}
            title={pbConnected ? "PocketBase Database Connected" : "Local Standalone Store Active"}
          >
            <div className={`w-2 h-2 rounded-full ${pbConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span>{pbConnected ? "PocketBase Sync" : "Local Engine"}</span>
          </div>

          {/* Web Push Subscription Toggle */}
          <button
            onClick={() => {
              onTogglePush();
              showToast(pushSubscribed ? "Push unsubscribed" : "Enabling Web Push...");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              pushSubscribed
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Toggle Web Push notifications (works even when tab is closed)"
          >
            {pushSubscribed ? <Bell className="w-3.5 h-3.5 text-cyan-400" /> : <BellOff className="w-3.5 h-3.5" />}
            <span>{pushSubscribed ? "Push Alerts On" : "Enable Push"}</span>
          </button>

          {/* Email alerts button */}
          <button
            onClick={onOpenEmailModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
            title="Configure SMTP & test Gmail notifications"
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Email Alerts</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden md:flex items-center gap-1.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Refresh status"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Start Build Button */}
          <button
            onClick={onOpenBuildModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/25 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Trigger Build</span>
          </button>
        </div>
      </div>

      {/* Sticky Top Live Progress Bar (Always visible on all scroll positions) */}
      {activeBuild && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-sm shadow-cyan-500/50"
            style={{ width: `${Math.max(3, progressPct)}%` }}
          />
        </div>
      )}

      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </header>
  );
};
