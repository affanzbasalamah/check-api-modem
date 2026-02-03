#!/usr/bin/env python3
import sys
import os

# OPTIMIZATION: Check for help/empty args BEFORE importing heavy libraries
if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] in ['help', '-h', '--help']:
        print("""
HKM0130 Modem Monitor Daemon
============================

Usage:
  ./modem_monitor start   : Start the background monitoring daemon.
  ./modem_monitor stop    : Stop the running daemon.
  ./modem_monitor help    : Show this help message.

Behavior:
  - Checks internet connectivity and Operator Name ("Telkomsel") every 6 hours.
  - Logs activity to /tmp/modem_monitor.log
  - Exits immediately if any check fails.
""")
        sys.exit(0)

# Heavy imports deferred until after help check
import time
import signal
import logging
import argparse
import requests
import urllib3
import ssl
import json
import hmac
import hashlib
import base64
import subprocess
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context
from urllib3.util.retry import Retry

# Config
PID_FILE = "/tmp/modem_monitor.pid"
LOG_FILE = "/tmp/modem_monitor.log"
CHECK_INTERVAL = 6 * 3600  # 6 hours

# Setup Logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Suppress InsecureRequestWarning
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class LegacySSLAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        context = create_urllib3_context()
        context.set_ciphers('ALL:@SECLEVEL=0')
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        context.options |= 0x4 # OP_LEGACY_SERVER_CONNECT
        self.poolmanager = urllib3.poolmanager.PoolManager(
            num_pools=connections,
            maxsize=maxsize,
            block=block,
            ssl_context=context
        )

# Embedding HKMModemClient here to ensure it uses 'logging' not 'print' and avoids import issues
class HKMModemClient:
    def __init__(self, host="192.168.8.1", password="admin", username="admin"):
        self.base_url = f"https://{host}"
        self.username = username
        self.password = password
        self.session = requests.Session()
        
        # Reduced retries to avoid long hangs when unreachable
        retries = Retry(total=1, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        self.session.mount('https://', LegacySSLAdapter(max_retries=retries))
        
        self.encrypt_enabled = False
        self.pri_key = None
        self.timestamp = None
        self.timestamp_start = 0

    def _hex_hmac_md5(self, key, data):
        return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.md5).hexdigest()

    def _update_keys(self):
        try:
            # 5s timeout
            r = self.session.post(f"{self.base_url}/goform/sync", verify=False, headers={"Content-Type": "application/x-mgdata"}, timeout=5)
            val = r.headers.get("X-MG-Private")
            if val:
                self.pri_key = val.split("x")[0]
                self.timestamp = val.split("x")[1]
                self.timestamp_start = int(time.time())
                return True
        except Exception as e:
            logging.error(f"Error syncing keys: {e}")
        return False

    def login(self):
        # 1. Check Encryption (optional)
        try:
            # Fast timeout for initial check
            r = self.session.get(f"{self.base_url}/config/global/config.xml", verify=False, timeout=3)
            if '<encrypt>1</encrypt>' in r.text:
                self.encrypt_enabled = True
        except:
            pass

        # 2. Sync Keys
        if not self._update_keys():
            logging.error("Failed to sync keys")
            return False

        # 3. Hash Credentials
        key_hmac = "0123456789"
        user_hashed = self._hex_hmac_md5(key_hmac, self.username)
        pass_hashed = self._hex_hmac_md5(key_hmac, self.password)
        
        payload = {
            "username": user_hashed,
            "password": pass_hashed
        }
        
        headers = {"Content-Type": "application/json"}
        try:
            r = self.session.post(f"{self.base_url}/goform/login", json=payload, headers=headers, verify=False, timeout=5)
            if r.status_code == 200 and '"retcode":0' in r.text:
                return True
        except Exception as e:
            logging.error(f"Login request failed: {e}")
            
        return False

    def get_status(self):
        keys = [
            "mnet_sim_status", "mnet_sig_level", "device_battery_level", 
            "mnet_imsi", "mnet_sysmode", "mnet_operator_name",
            "sms_unread_count", "device_imei", "mnet_msisdn",
            "rt_wwan_conn_info", "wan_status"
        ]
        payload = {"keys": keys}
        try:
            r = self.session.post(f"{self.base_url}/action/get_mgdb_params", json=payload, headers={"Content-Type": "application/json"}, verify=False, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if data.get('retcode') == 0:
                    res = data.get('data', {})
                    
                    wan_info = res.get('rt_wwan_conn_info', '')
                    if wan_info:
                        parts = wan_info.split(',')
                        if len(parts) >= 1:
                            res['wan_status'] = parts[0] # connected/disconnected
                    
                    return res
        except Exception as e:
            logging.error(f"Get status failed: {e}")
            pass
        return None

def check_modem_status():
    """
    Verifies modem connectivity and operator.
    Returns True if passed, False otherwise.
    """
    client = HKMModemClient()
    
    try:
        logging.info("Attempting to login...")
        if not client.login():
            logging.error("Login failed.")
            return False
            
        status = client.get_status()
        if not status:
            logging.error("Failed to retrieve status.")
            return False
            
        # Verify Connectivity (wan_status)
        wan_status = status.get('wan_status', '').lower()
        operator = status.get('mnet_operator_name', '')
        
        logging.info(f"Status Check: WAN='{wan_status}', Operator='{operator}'")
        
        # Logic Verification
        if wan_status != 'connected':
            logging.error(f"Check Failed: WAN status is '{wan_status}' (Expected: 'connected')")
            return False
            
        if operator != 'Telkomsel':
            logging.error(f"Check Failed: Operator is '{operator}' (Expected: 'Telkomsel')")
            return False
            
        logging.info("Check Passed.")
        return True
        
    except Exception as e:
        logging.error(f"Exception during check: {e}")
        return False

def run_loop():
    """
    Main daemon loop.
    """
    logging.info("Daemon started. Running initial check...")
    
    while True:
        if not check_modem_status():
            logging.error("Check failed! Exiting daemon.")
            if os.path.exists(PID_FILE):
                os.remove(PID_FILE)
            sys.exit(1)
            
        logging.info(f"Sleeping for {CHECK_INTERVAL/3600} hours...")
        time.sleep(CHECK_INTERVAL)

def daemon_loop_entry():
    """
    Entry point for the background daemon process.
    """
    # Write PID
    pid = os.getpid()
    with open(PID_FILE, 'w') as f:
        f.write(str(pid))
        
    logging.info(f"Daemon process started with PID {pid}")
    
    # Run the loop
    run_loop()

def start_daemon():
    if os.path.exists(PID_FILE):
        print(f"Daemon possibly running (PID file {PID_FILE} exists).")
        try:
            with open(PID_FILE, 'r') as f:
                pid = int(f.read().strip())
            os.kill(pid, 0)
            print("Process is alive. Exiting.")
            sys.exit(1)
        except OSError:
            print("Process not found. Removing stale PID file.")
            os.remove(PID_FILE)

    # First Check (Foreground)
    print("Running initial connectivity check...")
    if not check_modem_status():
        print("Initial check failed! Internet not connected or Operator mismatch. Check /tmp/modem_monitor.log for details.")
        sys.exit(1)

    print("Initial check passed. Starting background daemon...")

    # Spawn the daemon process using Popen (Exec, not Fork)
    try:
        # Check if running as PyInstaller frozen binary
        if getattr(sys, 'frozen', False):
            # sys.executable is the binary itself
            # We just need to pass the argument
            cmd = [sys.executable, 'daemon_loop']
        else:
            # Running as script
            # sys.executable is python interpreter
            # sys.argv[0] is the script path
            cmd = [sys.executable, sys.argv[0], 'daemon_loop']
        
        # We redirect stdout/stderr to files or DEVNULL to detach completely
        # But we want to check for immediate errors.
        # Let's keep stderr captured for a moment to print if it fails.
        proc = subprocess.Popen(
            cmd,
            start_new_session=True, # Detach from terminal (setsid)
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE # Capture stderr to debug startup
        )
        
        # Wait a moment to see if it crashes immediately
        try:
            # Wait up to 2 seconds
            stderr_out = ""
            try:
                # We can't use proc.wait(timeout) easily with start_new_session completely detached 
                # effectively if we want to read stderr pipe without blocking forever.
                # But since it's a daemon, it SHOULD keep running.
                # If it exits, communicate() returns quickly.
                # If it runs, Communicate() would block forever if we don't use timeout.
                outs, errs = proc.communicate(timeout=2)
                # If we are here, process finished (crashed)
                stderr_out = errs.decode('utf-8') if errs else ""
            except subprocess.TimeoutExpired:
                # Process is still running after 2 seconds! This is GOOD.
                # We can stop reading stderr (it's detaching)
                pass

            if proc.poll() is not None:
                # Process died
                print(f"Error: Daemon process died immediately with code {proc.returncode}.")
                if stderr_out:
                    print(f"Error output: {stderr_out.strip()}")
                else:
                    # Try reading stderr again if we timed out previously? No, communicate handles it.
                    pass
                sys.exit(1)
            else:
                # Process is running
                print(f"Daemon started successfully.")
                print(f"PID: {proc.pid}")
                print(f"Log: {LOG_FILE}")
                
        except Exception as e:
            print(f"Error monitoring daemon startup: {e}")
            
    except Exception as e:
        print(f"Failed to start daemon: {e}")
        sys.exit(1)

def stop_daemon():
    if not os.path.exists(PID_FILE):
        print("Daemon not running (PID file not found).")
        return

    try:
        with open(PID_FILE, 'r') as f:
            pid = int(f.read().strip())
        
        os.kill(pid, signal.SIGTERM)
        print(f"Sent SIGTERM to PID {pid}")
        
        time.sleep(1)
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
            
    except ProcessLookupError:
        print("Process not found. removing PID file.")
        os.remove(PID_FILE)
    except Exception as e:
        print(f"Error stopping daemon: {e}")

if __name__ == "__main__":
    # The initial check is now handled at the very top of the file.
    # We just need to parse args here for the actual logic.
    parser = argparse.ArgumentParser(description="HKM0130 Modem Monitor Daemon", add_help=False)
    parser.add_argument('action', choices=['start', 'stop', 'daemon_loop'], help="Action to perform")
    
    try:
        args = parser.parse_args()
        if args.action == 'start':
            start_daemon()
        elif args.action == 'stop':
            stop_daemon()
        elif args.action == 'daemon_loop':
            daemon_loop_entry()
    except SystemExit:
        pass
