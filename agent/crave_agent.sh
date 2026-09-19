#!/bin/bash
set -e

# ==============================================================================
# DuoplesOS Crave.io Full Compilation Trigger (Redmi Note 7 - lavender)
# Uses /bin/bash execution to ensure envsetup.sh and m bacon run to completion
# ==============================================================================

WORKSPACE="/home/crave_workspace"
CRAVE="/home/crave"
CONFIG="/home/crave.conf"
PROJECT_ID="99" # LOS 23.2 (LineageOS 23.2 / Android 16/17 Base)

echo "=================================================="
echo " Launching DuoplesOS 2.0 (Android 17) Full Build"
echo " Target: Redmi Note 7 (duoples_lavender)"
echo " Base Project: LOS 23.2 (ID: ${PROJECT_ID})"
echo "=================================================="

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

cat << 'CRAVE_YAML' > "$WORKSPACE/crave.yaml"
LOS 23.2:
  ignoreClientHostname: true
CRAVE_YAML

echo "[*] Triggering full compilation job on Crave cloud farm..."
$CRAVE -n -c "$CONFIG" run --projectID "$PROJECT_ID" --no-patch --detached -- \
"/bin/bash -c '
set -e
rm -rf .repo/local_manifests /tmp/custom packages/apps/PersonalContext prebuilts/module_sdk/WebApp packages/modules/WebApp system/fs/fs_mgr system/lfi prebuilts/rust-toolchain
mkdir -p .repo/local_manifests /tmp/custom
curl -sL -A \"Mozilla/5.0\" https://github.com/Duoples/duoplesos-rom/archive/refs/heads/master.tar.gz -o /tmp/rom.tar.gz && tar -xzf /tmp/rom.tar.gz -C /tmp/custom --strip-components=1
cp /tmp/custom/manifests/duoplesos_lavender.xml .repo/local_manifests/
/opt/crave/resync.sh
rm -rf packages/apps/PersonalContext prebuilts/module_sdk/WebApp packages/modules/WebApp system/fs/fs_mgr system/lfi prebuilts/rust-toolchain
mkdir -p vendor/duoples device/xiaomi/lavender
cp -r /tmp/custom/vendor/duoples/* vendor/duoples/ 2>/dev/null || true
cp -r /tmp/custom/device_lavender_patches/* device/xiaomi/lavender/ 2>/dev/null || true
source build/envsetup.sh
lunch duoples_lavender-bp4a-userdebug || lunch duoples_lavender-trunk_staging-userdebug || lunch lineage_lavender-userdebug
echo \"[*] Starting Ninja Compilation: m bacon...\"
m bacon
echo \"[*] Build finished! Checking output files:\"
ls -lh out/target/product/lavender/*.zip out/target/product/lavender/*.img 2>/dev/null || true
'"

echo "[+] Build submitted successfully! Check status with: crave list"
