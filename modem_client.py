import requests
import urllib3
import ssl
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

class HKMModemClient:
    def __init__(self, host="192.168.8.1", password="admin", username="admin"):
        self.base_url = f"https://{host}"
        self.username = username
        self.password = password
        self.session = requests.Session()
        
        retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        self.session.mount('https://', LegacySSLAdapter(max_retries=retries))
        
        self.encrypt_enabled = False
        self.pri_key = None
        self.timestamp = None
        self.timestamp_start = 0

    def _hex_hmac_md5(self, key, data):
        return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.md5).hexdigest()

    def _update_keys(self):
        try:
            r = self.session.post(f"{self.base_url}/goform/sync", verify=False, headers={"Content-Type": "application/x-mgdata"}, timeout=10)
            val = r.headers.get("X-MG-Private")
            if val:
                self.pri_key = val.split("x")[0]
                self.timestamp = val.split("x")[1]
                self.timestamp_start = int(time.time())
                return True
        except Exception as e:
            print(f"Error syncing keys: {e}")
        return False

    def login(self):
        # 1. Check Encryption (optional, but good to know)
        try:
            r = self.session.get(f"{self.base_url}/config/global/config.xml", verify=False, timeout=5)
            if '<encrypt>1</encrypt>' in r.text:
                self.encrypt_enabled = True
        except:
            pass

        # 2. Sync Keys
        if not self._update_keys():
            raise Exception("Failed to sync keys with modem")

        # 3. Hash Credentials
        key_hmac = "0123456789"
        user_hashed = self._hex_hmac_md5(key_hmac, self.username)
        pass_hashed = self._hex_hmac_md5(key_hmac, self.password)
        
        payload = {
            "username": user_hashed,
            "password": pass_hashed
        }
        
        # If encryption was enabled, we'd need the complex password_encode function.
        # But probe showed it DISABLED. For simplicity, implementing JSON only first.
        # If the user's device actually has encryption enabled, we'd need to port that function fully here.
        # Given the probe result "Encryption DISABLED", I'll stick to JSON.
        
        headers = {"Content-Type": "application/json"}
        r = self.session.post(f"{self.base_url}/goform/login", json=payload, headers=headers, verify=False, timeout=10)
        
        if r.status_code == 200 and '"retcode":0' in r.text:
            return True
        return False

    def get_status(self):
        keys = [
            "mnet_sim_status", 
            "mnet_sig_level", 
            "device_battery_level", 
            "mnet_imsi", 
            "mnet_sysmode", 
            "mnet_operator_name",
            "sms_unread_count",
            "device_imei",
            "mnet_msisdn",
            "rt_wwan_conn_info",
            "wifi_ssid_0",
            "wifi_psk_0",
            "statistics_tx_bytes_rate", 
            "statistics_rx_bytes_rate"
        ]
        payload = {"keys": keys}
        r = self.session.post(f"{self.base_url}/action/get_mgdb_params", json=payload, headers={"Content-Type": "application/json"}, verify=False, timeout=10)
        
        if r.status_code == 200:
            try:
                data = r.json()
                if data.get('retcode') == 0:
                    res = data.get('data', {})
                    
                    # Parse WAN Info if present
                    # Format: status, signal(?), mac, ip, mask, gateway, dns, ...
                    wan_info = res.get('rt_wwan_conn_info', '')
                    if wan_info:
                        parts = wan_info.split(',')
                        if len(parts) >= 7:
                            res['wan_ip'] = parts[3]
                            res['wan_gateway'] = parts[5]
                            res['wan_dns'] = parts[6]
                            res['wan_mac'] = parts[2]
                            res['wan_status'] = parts[0]
                            
                    return res
            except:
                pass
        return None

if __name__ == "__main__":
    client = HKMModemClient()
    print("Logging in...")
    if client.login():
        print("Login Successful.")
        status = client.get_status()
        print(f"Status: {json.dumps(status, indent=2)}")
    else:
        print("Login Failed.")
