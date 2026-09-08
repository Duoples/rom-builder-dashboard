#!/usr/bin/env python3
"""
DuoplesOS CI/CD Build Agent Bridge Daemon
Monitors local ROM build logs, detects stages & errors, and streams output
to the DuoplesOS Build Dashboard via HTTP webhooks.
"""

import time
import requests
import os
import re
import subprocess
import sys

DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://192.168.2.90:3780")
LOG_FILE = os.getenv("LOG_FILE", "/home/duoplesos_build/build.log")
TARGET_DEVICE = os.getenv("TARGET_DEVICE", "violet")
TARGET_DEVICE_NAME = os.getenv("TARGET_DEVICE_NAME", "Xiaomi Redmi Note 7 Pro")
ROM_NAME = os.getenv("ROM_NAME", "DuoplesOS 1.0")
BRANCH = os.getenv("BRANCH", "lineage-23.0")
CORES = int(os.getenv("CORES", "6"))

def post_event(payload):
    try:
        requests.post(f"{DASHBOARD_URL}/api/build-event", json=payload, timeout=4)
    except Exception as e:
        pass

def post_log(text, level="stdout", stage="ninja_compilation"):
    try:
        requests.post(
            f"{DASHBOARD_URL}/api/build-log",
            json={"text": text, "level": level, "stage": stage},
            timeout=3
        )
    except Exception:
        pass

def main():
    print(f"[*] DuoplesOS Build Agent Bridge started")
    print(f"[*] Dashboard Target: {DASHBOARD_URL}")
    print(f"[*] Monitoring Log:   {LOG_FILE}")

    last_pos = 0
    last_stage = ""

    # Initial ping
    post_event({
        "device": TARGET_DEVICE,
        "deviceName": TARGET_DEVICE_NAME,
        "romName": ROM_NAME,
        "branch": BRANCH,
        "status": "compiling",
        "stage": "soong_analysis",
        "progress": 38,
        "cores": CORES,
        "message": f"Starting build monitoring for {TARGET_DEVICE_NAME} ({BRANCH})"
    })

    while True:
        # 1. Read new lines from build.log
        if os.path.exists(LOG_FILE):
            current_size = os.path.getsize(LOG_FILE)
            if current_size < last_pos:
                last_pos = 0

            if current_size > last_pos:
                with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
                    f.seek(last_pos)
                    for line in f:
                        line_str = line.strip()
                        if line_str:
                            # Detect Ninja Progress e.g. [ 45% 12000/28000]
                            match = re.search(r'\[\s*(\d+)%\s+(\d+)/(\d+)\]', line_str)
                            if match:
                                pct = int(match.group(1))
                                overall = 40 + int(pct * 0.55)
                                post_event({
                                    "status": "compiling",
                                    "stage": "ninja_compilation",
                                    "progress": overall,
                                    "stageProgress": pct,
                                    "message": line_str[:120]
                                })

                            # Detect Failure & dispatch alerts
                            if "failed to build some targets" in line_str or "soong bootstrap failed" in line_str:
                                post_event({
                                    "status": "failed",
                                    "stage": "error",
                                    "progress": 0,
                                    "errorLog": line_str,
                                    "message": "Compilation failed: " + line_str
                                })
                                post_log(line_str, "error")

                            # Detect Success & dispatch alerts
                            elif "DuoplesOS Build Completed Successfully" in line_str:
                                post_event({
                                    "status": "success",
                                    "stage": "completed",
                                    "progress": 100,
                                    "message": f"{ROM_NAME} ROM built successfully!"
                                })
                                post_log(line_str, "info")

                            else:
                                level = "error" if ("FAILED:" in line_str or "error:" in line_str) else "warn" if "warning:" in line_str else "stdout"
                                post_log(line_str, level)

                    last_pos = f.tell()

        # 2. Monitor active compiler processes
        try:
            ps_out = subprocess.getoutput("ps -ef | grep -E 'soong_build|ninja|mka|clang' | grep -v grep")
            if "soong_build" in ps_out and last_stage != "soong_analysis":
                last_stage = "soong_analysis"
                post_event({
                    "status": "compiling",
                    "stage": "soong_analysis",
                    "progress": 38,
                    "message": "Soong graph generation in progress..."
                })
            elif "ninja" in ps_out and "soong_build" not in ps_out and last_stage != "ninja_compilation":
                last_stage = "ninja_compilation"
                post_event({
                    "status": "compiling",
                    "stage": "ninja_compilation",
                    "progress": 45,
                    "message": "Ninja C++/Java compilation in progress..."
                })
        except Exception:
            pass

        time.sleep(1.5)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[!] Bridge stopped by user.")
        sys.exit(0)
