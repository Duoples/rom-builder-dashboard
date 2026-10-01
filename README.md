# ⚡ DuoplesOS ROM & Linux Build Dashboard

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.25-blue?logo=pocketbase)](https://pocketbase.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Push](https://img.shields.io/badge/Web_Push-VAPID-cyan)](#web-push-notifications)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A developer-grade, real-time CI/CD Android & Linux compilation tracking dashboard with **Dual Build Environments** (**☁️ Crave.io Cloud Farm** + **🖥️ Self-Hosted Local VM**), native **Web Push Notifications**, **Gmail SMTP Email Routing**, **Live Terminal Streaming**, **PocketBase** backend integration, and an **Automated 24/7 Systemd Log Bridge**.

Built for compiling:
* **DuoplesOS 2.0 (Android 17 / LineageOS 23.2)** for **Xiaomi Redmi Note 7 (`lavender`)** & **Xiaomi Redmi Note 7 Pro (`violet`)**
* **Duoples Linux 1.1 LTS** (Debian/Ubuntu-compatible live ISOs & rootfs for ARM64 & AMD64)

---

```text
┌────────────────────────────────────────────────────────────────────────┐
│               DUOPLESOS HYBRID CI/CD BUILD DASHBOARD                  │
├──────────────────────┬─────────────────────────────────────────────────┤
│ Frontend (Port 3780) │ Next.js 15 (App Router) + Tailwind CSS + Lucide │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Backend (Port 8990)  │ PocketBase (Auth, DB, Real-time REST)           │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Notifications        │ Web Push (VAPID / Service Worker) + Gmail SMTP  │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Automated Bridge     │ crave-bridge.service (Systemd daemon on VM)     │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Cloud Farm           │ Crave.io (32-96 vCPUs, Ceph Snapclone, Queue)   │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Self-Hosted VM       │ Ubuntu ARM64 (Apple Silicon M-Series + UTM)     │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

* **🔄 100% Automated Real-Time Tracking:** Zero manual `curl` or POST commands required. The background daemon (`crave_log_bridge.py`) runs as a persistent **systemd service** (`crave-bridge.service`), auto-detecting jobs, inferring device codenames (`lavender` vs `violet`), and streaming compiler stdout in real time.
* **☁️ + 🖥️ Dual Build Environment Engine:** Toggle between **Crave.io Cloud Cluster** (zero local load, 32–96 Google Cloud cores) and **Self-Hosted VM** (local test builds, 64 GB Swap, Ccache) directly from the Web UI.
* **📱 Android ROM & 🐧 Linux Distro Modes:** Switch between tracking Android ROM compilation (`duoples_lavender`, `duoples_violet`) and Duoples Linux 1.1 LTS distro builds (KDE Plasma 6, GNOME 46, Gaming/Vulkan stack, rootfs packaging).
* **⚡ Live Progress & Compiler Metrics:** Parses Ninja compilation progress tags (e.g., `[ 42% 15200/36000 ]`) in real time, calculating stage transitions (`Repo Sync` → `Lunch` → `Soong Analysis` → `Ninja Compilation` → `Packaging ZIP`).
* **🔔 Native Web Push Notifications:** Browser push alerts via Service Worker (`/sw.js`) that trigger on your phone or desktop even when the dashboard tab is closed.
* **✉️ Automated Gmail SMTP Alerts:** Instant rich HTML email notifications on build start, completion (with checksums), or failure (with excerpted compiler diagnostics).
* **💻 Interactive Live Terminal Streamer:** Dark IDE terminal with real-time log scrolling, search filtering, error highlighting, full-screen mode, and log export.
* **🛡️ 100% Crave Rules Compliant:** Follows all [FOSSonTop Crave Documentation](https://fosson.top/crave/) mandates (uses `/opt/crave/resync.sh`, external non-devspace execution, and public Git manifests).

---

## 📂 Repository Structure

```text
├── agent/                         # Build Agents & Bridge Daemons
│   ├── crave_agent.sh             # 1-click script to launch compliant Crave.io cloud builds
│   ├── crave_log_bridge.py        # Real-time daemon (v3.0) streaming Crave logs to dashboard
│   ├── crave-bridge.service       # Systemd service unit for 24/7 background persistence
│   ├── build_agent.sh             # Full automated local VM build script with webhooks
│   ├── log_bridge.py              # Background daemon streaming local build.log to dashboard
│   └── setup_vm_host.sh           # Automated 1-click VM setup (Rosetta / Swap / Toolchains)
├── src/                           # Next.js 15 App Router Frontend & API
│   ├── app/
│   │   ├── api/                   # Webhook & Notification endpoints
│   │   │   ├── build-control/     # Start/Cancel builds (Crave or Self-Hosted)
│   │   │   ├── build-event/       # Lifecycle status changes & progress %
│   │   │   ├── build-log/         # Real-time log chunks
│   │   │   ├── status/            # Telemetry, active build & hardware metrics
│   │   │   ├── crave-sync/        # Direct server-side Crave job synchronization
│   │   │   └── notifications/     # Web Push & SMTP test routes
│   │   ├── page.tsx               # Main Dashboard Page
│   │   └── layout.tsx             # Root layout with PWA / Service Worker
│   ├── components/                # Modular Dashboard UI components
│   │   ├── BuildOverviewCard.tsx  # Hero card with environment badges & timers
│   │   ├── BuildControlsModal.tsx # Crave vs Self-Hosted build launch modal
│   │   ├── SystemMetricsCard.tsx  # Cloud vs Local hardware telemetry switcher
│   │   ├── StagePipeline.tsx      # Compilation stage progress indicators
│   │   └── LiveTerminal.tsx       # Real-time console log viewer
│   └── lib/                       # Types, store, and notification dispatchers
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
Create `.env.local` (or copy `.env.example`):
```bash
cp .env.example .env.local
```

Populate your notification and server credentials:
```env
# Web Push VAPID Keys (Generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
VAPID_SUBJECT=mailto:your_email@gmail.com

# Gmail SMTP Email Dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
NOTIFICATION_EMAIL_TO=recipient@gmail.com

# Build Server Host
BUILD_SERVER_HOST=192.168.2.192
```

### 3. Spin Up with Docker Compose
```bash
docker compose up -d --build
```

* **Frontend Web Dashboard:** [http://localhost:3780](http://localhost:3780)
* **PocketBase Admin UI:** [http://localhost:8990/_/](http://localhost:8990/_/)

---

## ☁️ Crave.io Cloud Farm Integration

[Crave.io](https://crave.io) provides high-performance cloud clusters (32–96 vCPUs, 128+ GB RAM) with cached AOSP/LineageOS trees, eliminating hours of syncing and compiler resource strain on local machines.

### 1. Configure Crave CLI on the Build Server
1. Download `crave.conf` and your API key from [foss.crave.io](https://foss.crave.io).
2. Place `crave.conf` at `/home/crave.conf` on the build machine/VM (`192.168.2.192`).
3. Verify your connection:
   ```bash
   /home/crave -n -c /home/crave.conf list
   ```

### 2. Install the 24/7 Automated Log Bridge (`systemd`)
Deploy `crave-bridge.service` on the build machine:
```bash
sudo cp agent/crave-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now crave-bridge
```

Verify service status:
```bash
systemctl status crave-bridge
journalctl -u crave-bridge -f
```

The daemon automatically:
1. Queries `crave list` every 5 seconds.
2. Identifies active jobs and inspects build targets (`lavender` or `violet`).
3. Streams new compiler lines to the dashboard terminal via `/api/build-log`.
4. Extracts compiler percentages (`[ 45% 15000/32000 ]`) and updates `/api/build-event`.
5. Surfaces completion and failure diagnostics with excerpted errors automatically.

### 3. Launching a Build (`crave_agent.sh`)
Execute the automated Crave build launcher:
```bash
./agent/crave_agent.sh
```

Under the hood, this executes the doc-compliant command:
```bash
/home/crave -n -c /home/crave.conf run --projectID 99 --no-patch --detached -- \
"/bin/bash -c '
set -e
rm -rf .repo/local_manifests /tmp/custom
mkdir -p .repo/local_manifests /tmp/custom
curl -sL -A \"Mozilla/5.0\" https://github.com/Duoples/duoplesos-rom/archive/refs/heads/master.tar.gz -o /tmp/rom.tar.gz && tar -xzf /tmp/rom.tar.gz -C /tmp/custom --strip-components=1
cp /tmp/custom/manifests/duoplesos_lavender.xml .repo/local_manifests/
/opt/crave/resync.sh

mkdir -p vendor/duoples device/xiaomi/lavender
cp -r /tmp/custom/vendor/duoples/* vendor/duoples/ 2>/dev/null || true
cp -r /tmp/custom/device_lavender_patches/* device/xiaomi/lavender/ 2>/dev/null || true

source build/envsetup.sh
lunch duoples_lavender-bp4a-userdebug || lunch lineage_lavender-userdebug
m bacon
'"
```

### 4. Pull Compiled ROM Artifacts
Once compilation completes successfully:
```bash
crave pull out/target/product/*/*.zip
```

---

## 🖥️ Self-Hosted VM Build Option

For building on an **Ubuntu VM (Apple Silicon M-Series via UTM, or bare-metal Linux)**:

### 1. One-Click Environment Setup
Run `setup_vm_host.sh` on your build VM as root:
```bash
sudo ./agent/setup_vm_host.sh
```
Configures:
* **Toolchains:** `build-essential`, `ccache`, `bison`, `flex`, `openjdk-21`, `python3`.
* **64 GB Persistent Swapfile:** Prevents OOM crashes during Clang linking.
* **Apple Silicon Rosetta 2 / VirtIOFS Multiarch:** Enables ARM64 Linux kernels to run Google's x86_64 host compiler prebuilts with near-native speed.
* **Ccache:** Configured to a 50 GB cache limit.

### 2. Connect Local Build Stream (`log_bridge.py`)
```bash
DASHBOARD_URL="http://<HOST_IP>:3780" screen -dmS log_bridge python3 agent/log_bridge.py
```

---

## 📡 REST API & Webhook Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/build-control` | `POST` | Starts or cancels builds (Crave cloud or Self-hosted VM). |
| `/api/build-event` | `POST` | Updates lifecycle state, progress %, and triggers notifications. |
| `/api/build-log` | `POST` | Ingests real-time terminal output chunks from bridge daemons. |
| `/api/crave-sync` | `GET` | Direct server-side synchronization of Crave active jobs and history. |
| `/api/status` | `GET` | Returns active build metadata, hardware metrics, and subscriber counts. |
| `/api/notifications/push-subscribe` | `POST` | Registers browser client for Web Push notifications. |
| `/api/notifications/test-email` | `POST` | Dispatches a diagnostic test email via Gmail SMTP. |
| `/api/notifications/test-push` | `POST` | Sends an immediate test Web Push notification. |

---

## 📄 License

Licensed under the **Apache License 2.0**.  
Copyright © 2026 Duoples.
