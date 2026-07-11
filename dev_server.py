from __future__ import annotations
import http.server, socketserver, os, webbrowser, threading, socket
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return "127.0.0.1"

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as server:
    local = f"http://localhost:{PORT}"
    print("=" * 56)
    print("禪院修行 V6 預覽伺服器")
    print("電腦：", local)
    print("手機：", f"http://{lan_ip()}:{PORT}")
    print("停止：Ctrl + C")
    print("=" * 56)
    threading.Timer(1.0, lambda: webbrowser.open(local)).start()
    server.serve_forever()
