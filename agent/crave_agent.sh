#!/bin/bash
set -e

# ==============================================================================
# DuoplesOS Crave.io Automated Cloud Build Trigger
# Fully compliant with FOSSonTop Crave Documentation & Rules
# ==============================================================================

WORKSPACE="/home/crave_workspace"
CRAVE="/home/crave"
CONFIG="/home/crave.conf"
PROJECT_ID="99" # LOS 23.2 (LineageOS 23 / Android 16)

echo "=================================================="
echo " Launching DuoplesOS Build on Crave.io Cloud Farm"
echo " Target: Redmi Note 7 Pro (duoples_violet)"
echo " Project: LOS 23.2 (Base ID: ${PROJECT_ID})"
echo "=================================================="

# Check Crave CLI
if [ ! -f "$CRAVE" ]; then
    echo "[-] Crave binary not found at $CRAVE" >&2
    exit 1
fi

if [ ! -f "$CONFIG" ]; then
    echo "[-] Crave configuration not found at $CONFIG" >&2
    exit 1
fi

mkdir -p "$WORKSPACE"
cd "$WORKSPACE"

# Ensure crave.yaml exists for workspace persistence
cat << 'EOF' > "$WORKSPACE/crave.yaml"
LOS 23.2:
  ignoreClientHostname: true
EOF

echo "[*] Triggering detached Crave build (Job will run on cloud cluster)..."
$CRAVE -n -c "$CONFIG" run --projectID "$PROJECT_ID" --no-patch --detached -- \
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

echo "[+] Build submitted successfully! Check status with: crave list"
