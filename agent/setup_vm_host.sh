#!/bin/bash
# ==============================================================================
# Automated Host & VM Environment Setup for Android / Custom ROM Compilation
# Supports Apple Silicon (M1/M2/M3/M4 UTM/QEMU) & standard x86_64 Ubuntu Servers
# ==============================================================================

set -e

echo "=========================================================="
echo " DuoplesOS ROM Build Environment Automated Setup"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "[!] Please run as root (e.g. sudo ./setup_vm_host.sh)"
  exit 1
fi

ARCH=$(uname -m)
echo "[*] Detected Host Architecture: ${ARCH}"

# 1. System packages & toolchains
echo "[*] Installing essential Android build dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y \
    build-essential \
    ccache \
    git \
    git-lfs \
    curl \
    wget \
    rsync \
    zip \
    unzip \
    bc \
    bison \
    flex \
    libncurses-dev \
    libssl-dev \
    libelf-dev \
    python3 \
    python3-pip \
    python3-requests \
    openjdk-21-jdk \
    tmux \
    screen \
    htop \
    iotop

# 2. Multiarch & Rosetta 2 setup for ARM64 (Apple Silicon VMs)
if [ "${ARCH}" = "aarch64" ] || [ "${ARCH}" = "arm64" ]; then
    echo "[*] Configuring ARM64 Multiarch & Prebuilt execution..."
    
    # Mount Rosetta 2 if shared via VirtIO-FS (UTM on macOS)
    if [ -d "/media/rosetta" ] || grep -q "rosetta" /proc/filesystems 2>/dev/null; then
        mkdir -p /media/rosetta
        mount -t virtiofs rosetta /media/rosetta 2>/dev/null || true
        if [ -f "/media/rosetta/rosetta" ]; then
            echo "[*] Registering Apple Rosetta 2 for Linux in binfmt_misc..."
            /usr/sbin/update-binfmts --install rosetta /media/rosetta/rosetta \
                --magic '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x3e\x00' \
                --mask '\xff\xff\xff\xff\xff\xfe\xfe\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff' \
                --credentials yes --preserve yes --fix-binary yes 2>/dev/null || true
            
            grep -q "rosetta" /etc/fstab || echo "rosetta /media/rosetta virtiofs ro,nofail 0 0" >> /etc/fstab
        fi
    fi

    # Install x86_64 dynamic libraries so host prebuilts (nsjail, clang, ckati) run natively
    dpkg --add-architecture amd64 || true
    apt-get update -y || true
    apt-get install -y \
        libc6:amd64 \
        libstdc++6:amd64 \
        zlib1g:amd64 \
        libncurses6:amd64 \
        libtinfo6:amd64 \
        qemu-user-binfmt \
        binfmt-support || true

    # Link dynamic libraries
    mkdir -p /lib64 /usr/lib64 /lib/x86_64-linux-gnu /usr/lib/x86_64-linux-gnu
    cp -s /usr/x86_64-linux-gnu/lib/* /lib64/ 2>/dev/null || true
    cp -s /usr/x86_64-linux-gnu/lib/* /usr/lib64/ 2>/dev/null || true
    cp -s /usr/x86_64-linux-gnu/lib/* /lib/x86_64-linux-gnu/ 2>/dev/null || true
    cp -s /usr/x86_64-linux-gnu/lib/* /usr/lib/x86_64-linux-gnu/ 2>/dev/null || true
fi

# 3. Setup Persistent 64 GB Swapfile
if [ ! -f "/swapfile" ]; then
    echo "[*] Creating 64 GB Persistent Swapfile..."
    fallocate -l 64G /swapfile || dd if=/dev/zero of=/swapfile bs=1G count=64
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q "/swapfile" /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
    echo "[*] Swapfile created and enabled successfully!"
else
    echo "[*] Swapfile already exists ($(free -h | grep -i swap | awk '{print $2}'))."
fi

# 4. Configure Ccache (50 GB Limit)
echo "[*] Configuring Ccache (50 GB)..."
export USE_CCACHE=1
export CCACHE_EXEC=/usr/bin/ccache
ccache -M 50G

# 5. Disable needrestart interactive blocking prompts
mkdir -p /etc/needrestart/conf.d
echo '$nrconf{restart} = "a";' > /etc/needrestart/conf.d/autorestart.conf
echo '$nrconf{kernelhints} = 0;' >> /etc/needrestart/conf.d/autorestart.conf
rm -f /etc/dpkg/dpkg.cfg.d/needrestart 2>/dev/null || true

echo "=========================================================="
echo " Setup Completed Successfully! Ready for ROM Compilation."
echo "=========================================================="
