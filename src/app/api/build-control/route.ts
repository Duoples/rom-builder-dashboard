import { NextRequest, NextResponse } from "next/server";
import { updateActiveBuild, addLog } from "@/lib/store";
import { dispatchBuildNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const { action, device = "violet", branch = "lineage-23.0", cores = 6 } = await req.json();

    if (action === "start") {
      const newBuild = updateActiveBuild({
        id: `build_${device}_${Date.now()}`,
        device,
        deviceName: device === "violet" ? "Xiaomi Redmi Note 7 Pro" : device,
        romName: "DuoplesOS 1.0",
        version: "1.0-BP2A.250805.005",
        branch,
        status: "syncing",
        stage: "repo_sync",
        progress: 5,
        cores,
        startTime: new Date().toISOString(),
        endTime: undefined,
        duration: undefined,
        artifact: undefined,
        errorLog: undefined,
        warningsCount: 0,
        triggeredBy: "Dashboard Web UI",
      });

      addLog(`[*] Build initiated from Web Dashboard (${device}, -j${cores})`, "info", "repo_sync");
      dispatchBuildNotification(newBuild, "start").catch(console.error);

      return NextResponse.json({
        success: true,
        message: `Build started for ${device}`,
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
