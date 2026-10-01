# 🐧 Duoples Linux

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Kernel: Linux 6.6 LTS](https://img.shields.io/badge/Kernel-Linux_6.6_LTS-green)](https://kernel.org)
[![Architecture: ARM64 / x86_64](https://img.shields.io/badge/Arch-ARM64%20%7C%20x86__64-cyan)](#)
[![Release: v1.1.0](https://img.shields.io/badge/Release-v1.1.0-emerald)](https://github.com/Duoples/duoples-linux/releases/tag/v1.1.0)

**Duoples Linux** is an ultra-minimal, high-performance, and standalone Linux distribution built from pure source with complete Debian & Ubuntu package compatibility, native pre-installed Duoples Appstore client, and an interactive desktop/gaming installer.

Engineered with a **Dual-Profile Architecture**:
* **☁️ Cloud Server Profile:** Sub-90MB idle footprint, instant boot (<0.5s), VirtIO line-rate throughput, and complete APT ecosystem (`apt install docker.io nginx postgresql`).
* **🎮 Gaming Desktop Profile:** Built on Linux 6.6 LTS with `PREEMPT_DYNAMIC` low-latency scheduling, Vulkan 1.3, Mesa 3D, Feral GameMode, PipeWire pro-audio, and one-click desktop installers for **KDE Plasma 6**, **GNOME 46**, **Cinnamon**, **XFCE**, and **LXQt**.

---

## 📦 Official Downloadable Release Artifacts (v1.1.0)

Download ready-to-run images directly from **[GitHub Releases v1.1.0](https://github.com/Duoples/duoples-linux/releases/tag/v1.1.0)**:

| Artifact | Arch | Format | Target Platform |
| :--- | :--- | :--- | :--- |
| **`duoples-linux-1.1-arm64.iso`** | `arm64` | Bootable Live ISO (212 MB) | Apple Silicon (UTM), Raspberry Pi 4/5, ARM64 Hypervisors |
| **`duoples-linux-1.1-amd64.iso`** | `x86_64` | Bootable Live ISO (16 MB) | Bare-metal Intel/AMD PCs, VirtualBox, VMware, Proxmox |
| **`duoples-linux-rootfs-arm64.tar.gz`** | `arm64` | Rootfs Tarball (216 MB) | Docker, Podman, LXD, LXC, WSL2, Proxmox Templates |
| **`bzImage-x86_64`** | `x86_64` | Linux 6.6 Kernel (13 MB) | Direct Kernel Boot, QEMU, MicroVMs, Firecracker |
| **`Image.gz`** | `arm64` | Linux 6.6 Kernel (12 MB) | Direct Kernel Boot for ARM64 |
| **`rootfs-amd64.cpio.gz`** | `x86_64` | RAM Initramfs (1.3 MB) | Ultra-fast volatile RAM rootfs (boots in 0.3s) |
| **`rootfs.cpio.gz`** | `arm64` | RAM Initramfs (1.2 MB) | Ultra-fast volatile RAM rootfs for ARM64 |

---

## 🚀 Installation & Deployment Everywhere

### 1. Docker & Podman (1-Command Import)
Import the root filesystem directly into your Docker daemon:
```bash
# Download rootfs and import as a Docker image
curl -L -O https://github.com/Duoples/duoples-linux/releases/download/v1.1.0/duoples-linux-rootfs-arm64.tar.gz
cat duoples-linux-rootfs-arm64.tar.gz | docker import - duoples-linux:1.1

# Run an interactive container
docker run -it --name duoples duoples-linux:1.1 /bin/bash
```

### 2. Proxmox VE (LXC Container or KVM Virtual Machine)
* **As a KVM Virtual Machine:**
  1. Upload `duoples-linux-1.1-amd64.iso` (or `arm64.iso`) to Proxmox ISO storage (`local:iso`).
  2. Create a new VM (`Linux 6.x/2.6 Kernel`), attach VirtIO SCSI and VirtIO Network.
  3. Select the Duoples ISO as the CD-ROM drive and start the VM.
* **As an LXC Container:**
  1. Download `duoples-linux-rootfs-arm64.tar.gz` into `/var/lib/vz/template/cache/`.
  2. In Proxmox, click **Create CT** ➔ Select `duoples-linux-rootfs-arm64.tar.gz` as Template ➔ Finish.

### 3. LXD / LXC
```bash
lxc image import duoples-linux-rootfs-arm64.tar.gz --alias duoples-linux
lxc launch duoples-linux my-duoples-instance
lxc exec my-duoples-instance -- /bin/bash
```

### 4. Apple Silicon Mac via UTM
1. Open **UTM** ➔ Click **Create a New Virtual Machine** ➔ **Virtualize** ➔ **Linux**.
2. Select **`duoples-linux-1.1-arm64.iso`** as the boot image.
3. Allocate 2–4 GB RAM and 4 vCPUs ➔ Click **Start**.
4. The system boots into the interactive shell in seconds. Run `sudo duoples-installer` to configure a graphical desktop.

### 5. Oracle VirtualBox & VMware (Workstation / Fusion / ESXi)
1. Create a **New Virtual Machine** (Type: `Linux`, Version: `Debian (64-bit)` or `Ubuntu (64-bit)`).
2. Mount **`duoples-linux-1.1-amd64.iso`** in the virtual optical drive.
3. Boot the VM. The hybrid bootloader supports both legacy BIOS and modern UEFI.

### 6. Bare-Metal PC / Laptop (Flashing to USB Drive)
Flash the ISO to any USB flash drive using BalenaEtcher, Rufus, or `dd`:
```bash
# On Linux / macOS (replace /dev/sdX with your USB drive):
sudo dd if=duoples-linux-1.1-amd64.iso of=/dev/sdX bs=4M status=progress conv=fdatasync
```
Insert the USB drive into your PC, boot into BIOS/Boot Menu (F12 / Del / F8), and select the USB drive.

---

## 🛠️ Modular System & Desktop Installer (`duoples-installer`)

Once booted, launch the built-in curses checklist installer:
```bash
sudo duoples-installer
```
* **Desktop Environments:** Choose **KDE Plasma 6**, **GNOME 46**, **Cinnamon**, **XFCE 4.18**, **LXQt**, or **Headless Console**.
* **Gaming & Graphics:** Check **Gaming Stack (Steam, Proton/Wine, GameMode)**, **Mesa 3D & Vulkan 1.3**, and **NVIDIA DKMS Drivers**.
* **Services:** Check **OpenSSH Server**, **PipeWire Audio**, **Developer Toolchain**, and **Duoples Appstore**.

---

## 📄 License
Copyright © 2026 Duoples. Licensed under the **Apache License 2.0**.
