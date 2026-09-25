from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
PORT = 8000
print(f"Serving Marine Engineer Reviewer PWA at http://localhost:{PORT}/")
print("Press Ctrl+C to stop.")
webbrowser.open(f"http://localhost:{PORT}/")
ThreadingHTTPServer(("localhost", PORT), SimpleHTTPRequestHandler).serve_forever()
