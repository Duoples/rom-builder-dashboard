import webpush from "web-push";
import nodemailer from "nodemailer";
import { store } from "./store";
import { BuildRecord } from "./types";

// Setup Web Push VAPID
const publicVapidKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BPxSg3jF_STRDhIDP8Oz6Kz2KAWOGonH7grcQDUmnA6lT7rMOfCiYTpKm9SeQfXZKcqlXL5NvEojoxWnrAYj9cU";
const privateVapidKey =
  process.env.VAPID_PRIVATE_KEY || "sUmWEs8T53JDpRU87Oq0SbS8r4NWRLYcvHrhtSRebg8";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:duoplesos@gmail.com";

try {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
} catch (e) {
  console.warn("[WebPush Init] Warning:", e);
}

// Setup Nodemailer Transporter with Gmail credentials
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465");
const smtpUser = process.env.SMTP_USER || "duoplesos@gmail.com";
const smtpPass = process.env.SMTP_PASS || "lqxznnhqdvumcopj";
const smtpFrom = process.env.SMTP_FROM || `"DuoplesOS CI/CD" <duoplesos@gmail.com>`;
const recipients = process.env.NOTIFICATION_EMAIL_TO || "duoples77@gmail.com,duoplesos@gmail.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export interface NotificationContent {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(payload: NotificationContent): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const notificationData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/badge-72x72.png",
    tag: payload.tag || "duoplesos-build",
    data: {
      url: payload.url || "/",
      ...payload.data,
    },
  });

  const subscriptions = store.subscriptions;
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const sendPromises = subscriptions.map(async (sub, index) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        },
        notificationData
      );
      sent++;
    } catch (err: unknown) {
      failed++;
      // If subscription expired or invalid, remove it
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        store.subscriptions.splice(index, 1);
      }
    }
  });

  await Promise.allSettled(sendPromises);
  return { sent, failed };
}

export async function sendEmailAlert(subject: string, htmlContent: string, plainText?: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: recipients,
      subject: `[DuoplesOS Build] ${subject}`,
      text: plainText || subject,
      html: htmlContent,
    });
    return true;
  } catch (err) {
    console.error("[Email Notification Failed]:", err);
    return false;
  }
}

export async function dispatchBuildNotification(build: BuildRecord, eventType: "start" | "success" | "failure" | "progress"): Promise<void> {
  const device = build.deviceName || build.device;
  const rom = build.romName || "DuoplesOS";

  if (eventType === "start") {
    // 1. Web Push
    await sendPushNotification({
      title: `🚀 ROM Build Started: ${rom}`,
      body: `Building for ${device} (${build.branch}) on ${build.cores} cores.`,
      tag: `build-${build.id}`,
    });

    // 2. Email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
        <h2 style="color: #38bdf8; margin-top: 0;">🚀 DuoplesOS Build Started</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">A new compilation has been triggered for <strong>${device}</strong>.</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="color: #94a3b8; padding: 6px 0;">Device</td><td style="color: #f8fafc; font-weight: 600;">${device} (${build.device})</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">ROM Version</td><td style="color: #f8fafc;">${rom} (${build.version})</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Branch</td><td style="color: #f8fafc;">${build.branch}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Concurrency</td><td style="color: #f8fafc;">${build.cores} Parallel Cores</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Start Time</td><td style="color: #f8fafc;">${new Date(build.startTime).toLocaleString()}</td></tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #64748b;">You can monitor the live compile logs in the DuoplesOS Build Dashboard.</p>
      </div>
    `;
    await sendEmailAlert(`Build Started for ${device}`, html);
  } else if (eventType === "success") {
    // 1. Web Push
    await sendPushNotification({
      title: `🎉 Build Succeeded: ${rom} for ${device}!`,
      body: `Compilation completed in ${build.duration || "N/A"}. Package: ${build.artifact || "Ready"}`,
      tag: `build-${build.id}`,
    });

    // 2. Email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #10b981;">
        <h2 style="color: #10b981; margin-top: 0;">🎉 DuoplesOS Build Succeeded!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">The ROM compilation for <strong>${device}</strong> has finished successfully.</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="color: #94a3b8; padding: 6px 0;">Device</td><td style="color: #f8fafc; font-weight: 600;">${device} (${build.device})</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Duration</td><td style="color: #f8fafc;">${build.duration || "Completed"}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Artifact File</td><td style="color: #38bdf8; font-family: monospace;">${build.artifact || "DuoplesOS-violet.zip"}</td></tr>
            <tr><td style="color: #94a3b8; padding: 6px 0;">Size</td><td style="color: #f8fafc;">${build.artifactSize || "1.4 GB"}</td></tr>
            ${build.artifactSha256 ? `<tr><td style="color: #94a3b8; padding: 6px 0;">SHA256</td><td style="color: #94a3b8; font-family: monospace; font-size: 11px;">${build.artifactSha256}</td></tr>` : ""}
          </table>
        </div>
        <p style="font-size: 13px; color: #64748b;">Ready for flashing via recovery or sideload.</p>
      </div>
    `;
    await sendEmailAlert(`SUCCESS: ${rom} Built for ${device}`, html);
  } else if (eventType === "failure") {
    // 1. Web Push
    await sendPushNotification({
      title: `❌ Build Failed: ${rom} for ${device}`,
      body: `Stage: ${build.stage}. Error: ${build.errorLog ? build.errorLog.substring(0, 100) : "Check dashboard logs"}`,
      tag: `build-${build.id}`,
    });

    // 2. Email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #ef4444;">
        <h2 style="color: #ef4444; margin-top: 0;">❌ DuoplesOS Build Failed</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">The compilation for <strong>${device}</strong> encountered an error during stage <code>${build.stage}</code>.</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #f87171; font-size: 13px; text-transform: uppercase;">Error Details:</h4>
          <pre style="background: #090d16; color: #fca5a5; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap;">${build.errorLog || "Subcommand exited with non-zero status. Check full build log."}</pre>
        </div>
        <p style="font-size: 13px; color: #64748b;">Please check the live terminal in the dashboard to review complete diagnostic logs.</p>
      </div>
    `;
    await sendEmailAlert(`FAILED: ${rom} Build Error on ${device}`, html);
  }
}
