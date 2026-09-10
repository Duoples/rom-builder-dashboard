export type BuildStatus =
  | "idle"
  | "syncing"
  | "customizing"
  | "configuring"
  | "compiling"
  | "packaging"
  | "success"
  | "failed"
  | "cancelled";

export type BuildStage =
  | "idle"
  | "repo_sync"
  | "apply_patches"
  | "envsetup_lunch"
  | "soong_analysis"
  | "ninja_compilation"
  | "packaging_zip"
  | "completed"
  | "error";

export type BuildTargetEnvironment = "crave" | "self_hosted";

export interface BuildRecord {
  id: string;
  device: string;
  deviceName: string;
  romName: string;
  version: string;
  branch: string;
  status: BuildStatus;
  stage: BuildStage;
  progress: number;
  stageProgress?: number;
  cores: number;
  environment: BuildTargetEnvironment;
  craveJobId?: string;
  craveUrl?: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  artifact?: string;
  artifactSize?: string;
  artifactSha256?: string;
  errorLog?: string;
  warningsCount: number;
  triggeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildEventPayload {
  buildId?: string;
  device?: string;
  deviceName?: string;
  romName?: string;
  version?: string;
  branch?: string;
  status: BuildStatus;
  stage: BuildStage;
  progress: number;
  stageProgress?: number;
  message?: string;
  cores?: number;
  environment?: BuildTargetEnvironment;
  craveJobId?: string;
  craveUrl?: string;
  artifact?: string;
  artifactSize?: string;
  artifactSha256?: string;
  errorLog?: string;
  warningsCount?: number;
  triggeredBy?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug" | "stdout";
  text: string;
  stage?: BuildStage;
}

export interface PushSubscriptionItem {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
}

export interface SystemStats {
  cpuUsage: number;
  coresAllocated: number;
  totalMemoryMB: number;
  usedMemoryMB: number;
  freeMemoryMB: number;
  swapTotalMB: number;
  swapUsedMB: number;
  diskTotalGB: number;
  diskFreeGB: number;
  ccacheSizeGB: number;
  ccacheMaxGB: number;
  loadAverage: string;
  uptime: string;
  serverHost: string;
}
