"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { BuildOverviewCard } from "@/components/BuildOverviewCard";
import { StagePipeline } from "@/components/StagePipeline";
import { SystemMetricsCard } from "@/components/SystemMetricsCard";
import { LiveTerminal } from "@/components/LiveTerminal";
import { BuildHistoryTable } from "@/components/BuildHistoryTable";
import { NotificationSettingsModal } from "@/components/NotificationSettingsModal";
import { BuildControlsModal } from "@/components/BuildControlsModal";
import { BuildRecord, LogEntry, SystemStats } from "@/lib/types";

// Helper to convert base64 VAPID key to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function DashboardPage() {
  const [activeBuild, setActiveBuild] = useState<BuildRecord | null>(null);
  const [history, setHistory] = useState<BuildRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [pbConnected, setPbConnected] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

  // Fetch all state
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [statusRes, logsRes, eventsRes] = await Promise.all([
        fetch("/api/status").then((r) => r.json()).catch(() => null),
        fetch("/api/build-log?limit=300").then((r) => r.json()).catch(() => null),
        fetch("/api/build-event").then((r) => r.json()).catch(() => null),
      ]);

      if (statusRes) {
        if (statusRes.activeBuild) setActiveBuild(statusRes.activeBuild);
        if (statusRes.systemStats) setSystemStats(statusRes.systemStats);
        setPbConnected(statusRes.pocketbaseConnected ?? false);
        setSubscribersCount(statusRes.subscribersCount ?? 0);
      }

      if (logsRes?.logs) {
        setLogs(logsRes.logs);
      }

      if (eventsRes?.history) {
        setHistory(eventsRes.history);
      }
    } catch (err) {
      console.error("[Dashboard Fetch Error]:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll state every 3 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Check Web Push subscription on mount & scroll to top
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(async (registration) => {
            const subscription = await registration.pushManager.getSubscription();
            setPushSubscribed(!!subscription);
          })
          .catch((err) => console.warn("[SW Register]:", err));
      }
    }
  }, []);

  // Toggle Web Push Subscription
  const handleTogglePush = async () => {
    // Web Push strictly requires a Secure Context (localhost, 127.0.0.1, or HTTPS)
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost) {
      alert(
        "🔒 Browser Security Requirement:\n\nWeb Push Service Workers require a Secure Context (HTTPS or localhost).\n\nPlease open the dashboard in Firefox via:\n👉 http://localhost:3780 or http://127.0.0.1:3780\n\n(Gmail SMTP Email Alerts are already 100% active on all network connections!)"
      );
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert(
        "Browser Push is not available on this connection. Please access via http://localhost:3780."
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission was not granted. Please allow notifications in Firefox site permissions.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const currentSub = await registration.pushManager.getSubscription();

      if (currentSub) {
        await currentSub.unsubscribe();
        setPushSubscribed(false);
      } else {
        const vapidPublicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          "BPxSg3jF_STRDhIDP8Oz6Kz2KAWOGonH7grcQDUmnA6lT7rMOfCiYTpKm9SeQfXZKcqlXL5NvEojoxWnrAYj9cU";

        const newSub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Save to backend
        await fetch("/api/notifications/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSub),
        });

        setPushSubscribed(true);
        setSubscribersCount((prev) => prev + 1);
        alert("🎉 Web Push Notifications Enabled! You will receive desktop and mobile build alerts.");
      }
    } catch (err: unknown) {
      console.error("[Push Toggle Error]:", err);
      alert(`Could not toggle push notifications: ${(err as Error).message}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleCancelBuild = async () => {
    if (!confirm("Are you sure you want to stop the active build?")) return;
    try {
      await fetch("/api/build-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerBuild = async (params: { device: string; branch: string; cores: number }) => {
    try {
      await fetch("/api/build-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", ...params }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      {/* Top Header Navigation */}
      <Header
        systemStats={systemStats}
        pbConnected={pbConnected}
        pushSubscribed={pushSubscribed}
        onTogglePush={handleTogglePush}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenBuildModal={() => setIsBuildModalOpen(true)}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* 1. Build Overview Hero Card */}
        <BuildOverviewCard
          build={activeBuild}
          onCancelBuild={handleCancelBuild}
          onOpenBuildModal={() => setIsBuildModalOpen(true)}
        />

        {/* 2. Pipeline Stages Progress Bar */}
        <StagePipeline
          currentStage={activeBuild?.stage || "idle"}
          status={activeBuild?.status || "idle"}
          progress={activeBuild?.progress || 0}
        />

        {/* 3. System Hardware Metrics */}
        <SystemMetricsCard stats={systemStats} />

        {/* 4. Live Log Terminal Streamer */}
        <LiveTerminal logs={logs} onClearLogs={handleClearLogs} />

        {/* 5. Historical Builds Archive Table */}
        <BuildHistoryTable history={history} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            DuoplesOS Build System • Target: <strong>Xiaomi Redmi Note 7 Pro (violet)</strong>
          </span>
          <span className="font-mono text-slate-400">
            Powered by Next.js 15, PocketBase, Web Push & Gmail SMTP
          </span>
        </div>
      </footer>

      {/* Modals */}
      <NotificationSettingsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        pushSubscribed={pushSubscribed}
        subscribersCount={subscribersCount}
      />

      <BuildControlsModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        onTriggerBuild={handleTriggerBuild}
      />
    </div>
  );
}
