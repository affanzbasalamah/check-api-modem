FROM python:3.11-slim

WORKDIR /app
COPY modem_monitor.py .
RUN apt-get update && apt-get install -y binutils
RUN pip install requests pyinstaller
RUN pyinstaller --onefile modem_monitor.py

