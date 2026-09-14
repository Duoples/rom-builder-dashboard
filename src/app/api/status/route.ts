import { NextResponse } from "next/server";
import { store, defaultAndroidBuild, defaultLinuxBuild } from "@/lib/store";
import { checkPocketBaseConnection } from "@/lib/pocketbase";

export async function GET() {
  const pbConnected = await checkPocketBaseConnection();

  return NextResponse.json({
    activeBuild: store.activeBuild,
    activeAndroidBuild: store.activeAndroidBuild || defaultAndroidBuild,
    activeLinuxBuild: store.activeLinuxBuild || defaultLinuxBuild,
    buildsHistory: store.buildsHistory,
    systemStats: store.systemStats,
    subscribersCount: store.subscriptions.length,
    pocketbaseConnected: pbConnected,
    recentLogsCount: store.logs.length,
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
}
