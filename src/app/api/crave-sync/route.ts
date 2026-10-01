import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { updateActiveBuild, addLog, store } from "@/lib/store";

const execAsync = promisify(exec);

// Cache to prevent pounding SSH too often
let lastSyncTime = 0;
let isSyncing = false;

export async function GET() {
  const now = Date.now();
  // Minimum 4 seconds between SSH sync calls
  if (isSyncing || now - lastSyncTime < 4000) {
    return NextResponse.json({
      success: true,
      synced: false,
      cached: true,
      activeBuild: store.activeAndroidBuild,
    });
  }

  isSyncing = true;
  lastSyncTime = now;

  try {
    const sshCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@192.168.2.192 "cd /home/crave_workspace && /home/crave -n -c /home/crave.conf list 2>&1"`;
    const { stdout } = await execAsync(sshCmd, { timeout: 15000 });

    let activeJobId: string | null = null;
    let activeJobStatus: string | null = null;
    let historyJobId: string | null = null;
    let historyJobStatus: string | null = null;

    let inActive = false;
    let inHistory = false;

    for (const line of stdout.split("\n")) {
      if (line.includes("Your active jobs:")) {
        inActive = true;
        inHistory = false;
        continue;
      } else if (line.includes("Job History:")) {
        inActive = false;
        inHistory = true;
        continue;
      }

      if (inActive && !activeJobId) {
        const m = line.match(/^\s*(\d+)\s+([A-Za-z0-9_.\s]+?)\s+(queued|running|stopped|failed|successful)/i);
        if (m) {
          activeJobId = m[1];
          activeJobStatus = m[3].toLowerCase();
        }
      }

      if (inHistory && !historyJobId) {
        const m = line.match(/^\s*(\d+)\s+.*?\s+(FAILED|SUCCESSFUL|CANCELLED|STOPPED)\s*$/i);
        if (m) {
          historyJobId = m[1];
          historyJobStatus = m[2].toUpperCase();
        }
      }
    }

    const targetJobId = activeJobId || historyJobId;
    const isOngoing = !!activeJobId;
    const status = activeJobStatus || (historyJobStatus === "SUCCESSFUL" ? "success" : "failed");

    if (targetJobId) {
      // Determine device & stage by pulling quick log if active
      let device = "lavender";
      let deviceName = "Xiaomi Redmi Note 7";
      let stage: "repo_sync" | "soong_analysis" | "ninja_compilation" | "completed" | "error" = "repo_sync";
      let progress = 25;
      let stageProgress = 0;
      let logMessage = `Crave Cloud Job #${targetJobId} is ${status.toUpperCase()}`;

      if (status === "queued") {
        stage = "repo_sync";
        progress = 20;
        logMessage = `Job #${targetJobId} is queued in Crave cloud cluster`;
      } else if (status === "running") {
        stage = "ninja_compilation";
        progress = 50;
      } else if (status === "failed") {
        stage = "error";
        progress = 0;
        logMessage = `Compilation failed on Crave.io Job #${targetJobId}`;
      } else if (status === "success") {
        stage = "completed";
        progress = 100;
        logMessage = `Build #${targetJobId} succeeded! Artifact ready.`;
      }

      // Check if this job has logs
      try {
        const logCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@192.168.2.192 "python3 -c \\"
import subprocess
try:
    p = subprocess.Popen(['/home/crave', '-n', '-c', '/home/crave.conf', 'getlog', '--jobID', '${targetJobId}'], cwd='/home/crave_workspace', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    lines = [l.strip() for l in p.stdout.readlines()]
    print('TOTAL_LINES=' + str(len(lines)))
    for l in lines[-15:]:
        print(l)
except Exception as e:
    print('ERR=' + str(e))
\\""`;
        const { stdout: logOut } = await execAsync(logCmd, { timeout: 15000 });
        if (logOut) {
          if (logOut.includes("lavender")) {
            device = "lavender";
            deviceName = "Xiaomi Redmi Note 7";
          } else if (logOut.includes("violet")) {
            device = "violet";
            deviceName = "Xiaomi Redmi Note 7 Pro";
          }

          // Parse progress
          const pctMatch = logOut.match(/\[\s*(\d+)%\s+(\d+)\/(\d+)\]/);
          if (pctMatch) {
            stageProgress = parseInt(pctMatch[1], 10);
            progress = Math.min(95, 40 + Math.floor(stageProgress * 0.55));
            stage = "ninja_compilation";
          } else if (logOut.includes("analyzing Android.bp")) {
            stage = "soong_analysis";
            progress = 38;
          } else if (logOut.includes("Running product configuration")) {
            progress = 35;
          }

          // Ingest tail logs if new
          const tailLines = logOut.split("\n").filter((l) => l.trim() && !l.startsWith("TOTAL_LINES="));
          if (tailLines.length > 0) {
            logMessage = tailLines[tailLines.length - 1].slice(0, 140);
          }
        }
      } catch {
        // Log fetch fallback
      }

      if (logMessage) {
        addLog(logMessage, status === "failed" ? "error" : "info", stage);
      }

      const updated = updateActiveBuild({
        id: `build_${device}_${targetJobId}`,
        systemType: "android_rom",
        device,
        deviceName,
        romName: "DuoplesOS 2.0 (Android 17)",
        version: "2.0-BP4A-Android17",
        branch: "lineage-23.2",
        status: isOngoing ? (status === "running" ? "compiling" : "compiling") : (status === "success" ? "success" : "failed"),
        stage,
        progress,
        stageProgress,
        cores: 32,
        environment: "crave",
        craveJobId: String(targetJobId),
        craveUrl: `https://foss.crave.io/app/#/build/info/${targetJobId}?team=14`,
      });

      return NextResponse.json({
        success: true,
        synced: true,
        jobId: targetJobId,
        status,
        build: updated,
      });
    }

    return NextResponse.json({
      success: true,
      synced: false,
      message: "No Crave jobs found",
      activeBuild: store.activeAndroidBuild,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
    }, { status: 500 });
  } finally {
    isSyncing = false;
  }
}
