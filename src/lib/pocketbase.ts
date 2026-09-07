import PocketBase from "pocketbase";
import { store } from "./store";
import { BuildRecord, LogEntry, PushSubscriptionItem } from "./types";

const pbUrl = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";
export const pb = new PocketBase(pbUrl);

// Flag to avoid repeated auth failures if PB is not spun up yet
let pbAvailable = false;
let pbAuthChecked = false;

export async function checkPocketBaseConnection(): Promise<boolean> {
  if (pbAuthChecked && pbAvailable) return true;
  try {
    const health = await pb.health.check();
    pbAvailable = health.code === 200;
    pbAuthChecked = true;
    return pbAvailable;
  } catch {
    pbAvailable = false;
    pbAuthChecked = true;
    return false;
  }
}

export async function syncBuildToPocketBase(build: BuildRecord): Promise<void> {
  const isHealthy = await checkPocketBaseConnection();
  if (!isHealthy) return;

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || "admin@duoplesos.local";
    const adminPass = process.env.POCKETBASE_ADMIN_PASSWORD || "DuoplesOSBuild2026!";
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(adminEmail, adminPass).catch(() => {});
    }

    // Try update or create
    try {
      await pb.collection("builds").update(build.id, build);
    } catch {
      await pb.collection("builds").create(build);
    }
  } catch (err) {
    console.warn("[PocketBase Sync] Warning:", err);
  }
}

export async function syncLogToPocketBase(log: LogEntry, buildId: string): Promise<void> {
  const isHealthy = await checkPocketBaseConnection();
  if (!isHealthy) return;

  try {
    await pb.collection("build_logs").create({
      buildId,
      timestamp: log.timestamp,
      level: log.level,
      text: log.text,
      stage: log.stage,
    });
  } catch {
    // Non-blocking log sync
  }
}

export async function savePushSubscriptionToPB(sub: PushSubscriptionItem): Promise<void> {
  const isHealthy = await checkPocketBaseConnection();
  if (!isHealthy) return;

  try {
    await pb.collection("push_subscriptions").create({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: sub.userAgent,
      createdAt: sub.createdAt,
    });
  } catch (err) {
    console.warn("[PB Push Sub] Warning:", err);
  }
}

export async function getBuildsFromPB(): Promise<BuildRecord[]> {
  const isHealthy = await checkPocketBaseConnection();
  if (!isHealthy) return store.buildsHistory;

  try {
    const records = await pb.collection("builds").getFullList<BuildRecord>({
      sort: "-created",
    });
    return records;
  } catch {
    return store.buildsHistory;
  }
}
