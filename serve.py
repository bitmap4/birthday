#!/usr/bin/env python3
"""Static server. Editor POST /__placed writes placed.json."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
PLACED = ROOT / "placed.json"
PORT = 8765


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path.endswith("placed.json"):
            self.send_header("Cache-Control", "no-store, max-age=0")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_POST(self):
        if self.path.rstrip("/") != "/__placed":
            self.send_error(404)
            return
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n).decode())
        if not isinstance(body, dict):
            self.send_error(400, "placed.json must be an object")
            return
        PLACED.write_text(json.dumps(body, indent=2) + "\n")
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print("http://127.0.0.1:%s  (editor saves to placed.json)" % PORT)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
