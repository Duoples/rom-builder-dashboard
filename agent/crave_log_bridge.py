#!/usr/bin/env python3
"""
DuoplesOS Crave.io Cloud Build Bridge Daemon
Polls Crave.io cloud build queue and streams stdout/stderr logs and lifecycle events
into the DuoplesOS Build Dashboard (SSE + Web Push + Email notifications).
"""

import time
import requests
import os
import re
import subprocess
import sys

DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://192.168.2.90:3780")
CRAVE_BIN = os.getenv("CRAVE_BIN", "/home/crave")
CRAVE_CONF = os.getenv("CRAVE_CONF", "/home/crave.conf")
CRAVE_WORKSPACE = os.getenv("CRAVE_WORKSPACE", "/home/crave_workspace")
PROJECT_ID = os.getenv("PROJECT_ID", "99")
TARGET_DEVICE = os.getenv("TARGET_DEVICE", "violet")
TARGET_DEVICE_NAME = os.getenv("TARGET_DEVICE_NAME", "Xiaomi Redmi Note 7 Pro")
ROM_NAME = os.getenv("ROM_NAME", "DuoplesOS 1.0 (Crave.io)")
BRANCH = os.getenv("BRANCH", "lineage-23.0")

def post_event(payload):
    try:
        requests.post(f"{DASHBOARD_URL}/api/build-event", json=payload, timeout=5)
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

def get_active_job():
    try:
        cmd = f"cd {CRAVE_WORKSPACE} && {CRAVE_BIN} -n -c {CRAVE_CONF} list 2>/dev/null"
        output = subprocess.check_output(cmd, shell=True, text=True, timeout=30)
        
        # Look for active job lines
        # Format: Job Id  Project Name    Job Status    Local Workspace        Job Url
        for line in output.splitlines():
            m = re.search(r'^\s*(\d+)\s+([^\s]+(?:\s+[^\s]+)?)\s+([a-zA-Z]+)\s+', line)
            if m:
                jid = m.group(1)
                status = m.group(3).lower()
                if status in ["queued", "running", "active"]:
                    return jid, status
    except Exception:
        pass
    return None, None

def get_job_logs(job_id):
    try:
        cmd = f"cd {CRAVE_WORKSPACE} && {CRAVE_BIN} -n -c {CRAVE_CONF} getlog --jobID {job_id} 2>/dev/null"
        output = subprocess.check_output(cmd, shell=True, text=True, timeout=40)
        return output
    except Exception:
        return ""

def main():
    print(f"[*] Crave.io Cloud Build Bridge Daemon started")
    print(f"[*] Dashboard Target: {DASHBOARD_URL}")
    print(f"[*] Crave Project:    LOS 23.2 (ID {PROJECT_ID})")

    last_logged_lines = 0
    current_job_id = None
    last_status = None

    while True:
        job_id, status = get_active_job()

        if job_id:
            current_job_id = job_id
            if status != last_status:
                last_status = status
                print(f"[*] Detected Crave Job {job_id} status: {status}")
                if status == "queued":
                    post_event({
                        "device": TARGET_DEVICE,
                        "deviceName": TARGET_DEVICE_NAME,
                        "romName": ROM_NAME,
                        "version": "1.0-BP2A.250805.005",
                        "branch": BRANCH,
                        "status": "compiling",
                        "stage": "repo_sync",
                        "progress": 25,
                        "cores": 32,
                        "message": f"Queued on Crave.io high-performance build farm (Job ID: {job_id})"
                    })
                elif status == "running":
                    post_event({
                        "status": "compiling",
                        "stage": "repo_sync",
                        "progress": 30,
                        "message": f"Crave build node allocated and running (Job ID: {job_id})"
                    })

            # Fetch logs
            raw_logs = get_job_logs(job_id)
            if raw_logs:
                lines = raw_logs.splitlines()
                if len(lines) > last_logged_lines:
                    new_lines = lines[last_logged_lines:]
                    for line in new_lines:
                        line_str = line.strip()
                        if not line_str:
                            continue

                        # Detect Ninja progress %
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

                        # Detect failures
                        if "failed to build some targets" in line_str or "dumpvars failed" in line_str:
                            post_event({
                                "status": "failed",
                                "stage": "error",
                                "progress": 0,
                                "errorLog": line_str,
                                "message": "Compilation failed: " + line_str[:120]
                            })
                            post_log(line_str, "error", "error")

                        # Detect success
                        elif "DuoplesOS Build Completed Successfully" in line_str or "Package Complete:" in line_str:
                            post_event({
                                "status": "success",
                                "stage": "completed",
                                "progress": 100,
                                "message": "DuoplesOS 1.0 ROM built successfully on Crave.io!"
                            })
                            post_log(line_str, "info", "completed")

                        else:
                            level = "error" if ("error:" in line_str or "FAILED:" in line_str) else "warn" if "warning:" in line_str else "stdout"
                            post_log(line_str, level, "ninja_compilation")

                    last_logged_lines = len(lines)
        else:
            if current_job_id:
                print(f"[*] Job {current_job_id} concluded.")
                current_job_id = None
                last_logged_lines = 0
                last_status = None

        time.sleep(10)

if __name__ == "__main__":
    main()
