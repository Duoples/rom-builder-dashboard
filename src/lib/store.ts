import { BuildRecord, LogEntry, PushSubscriptionItem, SystemStats } from "./types";

// Global persistent store for Next.js dev & standalone server runtime
declare global {
  // eslint-disable-next-line no-var
  var __duoples_build_store: {
    activeBuild: BuildRecord | null;
    buildsHistory: BuildRecord[];
    logs: LogEntry[];
    subscriptions: PushSubscriptionItem[];
    systemStats: SystemStats;
    logListeners: Array<(log: LogEntry) => void>;
    stateListeners: Array<(build: BuildRecord) => void>;
  };
}

const defaultStats: SystemStats = {
  cpuUsage: 75,
  coresAllocated: 8,
  totalMemoryMB: 10240,
  usedMemoryMB: 6716,
  freeMemoryMB: 3524,
  swapTotalMB: 65536,
  swapUsedMB: 28,
  diskTotalGB: 500,
  diskFreeGB: 373,
  ccacheSizeGB: 0,
  ccacheMaxGB: 50,
  loadAverage: "6.50, 7.20, 8.05",
  uptime: "1 day, 18 hours",
  serverHost: process.env.BUILD_SERVER_HOST || "192.168.2.192",
};

const defaultActiveBuild: BuildRecord = {
  id: "build_violet_" + new Date().toISOString().split("T")[0].replace(/-/g, ""),
  device: "violet",
  deviceName: "Xiaomi Redmi Note 7 Pro",
  romName: "DuoplesOS 1.0",
  version: "1.0-BP2A.250805.005",
  branch: "lineage-23.0",
  status: "compiling",
  stage: "repo_sync",
  progress: 25,
  stageProgress: 10,
  cores: 32,
  environment: "crave",
  craveJobId: "299163",
  craveUrl: "https://foss.crave.io/app/#/build/info/299163?team=14",
  startTime: new Date().toISOString(),
  warningsCount: 0,
  triggeredBy: "Duoples CI/CD",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

if (!global.__duoples_build_store) {
  global.__duoples_build_store = {
    activeBuild: defaultActiveBuild,
    buildsHistory: [
      {
        id: "build_violet_pre1",
        device: "violet",
        deviceName: "Xiaomi Redmi Note 7 Pro",
        romName: "DuoplesOS 1.0",
        version: "1.0-alpha-20260904",
        branch: "lineage-23.0",
        status: "success",
        stage: "completed",
        progress: 100,
        cores: 6,
        environment: "self_hosted",
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 86400000 + 4320000).toISOString(),
        duration: "1h 12m",
        artifact: "DuoplesOS-1.0-violet-UNOFFICIAL-20260904.zip",
        artifactSize: "1.42 GB",
        artifactSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        warningsCount: 4,
        triggeredBy: "Manual",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 + 4320000).toISOString(),
      },
    ],
    logs: [
      {
        id: "log_1",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: "info",
        text: "==========================================",
        stage: "repo_sync",
      },
      {
        id: "log_2",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: "info",
        text: " Starting DuoplesOS Local Build (6 Cores)",
        stage: "repo_sync",
      },
      {
        id: "log_3",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: "info",
        text: " Target: Xiaomi Redmi Note 7 Pro (duoples_violet)",
        stage: "repo_sync",
      },
      {
        id: "log_4",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: "info",
        text: " Set ccache limit to 50.0 GB",
        stage: "repo_sync",
      },
      {
        id: "log_5",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: "info",
        text: " Target: duoples_violet-bp2a-userdebug initialized",
        stage: "envsetup_lunch",
      },
      {
        id: "log_6",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: "info",
        text: " [100% 1/1] bootstrap blueprint (microfactory / release-config ready)",
        stage: "soong_analysis",
      },
      {
        id: "log_7",
        timestamp: new Date().toISOString(),
        level: "info",
        text: " [*] Soong analyzing ~3,500 Android.bp blueprints and generating Ninja graph (out/soong/build.duoples_violet.ninja)...",
        stage: "soong_analysis",
      },
    ],
    subscriptions: [],
    systemStats: defaultStats,
    logListeners: [],
    stateListeners: [],
  };
}

export const store = global.__duoples_build_store;

export function addLog(text: string, level: LogEntry["level"] = "info", stage?: LogEntry["stage"]) {
  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    text,
    stage: stage || store.activeBuild?.stage || "idle",
  };

  store.logs.push(entry);
  if (store.logs.length > 5000) {
    store.logs.splice(0, store.logs.length - 5000);
  }

  store.logListeners.forEach((listener) => {
    try {
      listener(entry);
    } catch {
      // ignore
    }
  });

  return entry;
}

export function updateActiveBuild(partial: Partial<BuildRecord>) {
  if (!store.activeBuild) {
    store.activeBuild = {
      ...defaultActiveBuild,
      ...partial,
      id: partial.id || `build_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
  } else {
    store.activeBuild = {
      ...store.activeBuild,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
  }

  // Update in history if exists
  const idx = store.buildsHistory.findIndex((b) => b.id === store.activeBuild?.id);
  if (idx >= 0) {
    store.buildsHistory[idx] = { ...store.activeBuild };
  } else {
    store.buildsHistory.unshift({ ...store.activeBuild });
  }

  store.stateListeners.forEach((listener) => {
    try {
      if (store.activeBuild) listener(store.activeBuild);
    } catch {
      // ignore
    }
  });

  return store.activeBuild;
}

export function registerPushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) {
  const exists = store.subscriptions.find((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    store.subscriptions.push({
      ...sub,
      createdAt: new Date().toISOString(),
    });
  }
}
