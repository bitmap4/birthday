#!/usr/bin/env python3
"""Static server that also writes css/hero.css when the editor saves."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
CSS = ROOT / "css" / "hero.css"
START = "/* @placed:start */"
END = "/* @placed:end */"
PORT = 8765


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.rstrip("/") != "/__placed":
            self.send_error(404)
            return
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n).decode())
        css = CSS.read_text()
        i = css.find(START)
        j = css.find(END)
        if i < 0 or j < 0:
            self.send_error(500, "placed markers missing")
            return
        block = START + "\n" + body["css"].rstrip() + "\n" + END
        CSS.write_text(css[:i] + block + css[j + len(END) :])
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print("http://127.0.0.1:%s  (editor saves to css/hero.css)" % PORT)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
