#!/usr/bin/env python3

import json
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

TAG_PATTERN = re.compile(r"^git-([0-9a-f]{40})$")


def validate(payload):
    image = payload.get("image") or {}
    capsule = payload.get("capsule") or {}
    release = payload.get("release") or {}
    approved = payload.get("approved") or {}

    image_tag = image.get("tag", "")
    release_tag = release.get("imageTag", "")
    release_digest = release.get("imageDigest", "")
    release_git_commit = release.get("gitCommit", "")
    package_kind = release.get("packageKind", "")
    package_path = release.get("packagePath", "")
    package_digest = release.get("packageDigest", "")

    match = TAG_PATTERN.match(image_tag)
    if not match:
        return failure(f"image tag is not a canonical git tag: {image_tag}")

    expected_commit = match.group(1)
    if release_tag != image_tag:
        return failure("image tag mismatch between Freight and capsule release.yaml")
    if release_git_commit != expected_commit:
        return failure("git commit mismatch between Freight tag and capsule release.yaml")
    if release_digest != image.get("digest"):
        return failure("image digest mismatch between Freight and capsule release.yaml")
    if package_kind != "kustomize":
        return failure("package kind must be kustomize")
    if not package_path.startswith("package/"):
        return failure("package path must stay under package/")
    if not re.match(r"^sha256:[0-9a-f]{64}$", package_digest):
        return failure("package digest must be a sha256 digest")
    if capsule.get("tag") != image_tag:
        return failure("capsule tag mismatch")
    if approved:
        if approved.get("gitCommit") != release_git_commit:
            return failure("git commit mismatch between approved release metadata and capsule release.yaml")
        if approved.get("imageDigest") != release_digest:
            return failure("image digest mismatch between approved release metadata and capsule release.yaml")
        if approved.get("packageKind") != package_kind:
            return failure("package kind mismatch between approved release metadata and capsule release.yaml")
        if approved.get("packagePath") != package_path:
            return failure("package path mismatch between approved release metadata and capsule release.yaml")
        if approved.get("packageDigest") != package_digest:
            return failure("package digest mismatch between approved release metadata and capsule release.yaml")

    return {
        "ok": True,
        "reason": "",
        "release": {
            "gitCommit": release_git_commit,
            "packageKind": package_kind,
            "packagePath": package_path,
            "packageDigest": package_digest,
        },
    }


def failure(reason):
    return {
        "ok": False,
        "reason": reason,
        "release": {
            "gitCommit": "",
            "packageKind": "",
            "packagePath": "",
            "packageDigest": "",
        },
    }


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/verify":
            self.respond(404, {"ok": False, "reason": "not found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(content_length))
            result = validate(payload)
            status_code = 200 if result["ok"] else 422
            self.respond(status_code, result)
        except Exception as exc:  # pragma: no cover
            self.respond(500, {"ok": False, "reason": f"verifier error: {exc}"})

    def do_GET(self):
        if self.path == "/healthz":
            self.respond(200, {"ok": True})
            return
        self.respond(404, {"ok": False, "reason": "not found"})

    def log_message(self, _format, *_args):
        return

    def respond(self, status_code, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--stdin":
        payload = json.load(sys.stdin)
        print(json.dumps(validate(payload)))
        return

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(("0.0.0.0", port), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
