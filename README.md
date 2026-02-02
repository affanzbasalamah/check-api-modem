# HKM0130 Modem Monitor Daemon

This project is a monitoring tool for the HKM0130 modem. It includes a daemon that checks internet connectivity and operator status periodically.

## Features

- **Automated Monitoring:** Checks internet connectivity and Operator Name (e.g., "Telkomsel") every 6 hours.
- **Logging:** Activities are logged to `/tmp/modem_monitor.log`.
- **Automatic Exit:** The monitor exits immediately if any check fails, allowing for external service managers to handle restarts or alerts.

## Usage

### Modem Monitor

To interact with the daemon:

```bash
# Start the background monitoring daemon
./modem_monitor start

# Stop the running daemon
./modem_monitor stop

# Show help message
./modem_monitor help
```

## Project Structure

- `modem_monitor.py`: Main daemon script.
- `modem_client.py`: Client for interacting with the modem API.
- `probe_modem.py`: Utility to probe modem status.
- `*.html` / `*.js`: Web interface components (Login, Status, Settings).
