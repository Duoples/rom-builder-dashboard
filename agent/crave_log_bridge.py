#!/usr/bin/env python3
"""
DuoplesOS Crave.io Real-Time Log Bridge & Stage Engine Daemon v3.0
Monitors Crave cloud builds, dynamically detects device target,
streams stdout logs in batches, tracks stage progression, and synchronizes
the Next.js Build Dashboard in real-time without manual intervention.
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
        r = requests.post(f"{DASHBOARD_URL}/api/build-event", json=payload, timeout=6)
        print(f"[Bridge Event] {payload.get('status')} / {payload.get('stage')} (Progress: {payload.get('progress')}%) -> {r.status_code}")
    except Exception as e:
        print("[Bridge Event Error]:", e)

def post_log_batch(lines, level="stdout", stage="ninja_compilation"):
    if not lines:
        return
    try:
        text_chunk = "\n".join(lines)
        requests.post(
            f"{DASHBOARD_URL}/api/build-log",
            json={"text": text_chunk, "level": level, "stage": stage},
            timeout=6
        )
    except Exception as e:
        print("[Bridge Log Error]:", e)

def parse_crave_list():
    """
    Parses 'crave list' output robustly.
    Returns:
      active_job: (id, project_name, status) or None
      latest_history_job: (id, status) or None
    """
    try:
        cmd = [CRAVE_BIN, "-n", "-c", CRAVE_CONF, "list"]
        res = subprocess.run(cmd, cwd=CRAVE_WORKSPACE, capture_output=True, text=True, timeout=25)
        output = res.stdout

        active_job = None
        history_job = None

        in_active = False
        in_history = False

        for line in output.splitlines():
            line_s = line.strip()
            if "Your active jobs:" in line:
                in_active = True
                in_history = False
                continue
            elif "Job History:" in line:
                in_active = False
                in_history = True
                continue

            if in_active and not active_job:
                # Format: 302915  LOS 23.2  queued  /home/crave_workspace  https://...
                m = re.search(r'^\s*(\d{5,8})\s+([A-Za-z0-9_.\s]+?)\s+(queued|running|stopped|failed|successful)', line, re.IGNORECASE)
                if m:
                    jid = m.group(1)
                    proj = m.group(2).strip()
                    st = m.group(3).lower()
                    active_job = (jid, proj, st)

            elif in_history and not history_job:
                # Format: 302826  /home/crave_workspace  /bin/bash -c ... FAILED
                m = re.search(r'^\s*(\d{5,8})\s+(.*?)\s+(FAILED|SUCCESSFUL|CANCELLED|STOPPED)\s*$', line, re.IGNORECASE)
                if m:
                    jid = m.group(1)
                    st = m.group(3).upper()
                    history_job = (jid, st)

        return active_job, history_job
    except Exception as e:
        print("[parse_crave_list error]:", e)
        return None, None

def get_job_full_log(job_id):
    try:
        cmd = [CRAVE_BIN, "-n", "-c", CRAVE_CONF, "getlog", "--jobID", str(job_id)]
        res = subprocess.run(cmd, cwd=CRAVE_WORKSPACE, capture_output=True, text=True, timeout=35)
        return res.stdout
    except Exception as e:
        print(f"[get_job_full_log error for {job_id}]:", e)
        return ""

def detect_device_info(raw_text):
    """
    Dynamically identifies if target is lavender or violet from build logs.
    """
    lower = raw_text.lower()
    if "lavender" in lower:
        return "lavender", "Xiaomi Redmi Note 7", "DuoplesOS 2.0 (Android 17)", "2.0-BP4A-Android17"
    elif "violet" in lower:
        return "violet", "Xiaomi Redmi Note 7 Pro", "DuoplesOS 2.0 (Android 17)", "2.0-BP4A-Android17"
    return "lavender", "Xiaomi Redmi Note 7", "DuoplesOS 2.0 (Android 17)", "2.0-BP4A-Android17"

def main():
    print("=" * 60)
    print(" DuoplesOS Crave Log Bridge Daemon v3.0 (Automated)")
    print(f" Target Dashboard: {DASHBOARD_URL}")
    print(f" Workspace: {CRAVE_WORKSPACE}")
    print("=" * 60)

    last_tracked_job = None
    last_line_count = 0
    last_status = None

    while True:
        try:
            active_job, history_job = parse_crave_list()
            
            job_id = None
            status = None
            is_active = False

            if active_job:
                job_id = active_job[0]
                status = active_job[2] # queued or running
                is_active = True
            elif history_job:
                job_id = history_job[0]
                status = history_job[1] # FAILED or SUCCESSFUL
                is_active = False

            if job_id:
                # Fetch latest logs from Crave
                raw_logs = get_job_full_log(job_id)
                clean_logs = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', raw_logs)
                all_lines = clean_logs.splitlines()

                device, deviceName, romName, version = detect_device_info(clean_logs)

                # New job detected
                if job_id != last_tracked_job:
                    print(f"[*] Switching to Crave Job: {job_id} (Status: {status}, Target: {device})")
                    last_tracked_job = job_id
                    last_line_count = 0
                    last_status = status

                    init_stage = "repo_sync"
                    init_progress = 25
                    if status == "queued":
                        init_progress = 20
                        msg = f"Crave Cloud Job #{job_id} queued on build cluster"
                    elif status == "running":
                        init_progress = 30
                        msg = f"Crave Cloud Job #{job_id} running compilation"
                    elif status == "FAILED":
                        init_stage = "error"
                        init_progress = 0
                        msg = f"Crave Cloud Job #{job_id} failed"
                    else:
                        init_stage = "completed"
                        init_progress = 100
                        msg = f"Crave Cloud Job #{job_id} completed successfully"

                    post_event({
                        "buildId": f"build_{device}_{job_id}",
                        "systemType": "android_rom",
                        "device": device,
                        "deviceName": deviceName,
                        "romName": romName,
                        "version": version,
                        "branch": "lineage-23.2",
                        "status": "compiling" if is_active else ("success" if status == "SUCCESSFUL" else "failed"),
                        "stage": init_stage,
                        "progress": init_progress,
                        "cores": 32,
                        "environment": "crave",
                        "craveJobId": str(job_id),
                        "craveUrl": f"https://foss.crave.io/app/#/build/info/{job_id}?team=14",
                        "message": msg
                    })

                # Stream new log lines
                if len(all_lines) > last_line_count:
                    new_lines = all_lines[last_line_count:]
                    last_line_count = len(all_lines)

                    current_stage = "ninja_compilation"
                    for line in new_lines:
                        line_s = line.strip()
                        if not line_s:
                            continue

                        # Detect Ninja %
                        match = re.search(r'\[\s*(\d+)%\s+(\d+)/(\d+)\]', line_s)
                        if match:
                            pct = int(match.group(1))
                            overall = min(98, 40 + int(pct * 0.55))
                            current_stage = "ninja_compilation"
                            post_event({
                                "status": "compiling",
                                "stage": "ninja_compilation",
                                "progress": overall,
                                "stageProgress": pct,
                                "message": line_s[:120]
                            })
                        elif "Running product configuration" in line_s or "lunch" in line_s:
                            current_stage = "envsetup_lunch"
                            post_event({
                                "status": "configuring",
                                "stage": "envsetup_lunch",
                                "progress": 35,
                                "message": line_s[:120]
                            })
                        elif "analyzing Android.bp" in line_s or "bootstrap blueprint" in line_s:
                            current_stage = "soong_analysis"
                            post_event({
                                "status": "compiling",
                                "stage": "soong_analysis",
                                "progress": 38,
                                "message": line_s[:120]
                            })
                        elif "Starting Ninja Compilation" in line_s:
                            current_stage = "ninja_compilation"
                            post_event({
                                "status": "compiling",
                                "stage": "ninja_compilation",
                                "progress": 40,
                                "message": "Ninja compilation started"
                            })

                    # Prevent flooding dashboard if thousands of lines backlog exist
                    if len(new_lines) > 500:
                        lines_to_send = new_lines[-200:]
                    else:
                        lines_to_send = new_lines

                    # Send lines in batches of 50
                    batch_size = 50
                    for i in range(0, len(lines_to_send), batch_size):
                        chunk = lines_to_send[i:i + batch_size]
                        post_log_batch(chunk, "stdout", current_stage)

                # Track failure transition
                if status == "FAILED" and last_status != "FAILED":
                    last_status = "FAILED"
                    error_msg = "Crave compilation halted with errors."
                    if all_lines:
                        for l in reversed(all_lines):
                            if "error:" in l.lower() or "failed:" in l.lower():
                                error_msg = l.strip()
                                break
                    post_event({
                        "status": "failed",
                        "stage": "error",
                        "progress": 0,
                        "errorLog": error_msg,
                        "message": f"Compilation failed: {error_msg[:120]}"
                    })

                elif status in ["SUCCESSFUL", "SUCCESS"] and last_status not in ["SUCCESSFUL", "SUCCESS"]:
                    last_status = "SUCCESSFUL"
                    post_event({
                        "status": "success",
                        "stage": "completed",
                        "progress": 100,
                        "message": f"DuoplesOS ROM Build #{job_id} Completed Successfully!"
                    })

        except Exception as err:
            print("[Daemon Loop Error]:", err)

        time.sleep(5)

if __name__ == "__main__":
    main()
