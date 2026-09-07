import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/notifications";
import { store } from "@/lib/store";

export async function POST() {
  try {
    if (store.subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No active push subscriptions found. Please click 'Enable Web Push' in the dashboard first.",
      });
    }

    const result = await sendPushNotification({
      title: "⚡ DuoplesOS Push Alert Test",
      body: `Testing Web Push notifications! Active subscribers: ${store.subscriptions.length}`,
      tag: "test-push",
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      message: `Dispatched test push to ${result.sent} device(s)`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
