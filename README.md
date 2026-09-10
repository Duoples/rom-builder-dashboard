# ⚡ DuoplesOS ROM Build Dashboard

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.25-blue?logo=pocketbase)](https://pocketbase.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Push](https://img.shields.io/badge/Web_Push-VAPID-cyan)](#web-push-notifications)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A developer-grade, real-time CI/CD Android & LineageOS ROM compilation tracking dashboard with **Dual Build Environments** (**☁️ Crave.io Cloud Farm** + **🖥️ Self-Hosted Local VM**), native **Web Push Notifications**, **Gmail SMTP Email Routing**, **Live Terminal Streaming**, and **PocketBase** backend integration.

Built for compiling **DuoplesOS 1.0** (Android 16 / LineageOS 23.0) on the **Xiaomi Redmi Note 7 Pro (`violet`)** and adaptable to any custom ROM (AOSP, LineageOS, PixelExperience, CrDroid, EvolutionX) and device target.

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
│ Cloud Farm           │ Crave.io (32-96 vCPUs, Ceph Snapclone, Queue)   │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Self-Hosted VM       │ Ubuntu ARM64 (Apple Silicon M-Series + UTM)     │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

* **☁️ + 🖥️ Dual Build Environment Engine:** Toggle between **Crave.io Cloud Cluster** (zero local load, 32–96 Google Cloud cores) and **Self-Hosted VM** (6 cores, 64 GB Swap, local testing) directly from the Web UI.
* **⚡ Real-Time Build Lifecycle Tracker:** Live progress bar with stage-by-stage pipeline visualization (`Repo Sync` → `Customizations` → `Envsetup & Lunch` → `Soong Analysis` → `Ninja Compilation` → `Packaging ZIP`).
* **🔔 Native Web Push Notifications:** Browser push alerts via Service Worker (`/sw.js`) that trigger on your phone or desktop even when the dashboard tab is completely closed.
* **✉️ Automated Gmail SMTP Alerts:** Instant rich HTML email notifications on build start, completion (with checksums), or failure (with excerpted compiler diagnostics).
* **💻 Interactive Live Terminal Streamer:** Dark IDE terminal with real-time log scrolling, search filtering, error highlighting, full-screen mode, and log export.
* **📊 Dynamic Telemetry Switcher:** Switch between cloud cluster metrics (Crave node type, project ID, active queue) and local hardware stats (vCPUs, RAM, 64 GB Swap, NVMe partition, Ccache).
* **📦 Build Artifacts Archive:** History table of previous builds with duration stopwatch, zip package sizes, and SHA256 integrity checksums.
* **🛡️ 100% Crave Rules Compliant:** Follows all [FOSSonTop Crave Documentation](https://fosson.top/crave/) mandates (uses `/opt/crave/resync.sh`, external non-devspace execution, and public Git manifests).

---

## 📂 Repository Structure

```text
├── agent/                         # Build Agents & Bridge Daemons
│   ├── crave_agent.sh             # 1-click script to launch compliant Crave.io cloud builds
│   ├── crave_log_bridge.py        # Background daemon streaming Crave logs to dashboard
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

## ☁️ Option A: Building with Crave.io Cloud Farm

[Crave.io](https://crave.io) provides high-performance cloud clusters (32–96 vCPUs, 128+ GB RAM) with cached AOSP/LineageOS trees, eliminating hours of syncing and compiler resource strain on local machines.

### ⚠️ Critical Crave Rules to Avoid Bans (Per FOSSonTop Documentation)
According to [FOSSonTop Crave Documentation](https://fosson.top/crave/):
1. **NEVER run manual `repo sync`:** Use Crave's internal `/opt/crave/resync.sh` script. Manual `repo sync` is considered bandwidth abuse and triggers automated bans.
2. **NEVER build inside Devspace CLI:** Do not run `mka`, `make`, or `build.sh` inside Devspace. Use `crave run` to dispatch jobs to the build node cluster.
3. **Use Public Repositories:** Crave's FOSS tier strictly prohibits private repositories for manifests and device trees.

### 1. Configure Crave CLI on Your Machine or VM
1. Download `crave.conf` and your API key from [foss.crave.io](https://foss.crave.io).
2. Place `crave.conf` at `/home/crave.conf` or `~/.crave/crave.conf`.
3. Verify your connection:
   ```bash
   crave -n list
   ```

### 2. Launch a Compliant Crave Build (`crave_agent.sh`)
Execute the automated Crave build launcher:
```bash
./agent/crave_agent.sh
```

Under the hood, this executes the doc-compliant command:
```bash
crave -n -c /home/crave.conf run --projectID 99 --no-patch --detached -- \
"rm -rf .repo/local_manifests /tmp/custom; \
mkdir -p .repo/local_manifests /tmp/custom; \
curl -sL -A 'Mozilla/5.0' https://github.com/Duoples/duoplesos-rom/archive/refs/heads/master.tar.gz -o /tmp/rom.tar.gz && tar -xzf /tmp/rom.tar.gz -C /tmp/custom --strip-components=1; \
cp -r /tmp/custom/manifests/* .repo/local_manifests/; \
/opt/crave/resync.sh; \
mkdir -p vendor/duoples device/xiaomi/violet; \
cp -r /tmp/custom/vendor/duoples/* vendor/duoples/ 2>/dev/null || true; \
cp -r /tmp/custom/device_violet_patches/* device/xiaomi/violet/ 2>/dev/null || true; \
source build/envsetup.sh; \
lunch duoples_violet-bp2a-userdebug; \
m bacon"
```

### 3. Connect the Crave Cloud Log Bridge (`crave_log_bridge.py`)
Run the bridge daemon in a screen session:
```bash
DASHBOARD_URL="http://<HOST_IP>:3780" screen -dmS crave_bridge python3 agent/crave_log_bridge.py
```
This automatically polls `crave getlog`, extracts Ninja `[% /]` compilation percentages, and updates your dashboard with Web Push and email notifications.

### 4. Pull Compiled ROM Artifacts
Once compilation is marked complete:
```bash
crave pull out/target/product/*/*.zip
```

---

## 🖥️ Option B: Building on Self-Hosted VM (Apple Silicon / x86_64)

If you prefer building locally on an **Ubuntu VM (Apple Silicon M1/M2/M3/M4 via UTM, or bare-metal Linux)**:

### 1. One-Click Environment Setup
Run `setup_vm_host.sh` on your build VM as root:
```bash
sudo ./agent/setup_vm_host.sh
```
This automatically configures:
* **Toolchains:** `build-essential`, `ccache`, `bison`, `flex`, `openjdk-21`, `python3`.
* **64 GB Persistent Swapfile:** Crucial to prevent Out-Of-Memory (OOM) compiler crashes during multi-gigabyte Soong and Clang linking phases.
* **Apple Silicon Rosetta 2 / VirtIOFS Multiarch:** Enables ARM64 Linux kernels to run Google's x86_64 host compiler prebuilts with near-native speed.
* **Ccache:** Configured to a 50 GB cache limit.

### 2. Connect Your Build to the Dashboard (`log_bridge.py`)
Run the local bridge daemon in a detached screen session:
```bash
DASHBOARD_URL="http://<HOST_IP>:3780" screen -dmS log_bridge python3 agent/log_bridge.py
```

### 3. Run the Local Build
```bash
tmux new-session -d -s build './build_local.sh 2>&1 | tee build.log'
```

---

## 📡 REST API & Webhook Endpoints

External CI/CD scripts, GitHub Actions, and custom agents can control the dashboard via standard JSON webhooks:

| Endpoint | Method | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `/api/build-control` | `POST` | `{"action": "start", "environment": "crave", "device": "violet"}` | Starts a build (Crave cloud or Self-hosted VM). |
| `/api/build-control` | `POST` | `{"action": "cancel"}` | Cancels the active build and notifies subscribers. |
| `/api/build-event` | `POST` | `{"status": "compiling", "stage": "ninja_compilation", "progress": 65}` | Updates lifecycle state, progress %, and triggers alerts. |
| `/api/build-log` | `POST` | `{"text": "Compiling frameworks/base...", "level": "stdout"}` | Streams real-time terminal output. |
| `/api/status` | `GET` | *(None)* | Returns active build metadata, hardware stats, and push subscriber counts. |
| `/api/notifications/push-subscribe` | `POST` | PushSubscription JSON | Registers browser client for Web Push notifications. |
| `/api/notifications/test-email` | `POST` | `{"email": "user@example.com"}` | Dispatches a diagnostic test email via SMTP. |
| `/api/notifications/test-push` | `POST` | *(None)* | Sends an immediate test Web Push notification. |

---

## 📱 Adding Your Own Device Target (Developer Guide)

To adapt this dashboard and build pipeline for another device (e.g. `marble`, `alioth`, `cheeseburger`):

1. **Create Local Manifest:**
   In your ROM repository (`.repo/local_manifests/<device>.xml`):
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <manifest>
     <remote name="lineage" fetch="https://github.com/LineageOS" revision="lineage-23.0" />
     <remote name="muppets" fetch="https://github.com/TheMuppets" revision="lineage-23.0" />
     <project path="device/oem/codename" name="android_device_oem_codename" remote="lineage" />
     <project path="kernel/oem/codename" name="android_kernel_oem_codename" remote="lineage" />
     <project path="vendor/oem/codename" name="proprietary_vendor_oem_codename" remote="muppets" />
   </manifest>
   ```

2. **Add Product Makefile Overlays:**
   Create `<rom>_<device>.mk` and `AndroidProducts.mk` in your device patch directory.

3. **Select in Dashboard UI:**
   Open the **New Build** modal at [http://localhost:3780](http://localhost:3780), choose **Crave.io Cloud** or **Self-Hosted VM**, specify your codename, and hit **Start Compilation**.

---

## 📄 License

Licensed under the **Apache License 2.0**.  
Copyright © 2026 Duoples.
