# ⚡ DuoplesOS ROM Build Dashboard

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.25-blue?logo=pocketbase)](https://pocketbase.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Push](https://img.shields.io/badge/Web_Push-VAPID-cyan)](#web-push-notifications)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A real-time CI/CD Android & LineageOS ROM compilation tracking dashboard with native **Web Push Notifications**, **Gmail SMTP Email Routing**, **Live Terminal Streaming**, and **PocketBase** backend integration.

Built for compiling **DuoplesOS 1.0** (Android 16 / LineageOS 23.0) on the **Xiaomi Redmi Note 7 Pro (`violet`)** and adaptable to any custom ROM (AOSP, LineageOS, PixelExperience, CrDroid) and device target on your own hardware or virtual machines.

---

```
┌────────────────────────────────────────────────────────┐
│        THE FULL-STACK NOTIFICATION ROM BUILDER         │
├───────────────────┬────────────────────────────────────┤
│ Frontend (Port 3780) Next.js 15 (App Router) + Tailwind│
├───────────────────┼────────────────────────────────────┤
│ Backend (Port 8990) PocketBase (Auth, DB, Real-time)  │
├───────────────────┼────────────────────────────────────┤
│ Notifications     │ Web Push (VAPID) + Gmail SMTP      │
├───────────────────┼────────────────────────────────────┤
│ Build Agent       │ Python Bridge + Bash Hooks + cURL  │
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
* **🚀 Standalone & Multi-Host Architecture:** The dashboard runs on your host machine while your build compiles on a dedicated VM or server without UI freezes.

---

## 📂 Repository Structure

```text
├── agent/                         # Build Agent & VM Tools
│   ├── build_agent.sh             # Full automated build script with webhook hooks
│   ├── log_bridge.py              # Background daemon streaming build.log to dashboard
│   └── setup_vm_host.sh           # Automated 1-click VM setup (ARM64 Rosetta / Swap / Multiarch)
├── src/                           # Next.js 15 App Router Frontend & API
│   ├── app/
│   │   ├── api/                   # Webhook & Notification endpoints
│   │   │   ├── build-event/       # Lifecycle status changes
│   │   │   ├── build-log/         # Real-time log chunks
│   │   │   ├── status/            # Health & hardware metrics
│   │   │   └── notifications/     # Web Push & SMTP test routes
│   │   ├── page.tsx               # Main Dashboard Page
│   │   └── layout.tsx             # Root layout with PWA / Service Worker
│   └── components/                # Modular Dashboard UI components
├── public/
│   ├── sw.js                      # Web Push Service Worker
│   └── manifest.json              # Web App Manifest
├── Dockerfile                     # Next.js standalone container
├── docker-compose.yml             # Single-command stack (Frontend + PocketBase)
└── README.md
```

---

## 🚀 Quickstart: Running the Dashboard

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
SMTP_PASS=your_gmail_app_password
NOTIFICATION_EMAIL_TO=recipient@gmail.com
```

### 3. Spin Up with Docker
```bash
docker compose up -d --build
```

* **Frontend Web Dashboard:** [http://localhost:3780](http://localhost:3780)
* **PocketBase Admin UI:** [http://localhost:8990/_/](http://localhost:8990/_/)

---

## 🛠️ Setting Up Your Build Machine / VM (`agent/`)

If you are compiling custom ROMs on an **Ubuntu VM (Apple Silicon M1/M2/M3/M4 or x86_64)**, we have included automated setup and bridge tools:

### 1. One-Click Environment Setup
Run `setup_vm_host.sh` on your build machine as root:
```bash
sudo ./agent/setup_vm_host.sh
```
This automatically configures:
- Essential compiler toolchains (`build-essential`, `ccache`, `bison`, `flex`, `openjdk-21`).
- **64 GB Persistent Swapfile** to prevent Out-Of-Memory (OOM) compiler crashes.
- **Apple Silicon Rosetta 2 / Multiarch execution** for ARM64 host builds running x86_64 prebuilts.
- **50 GB Ccache** cache limits.

### 2. Connect Your Build to the Dashboard (`log_bridge.py`)
Run the bridge daemon on your build VM in a detached screen session:
```bash
DASHBOARD_URL="http://<HOST_IP>:3780" screen -dmS log_bridge python3 agent/log_bridge.py
```
This automatically:
- Tails `/home/duoplesos_build/build.log` and pipes logs into the dashboard in real time.
- Detects compilation stages (`Soong Analysis` → `Ninja Compilation` → `Packaging`).
- Automatically fires **Web Push** and **Email Alerts** on build completion or failure.

---

## 📡 Webhook API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/build-event` | `POST` | Dispatches lifecycle events (`syncing`, `compiling`, `success`, `failed`). |
| `/api/build-log` | `POST` | Appends real-time compiler log chunks. |
| `/api/status` | `GET` | Returns active build status, system metrics, and connection health. |
| `/api/notifications/push-subscribe` | `POST` | Registers client browser for Web Push notifications. |
| `/api/notifications/test-email` | `POST` | Triggers a test email via SMTP. |
| `/api/notifications/test-push` | `POST` | Triggers a test Web Push alert. |

---

## 📱 Supported Target Example: Xiaomi Redmi Note 7 Pro (`violet`)

* **Chipset:** Qualcomm Snapdragon 675 (SM6150)
* **Architecture:** `arm64` (Cortex-A55)
* **Base Source:** LineageOS 23.0 (`lineage-23.0` / Android 16 Trunk / `BP2A.250805.005`)
* **Custom ROM:** **DuoplesOS 1.0**

---

## 📄 License

Licensed under the **Apache License 2.0**.
Copyright © 2026 Duoples.
