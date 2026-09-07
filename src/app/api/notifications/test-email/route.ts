import { NextResponse } from "next/server";
import { sendEmailAlert } from "@/lib/notifications";

export async function POST() {
  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #38bdf8;">
        <h2 style="color: #38bdf8; margin-top: 0;">⚡ DuoplesOS SMTP Test</h2>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.5;">
          This is a confirmation test email from your self-hosted <strong>DuoplesOS ROM Build Dashboard</strong>.
        </p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8;">
            SMTP Host: <strong style="color: #f8fafc;">smtp.gmail.com:465</strong><br/>
            Sender: <strong style="color: #f8fafc;">duoplesos@gmail.com</strong><br/>
            Timestamp: <strong style="color: #f8fafc;">${new Date().toLocaleString()}</strong>
          </p>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          Your notification pipeline is online and configured to dispatch alerts when builds start, complete, or encounter errors.
        </p>
      </div>
    `;

    const success = await sendEmailAlert("Notification Channel Test", html);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to send email via SMTP transporter. Check server logs." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully via duoplesos@gmail.com to duoples77@gmail.com",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
