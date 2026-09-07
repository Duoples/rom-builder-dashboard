"use client";

import React, { useState } from "react";
import { X, Mail, Bell, Send, CheckCircle2, AlertCircle, ShieldCheck, Key } from "lucide-react";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pushSubscribed: boolean;
  subscribersCount: number;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  pushSubscribed,
  subscribersCount,
}) => {
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [pushStatus, setPushStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pushMessage, setPushMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleTestEmail = async () => {
    setEmailStatus("loading");
    setEmailMessage("");
    try {
      const res = await fetch("/api/notifications/test-email", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("success");
        setEmailMessage("Test email successfully sent to duoples77@gmail.com!");
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error || "Failed to send email");
      }
    } catch (e: unknown) {
      setEmailStatus("error");
      setEmailMessage((e as Error).message);
    }
  };

  const handleTestPush = async () => {
    setPushStatus("loading");
    setPushMessage("");
    try {
      const res = await fetch("/api/notifications/test-push", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPushStatus("success");
        setPushMessage(data.message || "Test push notification dispatched!");
      } else {
        setPushStatus("error");
        setPushMessage(data.error || "Failed to send push");
      }
    } catch (e: unknown) {
      setPushStatus("error");
      setPushMessage((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg glass-panel-glow rounded-2xl border border-slate-700/80 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Notifications & Alerts</h3>
            <p className="text-xs text-slate-400">Web Push and Gmail SMTP routing</p>
          </div>
        </div>

        {/* Section 1: Email Configuration */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Gmail SMTP Channel</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active (Port 465)
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-400 mb-3 font-mono">
              <p>Sender: <span className="text-slate-200">duoplesos@gmail.com</span></p>
              <p>Recipients: <span className="text-slate-200">duoples77@gmail.com</span></p>
            </div>

            <button
              onClick={handleTestEmail}
              disabled={emailStatus === "loading"}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{emailStatus === "loading" ? "Sending Test Email..." : "Send Test Email"}</span>
            </button>

            {emailStatus === "success" && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{emailMessage}</span>
              </div>
            )}
            {emailStatus === "error" && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailMessage}</span>
              </div>
            )}
          </div>

          {/* Section 2: Web Push Configuration */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Browser Web Push</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                pushSubscribed
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {pushSubscribed ? "This Device Subscribed" : "Not Subscribed"}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Total registered subscriber devices: <strong className="text-white">{subscribersCount}</strong>
            </p>

            <button
              onClick={handleTestPush}
              disabled={pushStatus === "loading" || subscribersCount === 0}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{pushStatus === "loading" ? "Dispatching Push..." : "Test Push Alert"}</span>
            </button>

            {pushStatus === "success" && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pushMessage}</span>
              </div>
            )}
            {pushStatus === "error" && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pushMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
