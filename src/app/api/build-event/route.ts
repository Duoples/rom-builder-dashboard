import { NextRequest, NextResponse } from "next/server";
import { store, updateActiveBuild, addLog } from "@/lib/store";
import { dispatchBuildNotification } from "@/lib/notifications";
import { syncBuildToPocketBase } from "@/lib/pocketbase";
import { BuildEventPayload, BuildRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BuildEventPayload;

    const previousStatus = store.activeBuild?.status;
    const isNewStatus = body.status && body.status !== previousStatus;

    // Calculate duration if finished
    let duration: string | undefined = undefined;
    const startTime = store.activeBuild?.startTime || new Date().toISOString();
    if (body.status === "success" || body.status === "failed") {
      const ms = Date.now() - new Date(startTime).getTime();
      const mins = Math.floor(ms / 60000);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      duration = hours > 0 ? `${hours}h ${remainingMins}m` : `${mins}m`;
    }

    const updated = updateActiveBuild({
      id: body.buildId || store.activeBuild?.id,
      device: body.device || store.activeBuild?.device || "violet",
      deviceName: body.deviceName || store.activeBuild?.deviceName || "Xiaomi Redmi Note 7 Pro",
      romName: body.romName || store.activeBuild?.romName || "DuoplesOS 1.0",
      version: body.version || store.activeBuild?.version || "1.0",
      branch: body.branch || store.activeBuild?.branch || "lineage-23.0",
      status: body.status,
      stage: body.stage || store.activeBuild?.stage || "idle",
      progress: typeof body.progress === "number" ? body.progress : store.activeBuild?.progress || 0,
      stageProgress: body.stageProgress,
      cores: body.cores || store.activeBuild?.cores || 6,
      endTime: body.status === "success" || body.status === "failed" ? new Date().toISOString() : undefined,
      duration,
      artifact: body.artifact || store.activeBuild?.artifact,
      artifactSize: body.artifactSize || store.activeBuild?.artifactSize,
      artifactSha256: body.artifactSha256 || store.activeBuild?.artifactSha256,
      errorLog: body.errorLog || store.activeBuild?.errorLog,
      warningsCount: typeof body.warningsCount === "number" ? body.warningsCount : store.activeBuild?.warningsCount || 0,
    });

    if (body.message) {
      const logLevel = body.status === "failed" ? "error" : body.status === "success" ? "info" : "stdout";
      addLog(`[*] ${body.message}`, logLevel, body.stage);
    }

    // Sync to PocketBase
    syncBuildToPocketBase(updated).catch(() => {});

    // Dispatch Push & Email notifications on key events
    if (isNewStatus) {
      if (body.status === "syncing" || (body.status === "compiling" && previousStatus === "idle")) {
        dispatchBuildNotification(updated, "start").catch(console.error);
      } else if (body.status === "success") {
        dispatchBuildNotification(updated, "success").catch(console.error);
      } else if (body.status === "failed") {
        dispatchBuildNotification(updated, "failure").catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      build: updated,
    });
  } catch (err: unknown) {
    console.error("[Build Event Handler Error]:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    activeBuild: store.activeBuild,
    history: store.buildsHistory,
  });
}
