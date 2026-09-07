import { NextRequest, NextResponse } from "next/server";
import { store, addLog } from "@/lib/store";
import { syncLogToPocketBase } from "@/lib/pocketbase";
import { LogEntry } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let lines: string[] = [];
    let level: LogEntry["level"] = "stdout";
    let stage = store.activeBuild?.stage || "ninja_compilation";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body.text === "string") {
        lines = body.text.split("\n");
      } else if (Array.isArray(body.lines)) {
        lines = body.lines;
      }
      level = body.level || "stdout";
      if (body.stage) stage = body.stage;
    } else {
      const rawText = await req.text();
      lines = rawText.split("\n");
    }

    const buildId = store.activeBuild?.id || "active";
    const addedEntries: LogEntry[] = [];

    for (const rawLine of lines) {
      const trimmed = rawLine.trimEnd();
      if (!trimmed) continue;

      let lineLevel: LogEntry["level"] = level;
      if (trimmed.includes("error:") || trimmed.includes("FAILED:") || trimmed.includes("fatal error:")) {
        lineLevel = "error";
      } else if (trimmed.includes("warning:") || trimmed.includes("[W][")) {
        lineLevel = "warn";
      }

      const entry = addLog(trimmed, lineLevel, stage);
      addedEntries.push(entry);

      // Non-blocking sync to PocketBase
      syncLogToPocketBase(entry, buildId).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      count: addedEntries.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "200");
  const since = searchParams.get("since");

  let logs = store.logs;
  if (since) {
    const sinceTime = new Date(since).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() > sinceTime);
  }

  return NextResponse.json({
    logs: logs.slice(-limit),
    totalCount: store.logs.length,
  });
}
