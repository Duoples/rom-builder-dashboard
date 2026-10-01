import { NextRequest, NextResponse } from "next/server";
import { updateActiveBuild, addLog } from "@/lib/store";
import { dispatchBuildNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const {
      action,
      device = "lavender",
      branch = "lineage-23.2",
      cores = 6,
      environment = "crave",
    } = await req.json();

    if (action === "start") {
      const isCrave = environment === "crave";
      const devName =
        device === "lavender"
          ? "Xiaomi Redmi Note 7"
          : device === "violet"
          ? "Xiaomi Redmi Note 7 Pro"
          : device;

      const newBuild = updateActiveBuild({
        id: `build_${device}_${Date.now()}`,
        device,
        deviceName: devName,
        romName: isCrave ? "DuoplesOS 2.0 (Crave.io)" : "DuoplesOS 2.0 (Self-Hosted)",
        version: "2.0-BP4A-Android17",
        branch,
        status: "syncing",
        stage: "repo_sync",
        progress: isCrave ? 25 : 5,
        cores: isCrave ? 32 : cores,
        environment: isCrave ? "crave" : "self_hosted",
        startTime: new Date().toISOString(),
        endTime: undefined,
        duration: undefined,
        artifact: undefined,
        errorLog: undefined,
        warningsCount: 0,
        triggeredBy: isCrave ? "Web UI (Crave Cloud)" : "Web UI (Self-Hosted VM)",
      });

      const envLabel = isCrave ? "Crave.io Cloud Cluster (32-96 Cores)" : `Self-Hosted Ubuntu VM (-j${cores})`;
      addLog(`[*] Build initiated for ${device} on ${envLabel}`, "info", "repo_sync");
      dispatchBuildNotification(newBuild, "start").catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Build started on ${envLabel} for ${device}`,
        build: newBuild,
      });
    } else if (action === "cancel") {
      const cancelled = updateActiveBuild({
        status: "cancelled",
        stage: "error",
        endTime: new Date().toISOString(),
      });

      addLog("[!] Build was cancelled by operator.", "warn");

      return NextResponse.json({
        success: true,
        message: "Build cancelled",
        build: cancelled,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
