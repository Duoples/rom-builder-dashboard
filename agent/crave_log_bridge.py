#!/usr/bin/env python3
"""
DuoplesOS Crave.io Real-Time Log Bridge Daemon
Connects directly to Crave.io's WebSocket stdout stream using subprocess.Popen
and streams compiler diagnostics line-by-line into the DuoplesOS Build Dashboard.
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

def post_event(payload):
    try:
        requests.post(f"{DASHBOARD_URL}/api/build-event", json=payload, timeout=5)
    except Exception as e:
        print("[Event Error]:", e)

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

def stream_logs_for_job(job_id):
    cmd = [CRAVE_BIN, "-n", "-c", CRAVE_CONF, "getlog", "--jobID", job_id]
    print(f"[*] Starting log stream process for Job {job_id}: {' '.join(cmd)}")

    try:
        proc = subprocess.Popen(
            cmd,
            cwd=CRAVE_WORKSPACE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        for raw_line in iter(proc.stdout.readline, ''):
            line = raw_line.strip()
            if not line:
                continue

            # Strip ANSI escape codes
            clean_line = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', line)

            # Detect Ninja progress %
            match = re.search(r'\[\s*(\d+)%\s+(\d+)/(\d+)\]', clean_line)
            if match:
                pct = int(match.group(1))
                overall = 40 + int(pct * 0.55)
                post_event({
                    "status": "compiling",
                    "stage": "ninja_compilation",
                    "progress": overall,
                    "stageProgress": pct,
                    "message": clean_line[:120]
                })

            # Detect stages
            if "repo sync" in clean_line.lower() or "synchronizing" in clean_line.lower():
                post_event({
                    "status": "syncing",
                    "stage": "repo_sync",
                    "progress": 30,
                    "message": clean_line[:120]
                })
            elif "Running product configuration" in clean_line:
                post_event({
                    "status": "configuring",
                    "stage": "envsetup_lunch",
                    "progress": 35,
                    "message": "Product configuration (lunch duoples_violet) in progress..."
                })
            elif "analyzing Android.bp" in clean_line:
                post_event({
                    "status": "compiling",
                    "stage": "soong_analysis",
                    "progress": 38,
                    "message": "Soong graph generation in progress..."
                })

            # Detect failures
            if "failed to build some targets" in clean_line or "soong bootstrap failed" in clean_line or "dumpvars failed" in clean_line:
                post_event({
                    "status": "failed",
                    "stage": "error",
                    "progress": 0,
                    "errorLog": clean_line,
                    "message": "Compilation failed: " + clean_line[:120]
                })
                post_log(clean_line, "error", "error")

            # Detect success
            elif "DuoplesOS Build Completed Successfully" in clean_line or "Package Complete:" in clean_line or "#### build completed successfully" in clean_line:
                post_event({
                    "status": "success",
                    "stage": "completed",
                    "progress": 100,
                    "message": "DuoplesOS 2.0 (Android 17) ROM built successfully on Crave.io!"
                })
                post_log(clean_line, "info", "completed")

            else:
                level = "error" if ("error:" in clean_line or "FAILED:" in clean_line) else "warn" if "warning:" in clean_line else "stdout"
                post_log(clean_line, level, "ninja_compilation")

        proc.stdout.close()
        proc.wait()
    except Exception as e:
        print(f"[-] Log streaming error: {e}")

def main():
    print(f"[*] DuoplesOS Real-Time Crave Bridge Daemon started")
    print(f"[*] Dashboard Target: {DASHBOARD_URL}")

    last_job_id = None

    while True:
        job_id, status = get_active_job()

        if job_id:
            if job_id != last_job_id:
                last_job_id = job_id
                print(f"[*] Discovered new active Crave Job: {job_id} ({status})")
                post_event({
                    "buildId": f"build_violet_{job_id}",
                    "device": "violet",
                    "deviceName": "Xiaomi Redmi Note 7 Pro",
                    "romName": "DuoplesOS 2.0 (Android 17)",
                    "version": "2.0-BP4A-Android17",
                    "branch": "lineage-24.0",
                    "status": "compiling",
                    "stage": "repo_sync",
                    "progress": 25,
                    "cores": 32,
                    "environment": "crave",
                    "craveJobId": job_id,
                    "craveUrl": f"https://foss.crave.io/app/#/build/info/{job_id}?team=14",
                    "message": f"Crave.io Cloud Build #{job_id} active on cluster (LOS 24.0 / Android 17)"
                })

            # Stream logs directly
            stream_logs_for_job(job_id)
        else:
            if last_job_id:
                print(f"[*] Job {last_job_id} has concluded.")
                last_job_id = None

        time.sleep(10)

if __name__ == "__main__":
    main()
