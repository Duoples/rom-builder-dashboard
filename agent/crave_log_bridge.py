#!/usr/bin/env python3
"""
DuoplesOS Crave.io High-Performance Log Bridge Daemon
Polls Crave.io API, streams logs in efficient batches to the Next.js Dashboard,
and captures stage transitions, live progress %, and build failure diagnostics.
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
        r = requests.post(f"{DASHBOARD_URL}/api/build-event", json=payload, timeout=5)
        print(f"[Bridge] Event posted: {payload.get('status')} / {payload.get('stage')} -> {r.status_code}")
    except Exception as e:
        print("[Bridge Event Error]:", e)

def post_log_batch(lines, level="stdout", stage="ninja_compilation"):
    if not lines:
        return
    try:
        # Join lines or send as batch
        text_chunk = "\n".join(lines)
        requests.post(
            f"{DASHBOARD_URL}/api/build-log",
            json={"text": text_chunk, "level": level, "stage": stage},
            timeout=5
        )
    except Exception as e:
        print("[Bridge Log Error]:", e)

def parse_crave_list():
    """
    Returns:
      active_job: (id, status) or None
      latest_history_job: (id, status) or None
    """
    try:
        cmd = f"cd {CRAVE_WORKSPACE} && {CRAVE_BIN} -n -c {CRAVE_CONF} list 2>/dev/null"
        output = subprocess.check_output(cmd, shell=True, text=True, timeout=30)
        
        active_job = None
        history_job = None

        in_active = False
        in_history = False

        for line in output.splitlines():
            if "Your active jobs:" in line:
                in_active = True
                in_history = False
                continue
            elif "Job History:" in line:
                in_active = False
                in_history = True
                continue

            # Check rows with IDs
            m = re.search(r'^\s*(\d+)\s+([^\s]+(?:\s+[^\s]+)?)\s+([a-zA-Z]+)', line)
            if m:
                jid = m.group(1)
                st = m.group(3).upper()
                if in_active and not active_job:
                    active_job = (jid, st.lower())
                elif in_history and not history_job:
                    history_job = (jid, st.upper())

        return active_job, history_job
    except Exception as e:
        print("[parse_crave_list error]:", e)
        return None, None

def get_job_full_log(job_id):
    try:
        cmd = [CRAVE_BIN, "-n", "-c", CRAVE_CONF, "getlog", "--jobID", str(job_id)]
        output = subprocess.check_output(cmd, cwd=CRAVE_WORKSPACE, stderr=subprocess.STDOUT, text=True, timeout=35)
        return output
    except Exception:
        return ""

def main():
    print("[*] DuoplesOS Crave Log Bridge Daemon v2.0 running...")
    print(f"[*] Dashboard Target: {DASHBOARD_URL}")

    last_tracked_job = None
    last_line_count = 0
    last_status = None

    while True:
        try:
            active_job, history_job = parse_crave_list()
            target_job = active_job if active_job else history_job

            if target_job:
                job_id, status = target_job

                # New job detected
                if job_id != last_tracked_job:
                    print(f"[*] Now tracking Crave Job: {job_id} (Status: {status})")
                    last_tracked_job = job_id
                    last_line_count = 0
                    last_status = status

                    post_event({
                        "buildId": f"build_violet_{job_id}",
                        "device": "violet",
                        "deviceName": "Xiaomi Redmi Note 7 Pro",
                        "romName": "DuoplesOS 2.0 (Android 16/17)",
                        "version": "2.0-BP4A",
                        "branch": "lineage-23.2",
                        "status": "compiling" if status in ["running", "queued"] else "failed" if status == "FAILED" else "success",
                        "stage": "repo_sync",
                        "progress": 25,
                        "cores": 32,
                        "environment": "crave",
                        "craveJobId": str(job_id),
                        "craveUrl": f"https://foss.crave.io/app/#/build/info/{job_id}?team=14",
                        "message": f"Crave Cloud Job #{job_id} is {status.upper()}"
                    })

                # Fetch and sync logs
                raw_logs = get_job_full_log(job_id)
                if raw_logs:
                    clean_text = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', raw_logs)
                    all_lines = clean_text.splitlines()

                    if len(all_lines) > last_line_count:
                        new_lines = all_lines[last_line_count:]
                        last_line_count = len(all_lines)

                        # Parse progress and stage from new lines
                        current_stage = "ninja_compilation"
                        for line in new_lines:
                            line_s = line.strip()
                            if not line_s:
                                continue

                            # Detect Ninja %
                            match = re.search(r'\[\s*(\d+)%\s+(\d+)/(\d+)\]', line_s)
                            if match:
                                pct = int(match.group(1))
                                overall = 40 + int(pct * 0.55)
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

                        # Send new lines in batches of 50
                        batch_size = 50
                        for i in range(0, len(new_lines), batch_size):
                            chunk = new_lines[i:i + batch_size]
                            post_log_batch(chunk, "stdout", current_stage)

                # Check if job transitioned to failure
                if status == "FAILED" and last_status != "FAILED":
                    last_status = "FAILED"
                    # Find error message from tail of logs
                    error_msg = "Crave compilation halted with errors."
                    if raw_logs:
                        for l in reversed(raw_logs.splitlines()):
                            if "error:" in l or "FAILED:" in l or "Build Failed:" in l:
                                error_msg = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', l).strip()
                                break

                    post_event({
                        "status": "failed",
                        "stage": "error",
                        "progress": 0,
                        "errorLog": error_msg,
                        "message": f"Compilation failed on Crave.io: {error_msg[:120]}"
                    })

                elif status in ["SUCCESS", "COMPLETE"] and last_status not in ["SUCCESS", "COMPLETE"]:
                    last_status = "SUCCESS"
                    post_event({
                        "status": "success",
                        "stage": "completed",
                        "progress": 100,
                        "message": f"DuoplesOS ROM Build #{job_id} Completed Successfully!"
                    })

        except Exception as err:
            print("[Daemon Loop Error]:", err)

        time.sleep(8)

if __name__ == "__main__":
    main()
