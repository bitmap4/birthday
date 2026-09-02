import csv
import io
import json
import os
from datetime import datetime, timezone

import azure.functions as func
from azure.storage.blob import BlobServiceClient, ContentSettings

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}
CONTAINER = "rsvp"
BLOB = "rsvps.csv"
HEADER = "datetime,name,coming\n"


def with_cors(response):
    for key, value in CORS.items():
        response.headers[key] = value
    return response


def blob_client():
    service = BlobServiceClient.from_connection_string(os.environ["AzureWebJobsStorage"])
    container = service.get_container_client(CONTAINER)
    try:
        container.create_container()
    except Exception:
        pass
    return container.get_blob_client(BLOB)


def read_csv():
    client = blob_client()
    if not client.exists():
        return HEADER
    return client.download_blob().readall().decode("utf-8")


def append_row(name, coming):
    existing = read_csv() or HEADER
    if not existing.endswith("\n"):
        existing += "\n"
    buf = io.StringIO()
    csv.writer(buf, lineterminator="\n").writerow(
        [datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), name, coming]
    )
    blob_client().upload_blob(
        (existing + buf.getvalue()).encode("utf-8"),
        overwrite=True,
        content_settings=ContentSettings(content_type="text/csv; charset=utf-8"),
    )


def parse_body(raw):
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


@app.function_name(name="rsvp")
@app.route(route="rsvp", methods=["GET", "POST", "OPTIONS"])
def rsvp(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return with_cors(func.HttpResponse(status_code=204))

    admin = os.environ.get("RSVP_ADMIN_KEY", "")
    if req.method == "GET":
        if not admin or req.params.get("key") != admin:
            return with_cors(func.HttpResponse("nope", status_code=403))
        response = func.HttpResponse(read_csv(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=rsvps.csv"
        return with_cors(response)

    try:
        payload = req.get_json()
    except ValueError:
        return with_cors(func.HttpResponse("json required", status_code=400))
    parsed = parse_body(payload or {})
    if not parsed:
        return with_cors(func.HttpResponse("name and yes/no coming required", status_code=400))
    append_row(*parsed)
    return with_cors(
        func.HttpResponse(
            json.dumps({"ok": True, "coming": parsed[1]}),
            mimetype="application/json",
        )
    )
