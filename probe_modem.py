import requests
import urllib3
import ssl
import re
import time
import json
import hmac
import hashlib
import base64
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context
from urllib3.util.retry import Retry

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

# --- Custom Encryption Ported from JS ---
KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

def base64_utf8_encode(string):
    return base64.b64encode(string.encode('utf-8')).decode('ascii')

def replace_char_at(s, n, c):
    if n >= len(s): return s
    return s[:n] + c + s[n+1:]

def password_encode(password, secret, timestamp, timestamp_start):
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    date_now_ts = int(time.time())
    ts_hex = timestamp.lower().replace('0x', '')
    ts_val = int(ts_hex, 16) + (date_now_ts - timestamp_start)
    time_stamp_hex = hex(ts_val)[2:]
    
    message = time_stamp_hex + ":" + password
    base64_str = base64_utf8_encode(message)
    
    secret_hex = secret.lower().replace('0x', '')
    parse16 = int(secret_hex, 16)
    first = charset[len(base64_str) % len(charset)]
    
    # loop 1
    tmp = ""
    for i in range(4):
        idx = ((parse16 >> (i*8)) & 0xff) % len(charset)
        tmp += charset[idx]
    
    tmp += base64_str
    base64_str = tmp
    
    # loop 2
    for i in range(4):
        num = ((parse16 >> (i*8)) & 0xff) % len(base64_str)
        chr = base64_str[num]
        chrtotal = base64_str[i % len(base64_str)]
        base64_str = replace_char_at(base64_str, num, chrtotal)
        base64_str = replace_char_at(base64_str, i % len(base64_str), chr)
        
    base64_str = first + base64_str
    return base64_str

def hex_hmac_md5(key, data):
    return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.md5).hexdigest()

def probe_modem():
    base_url = "https://192.168.8.1"
    
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    session.mount('https://', LegacySSLAdapter(max_retries=retries))
    
    print(f"[*] Probing {base_url}...")
    
    encrypt_enabled = False
    g_priKey = None
    g_timestamp = None
    g_timestamp_start = int(time.time())

    # 1. Download status/device files (NEW)
    files_to_try = ["/js/status.js", "/js/device.js", "/js/device_information.js", "/html/status.html", "/html/device_information.html"]
    for fpath in files_to_try:
        print(f"[*] Downloading {fpath}...")
        try:
            r = session.get(f"{base_url}{fpath}", verify=False, timeout=10)
            if r.status_code == 200:
                fname = fpath.split('/')[-1]
                with open(fname, "w") as f:
                    f.write(r.text)
                print(f"    [+] Saved {fname}")
            else:
                print(f"    [-] Failed to download {fpath}: {r.status_code}")
        except Exception as e:
            print(f"    [-] Exception downloading {fpath}: {e}")

    # 2. Check Encryption State
    try:
        r = session.get(f"{base_url}/config/global/config.xml", verify=False, timeout=10)
        if '<encrypt>1</encrypt>' in r.text or re.search(r'<encrypt>\s*1\s*</encrypt>', r.text):
            encrypt_enabled = True
            print("    [+] Encryption ENABLED")
        else:
            print("    [+] Encryption DISABLED")
    except Exception as e:
        print(f"    [-] Failed to get config: {e}")
        return

    time.sleep(1)

    # 3. Sync Keys
    if encrypt_enabled or True:
        try:
            headers = {"Content-Type": "application/x-mgdata"}
            r = session.post(f"{base_url}/goform/sync", verify=False, headers=headers, timeout=10)
            val = r.headers.get("X-MG-Private")
            if val:
                g_priKey = val.split("x")[0]
                g_timestamp = val.split("x")[1]
                g_timestamp_start = int(time.time())
                print(f"    [+] Got keys")
            else:
                print("    [-] Failed to get X-MG-Private header")
        except Exception as e:
            print(f"    [-] Sync failed: {e}")
            if encrypt_enabled: return

    time.sleep(1)

    # 4. Login
    print("[*] Attempting Login (admin/admin)...")
    username = "admin"
    password = "admin"
    key_hmac = "0123456789"
    user_hashed = hex_hmac_md5(key_hmac, username)
    pass_hashed = hex_hmac_md5(key_hmac, password)
    
    payload_dict = {"username": user_hashed, "password": pass_hashed}
    payload_json = json.dumps(payload_dict)
    
    final_payload = payload_json
    if encrypt_enabled and g_priKey:
        final_payload = password_encode(payload_json, g_priKey, g_timestamp, g_timestamp_start)
    
    headers = {"Content-Type": "application/x-mgdata" if (encrypt_enabled and g_priKey) else "application/json"}
    
    try:
        r = session.post(f"{base_url}/goform/login", data=final_payload, headers=headers, verify=False, timeout=10)
        if '"retcode":0' in r.text or (r.json().get('retcode') == 0):
             print("    [+] Login SUCCESS!")
        else:
             print("    [-] Login MIGHT have failed.")
    except Exception as e:
        print(f"    [-] Login failed: {e}")

    time.sleep(1)

    # 6. Massive Key Fuzzing (Extended List)
    print("[*] Fuzzing for more data keys...")
    
    # Common keys found in various 4G/5G CPE firmwares (Huawei, ZTE, Alcatel, etc.)
    # and generic terms for modem status.
    candidates = [
        # --- Previously Verified ---
        "device_imei", "mnet_sig_level", "mnet_operator_name", "sms_unread_count",
        "mnet_sim_status", "mnet_sysmode", "device_uptime", 
        "rt_wwan_conn_info", "rt_eth_conn_info", "rt_internet_mode",
        "mnet_roam_status", "mnet_pinlock_sim_status", "mnet_pinlock_switch",
        "wifi_work_status", "dialup_dial_status", "statistics_tx_bytes_rate", "statistics_rx_bytes_rate",
        "wifi_ssid_0", "wifi_psk_0",
        
        # --- Signal Details (RSRP, RSRQ, SINR, Bands) ---
        "mnet_lte_rsrp", "lte_rsrp", "rsrp",
        "mnet_lte_rsrq", "lte_rsrq", "rsrq",
        "mnet_lte_sinr", "lte_sinr", "sinr", "snr", "mnet_lte_snr",
        "mnet_lte_rssi", "lte_rssi", "rssi",
        "mnet_band", "lte_band", "band", "frequency",
        "mnet_cellid", "cell_id", "cellid", "enodeb_id", "eci", "pci",
        "mnet_pci", "phy_cell_id",
        
        # --- Network / WAN ---
        "wan_ip", "wan_ip_address", "public_ip",
        "apn", "mnet_apn", "current_apn", "pdp_context",
        "dns_mode", "primary_dns", "secondary_dns",
        
        # --- Device / Hardware ---
        "hardware_version", "software_version", "web_version",
        "device_name", "model_name", "serial_number", "sn",
        "mac_address", "wlan_mac", "lan_mac",
        "temperature", "device_temp",
        
        # --- SMS / USSD ---
        "sms_capacity", "sms_box_count", 
        
        # --- Traffic ---
        "total_tx_bytes", "total_rx_bytes", "daily_tx_bytes", "daily_rx_bytes",
        "online_time", "connect_duration",
        
        # --- Common variations observed in other firmwares ---
        "router_status", "signal_strength", "network_type", "service_status",
        "sim_state", "card_state", "profile_name"
    ]
    
    # Chunking requests to avoid potential payload limits if we send 100+ keys
    chunk_size = 20
    for i in range(0, len(candidates), chunk_size):
        chunk = candidates[i:i + chunk_size]
        print(f"    [*] Probing chunk {i//chunk_size + 1} ({len(chunk)} keys)...")
        
        req_data = {"keys": chunk}
        req_json = json.dumps(req_data)
        
        if encrypt_enabled and g_priKey:
            req_payload = password_encode(req_json, g_priKey, g_timestamp, g_timestamp_start)
            req_headers = {"Content-Type": "application/x-mgdata"}
        else:
            req_payload = req_json
            req_headers = {"Content-Type": "application/json"}
            
        try:
            r = session.post(f"{base_url}/action/get_mgdb_params", data=req_payload, headers=req_headers, verify=False, timeout=10)
            if '"retcode":0' in r.text or (r.status_code == 200 and r.json().get('retcode')==0):
                 data = r.json().get('data', {})
                 # Print only non-empty values to reduce noise
                 for k, v in data.items():
                     if v and str(v).strip():
                         print(f"        [FOUND] {k}: {v}")
            else:
                 print(f"        [-] Failed or empty response for chunk")
        except Exception as e:
             print(f"        [-] Chunk failed: {e}")
        
        time.sleep(0.5)

    # 7. Probe Common Modem URL Endpoints (Extended Fuzzing)
    print("\n[*] Probing known 4G Modem API Endpoints...")
    common_endpoints = [
        "/goform/goform_get_cmd_process",
        "/goform/goform_set_cmd_process"
    ]
    
    # Common ZTE/Qualcomm Commands
    zte_commands = [
        "GetSystemStatus", "GetNetworkInfo", "GetSimStatus", "GetWanSettings", 
        "GetSMSList", "GetConnectMode", "GetTrafficStatistics", "GetDeviceInformation"
    ]

    for endpoint in common_endpoints:
        url = f"{base_url}{endpoint}"
        
        # 1. Try GET with cmd
        for cmd in zte_commands:
            try:
                # GET param
                r = session.get(f"{url}?cmd={cmd}&multi_data=1", verify=False, timeout=5)
                if r.status_code == 200 and "retcode" in r.text:
                    print(f"    [+] GET {endpoint}?cmd={cmd} -> SUCCESS!")
                    print(f"        Body: {r.text[:200]}")
            except: pass
            
            try:
                # POST param
                r = session.post(url, data={"cmd": cmd, "multi_data": 1}, verify=False, timeout=5)
                if r.status_code == 200 and "retcode" in r.text:
                    print(f"    [+] POST {endpoint} (cmd={cmd}) -> SUCCESS!")
                    print(f"        Body: {r.text[:200]}")
            except: pass


if __name__ == "__main__":
    probe_modem()
