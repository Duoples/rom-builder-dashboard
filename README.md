# ⚡ DuoplesOS ROM Build Dashboard

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.25-blue?logo=pocketbase)](https://pocketbase.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Push](https://img.shields.io/badge/Web_Push-VAPID-cyan)](#web-push-notifications)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A real-time CI/CD Android & LineageOS ROM compilation tracking dashboard with native **Web Push Notifications**, **Gmail SMTP Email Routing**, **Live Terminal Streaming**, and **PocketBase** backend integration.

Built specifically for compiling **DuoplesOS 1.0** (Android 16 / LineageOS 23.0) on the **Xiaomi Redmi Note 7 Pro (`violet`)** and scalable to any AOSP target device.

---

```
┌────────────────────────────────────────────────────────┐
│        THE FULL-STACK NOTIFICATION ROM BUILDER         │
├───────────────────┬────────────────────────────────────┤
│ Frontend          │ Next.js 15 (App Router) + Tailwind │
├───────────────────┼────────────────────────────────────┤
│ Backend & DB      │ PocketBase (Auth, DB, Real-time)   │
├───────────────────┼────────────────────────────────────┤
│ Notifications     │ Web Push (VAPID) + Gmail SMTP      │
├───────────────────┼────────────────────────────────────┤
│ Build Agent       │ Bash Hook Script + cURL Webhooks   │
└───────────────────┴────────────────────────────────────┘
```

---

## 🌟 Key Features

* **⚡ Real-Time Build Lifecycle Tracker:** Live progress bar with stage-by-stage pipeline visualization (`Repo Sync` → `Customizations` → `Envsetup & Lunch` → `Soong Analysis` → `Ninja Compilation` → `Packaging ZIP`).
* **🔔 Native Web Push Notifications:** Browser push alerts via Service Worker (`/sw.js`) that trigger on your phone or desktop even when the dashboard tab is completely closed.
* **✉️ Automated Gmail SMTP Alerts:** Instant rich HTML email notifications on build start, completion (with checksums), or failure (with excerpted compiler diagnostics).
* **💻 Interactive Live Terminal Streamer:** Dark IDE terminal with real-time log scrolling, search filtering, error highlighting, full-screen mode, and log export.
* **📊 Hardware Resource Monitor:** Real-time visibility into CPU allocation (8 Cores, -j6), 10 GB Physical RAM, 64 GB persistent Swapfile, and 50 GB Ccache.
* **📦 Build Artifacts Archive:** History table of previous builds with duration stopwatch, zip package sizes, and SHA256 integrity checksums.
* **🚀 Single-Command Orchestration:** `docker-compose.yml` to spin up both PocketBase and Next.js instantly.

---

## 🚀 Quickstart

### 1. Clone the Repository
```bash
git clone https://github.com/Duoples/rom-builder-dashboard.git
cd rom-builder-dashboard
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your notification settings:
```env
# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
VAPID_SUBJECT=mailto:your@email.com

# Gmail SMTP Email Dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL_TO=recipient@gmail.com
```

### 3. Run Locally (Development)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To spin up the entire stack (Next.js + PocketBase) with persistent volume storage:

```bash
docker compose up -d --build
```

* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **PocketBase Admin UI:** [http://localhost:8090/_/](http://localhost:8090/_/)

---

## 🛠️ Build Agent Hook Integration (`build_agent.sh`)

In your build server or VM (`/home/duoplesos_build/`), run the automated build agent to stream logs and fire webhooks:

```bash
chmod +x build_agent.sh
./build_agent.sh
```

### Webhook API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/build-event` | `POST` | Dispatches lifecycle events (`syncing`, `compiling`, `success`, `failed`). |
| `/api/build-log` | `POST` | Appends real-time compiler log chunks. |
| `/api/status` | `GET` | Returns active build status, system metrics, and connection health. |
| `/api/notifications/push-subscribe` | `POST` | Registers client browser for Web Push notifications. |
| `/api/notifications/test-email` | `POST` | Triggers a test email via SMTP. |
| `/api/notifications/test-push` | `POST` | Triggers a test Web Push alert. |

---

## 📱 Device Specifications

* **Target Device:** Xiaomi Redmi Note 7 Pro (`violet`)
* **Chipset:** Qualcomm Snapdragon 675 (SM6150)
* **Architecture:** `arm64` (Cortex-A55)
* **Base Source:** LineageOS 23.0 (`lineage-23.0` / Android 16 Trunk / `BP2A.250805.005`)
* **Custom ROM:** **DuoplesOS 1.0**

---

## 📄 License

Licensed under the **Apache License 2.0**.
Copyright © 2026 Duoples.
