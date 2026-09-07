import { NextRequest, NextResponse } from "next/server";
import { registerPushSubscription } from "@/lib/store";
import { savePushSubscriptionToPB } from "@/lib/pocketbase";
import { sendPushNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || undefined;

    if (!body || !body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Invalid push subscription object" },
        { status: 400 }
      );
    }

    const subscriptionItem = {
      endpoint: body.endpoint,
      keys: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      userAgent,
      createdAt: new Date().toISOString(),
    };

    // Save in in-memory store & PocketBase
    registerPushSubscription(subscriptionItem);
    savePushSubscriptionToPB(subscriptionItem).catch(() => {});

    // Send immediate confirmation push
    await sendPushNotification({
      title: "🔔 Notifications Enabled!",
      body: "You will receive real-time build alerts for DuoplesOS ROM compilations.",
      tag: "welcome-push",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Subscription registered successfully",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
