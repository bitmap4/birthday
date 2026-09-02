#!/usr/bin/env python3
"""Static server. Editor POST /__placed writes placed.json. POST /__tape writes the title wash."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import base64
import csv
import json
import re
import subprocess
import time
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
PLACED = ROOT / "placed.json"
TAPE_PNG = ROOT / "assets" / "stickers" / "title-wash.png"
TAPE_JSON = ROOT / "refs" / "tape.json"
RSVP_CSV = ROOT / "rsvps.csv"
PORT = 8765
PNG_RE = re.compile(r"^data:image/png;base64,(.+)$", re.I | re.S)
PINTEREST_CACHE = {}
PINTEREST_TTL = 15 * 60
RSVP_HEADER = ["datetime", "name", "coming"]


def normalize_rsvp(raw):
    if not isinstance(raw, dict):
        return None
    name = str(raw.get("name") or "").strip()
    coming = str(raw.get("coming") or "").strip().lower()
    if coming in ("yes", "in", "true", "1"):
        coming = "yes"
    elif coming in ("no", "out", "false", "0"):
        coming = "no"
    else:
        return None
    if not name or len(name) > 80:
        return None
    return name, coming


def append_rsvp(name, coming):
    new = not RSVP_CSV.exists()
    with RSVP_CSV.open("a", newline="") as handle:
        writer = csv.writer(handle)
        if new:
            writer.writerow(RSVP_HEADER)
        writer.writerow(
            [datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), name, coming]
        )


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if path.endswith("placed.json") or path.endswith("title-wash.png") or path.endswith("tape.json"):
            self.send_header("Cache-Control", "no-store, max-age=0")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/__rsvp":
            body = RSVP_CSV.read_bytes() if RSVP_CSV.exists() else (
                ",".join(RSVP_HEADER) + "\n"
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path != "/__pinterest":
            return SimpleHTTPRequestHandler.do_GET(self)

        board_url = parse_qs(parsed.query).get("url", [""])[0]
        host = urlparse(board_url).hostname or ""
        if len(board_url) > 500 or not (
            host == "pin.it"
            or host == "pinterest.com"
            or host.endswith(".pinterest.com")
        ):
            self.send_error(400, "valid Pinterest board URL required")
            return

        cached = PINTEREST_CACHE.get(board_url)
        if cached and time.time() - cached["at"] < PINTEREST_TTL:
            images = cached["images"]
        else:
            gallery_dl = ROOT / ".venv" / "bin" / "gallery-dl"
            if not gallery_dl.exists():
                self.send_error(503, "gallery-dl is not installed")
                return
            try:
                result = subprocess.run(
                    [
                        str(gallery_dl),
                        "-G",
                        "--range",
                        "1-8",
                        board_url,
                    ],
                    cwd=ROOT,
                    capture_output=True,
                    check=True,
                    text=True,
                    timeout=25,
                )
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
                self.send_error(502, "Pinterest board could not be refreshed")
                return
            images = [
                line.strip()
                for line in result.stdout.splitlines()
                if line.strip().startswith("https://i.pinimg.com/")
            ][:8]
            if not images:
                self.send_error(502, "Pinterest returned no images")
                return
            PINTEREST_CACHE[board_url] = {"at": time.time(), "images": images}

        payload = json.dumps({"images": images}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        route = self.path.rstrip("/")
        n = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(n)
        if route == "/__placed":
            body = json.loads(raw.decode())
            if not isinstance(body, dict):
                self.send_error(400, "placed.json must be an object")
                return
            PLACED.write_text(json.dumps(body, indent=2) + "\n")
            self.send_response(204)
            self.end_headers()
            return
        if route == "/__tape":
            body = json.loads(raw.decode())
            png = body.get("png") or ""
            m = PNG_RE.match(png)
            if not m:
                self.send_error(400, "png data url required")
                return
            blob = base64.b64decode(m.group(1))
            if len(blob) > 12 * 1024 * 1024:
                self.send_error(400, "png too large")
                return
            TAPE_PNG.parent.mkdir(parents=True, exist_ok=True)
            TAPE_PNG.write_bytes(blob)
            strokes = body.get("strokes")
            if isinstance(strokes, list):
                TAPE_JSON.parent.mkdir(parents=True, exist_ok=True)
                TAPE_JSON.write_text(
                    json.dumps(
                        {
                            "w": body.get("w"),
                            "h": body.get("h"),
                            "renderer": body.get("renderer"),
                            "size": body.get("size"),
                            "alpha": body.get("alpha"),
                            "texture": body.get("texture"),
                            "streakLength": body.get("streakLength"),
                            "streakWidth": body.get("streakWidth"),
                            "strokes": strokes,
                        },
                        indent=2,
                    )
                    + "\n"
                )
            self.send_response(204)
            self.end_headers()
            return
        self.send_error(404)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    print("http://127.0.0.1:%s  (editor saves to placed.json / title-wash.png)" % PORT)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
