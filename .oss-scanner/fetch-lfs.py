#!/usr/bin/env python3
"""Replace Git LFS pointer files in the checkout with their content (OSS Scanner image build only).

A plain `git clone` without git-lfs set up leaves LFS-tracked paths as small pointer files. This fetches the
content of the pointer files under the given path prefixes from GitHub's public LFS media endpoint, pinned to
the checkout's HEAD commit. Each file is verified against the sha256 oid recorded in its pointer before it is
written, so a bad download can never replace a pointer with wrong content.

    python3 .oss-scanner/fetch-lfs.py dashboard/config/locales apps/i18n ...

Exits non-zero if any file could not be fetched (the files that were fetched stay in place).
"""
import concurrent.futures
import hashlib
import os
import pathlib
import subprocess
import sys
import urllib.parse
import urllib.request

REPO = os.environ.get("LFS_MEDIA_REPO", "code-dot-org/code-dot-org")
POINTER_PREFIX = b"version https://git-lfs.github.com/spec/v1\n"


def pointer(path):
    """Return (oid, size) if `path` is an LFS pointer file, else None."""
    try:
        if path.stat().st_size > 1024:
            return None
        data = path.read_bytes()
    except OSError:
        return None
    if not data.startswith(POINTER_PREFIX):
        return None
    fields = dict(line.split(" ", 1) for line in data.decode().splitlines() if " " in line)
    return fields["oid"].removeprefix("sha256:"), int(fields["size"])


def fetch(sha, path, oid, size):
    url = f"https://media.githubusercontent.com/media/{REPO}/{sha}/{urllib.parse.quote(str(path))}"
    last = None
    for _ in range(4):
        try:
            with urllib.request.urlopen(url, timeout=120) as response:
                data = response.read()
            if len(data) != size or hashlib.sha256(data).hexdigest() != oid:
                raise ValueError(f"content does not match the pointer ({len(data)} bytes)")
            tmp = path.with_name(path.name + ".lfs-tmp")
            tmp.write_bytes(data)
            os.chmod(tmp, path.stat().st_mode)  # some tracked files are 755
            os.replace(tmp, path)
            return None
        except Exception as error:  # noqa: BLE001 - retried, then reported
            last = error
    return f"{path}: {last}"


def main():
    prefixes = sys.argv[1:]
    sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
    tracked = subprocess.run(["git", "ls-files", "-z", "--", *prefixes], capture_output=True, check=True).stdout
    todo = []
    for name in tracked.decode().split("\0"):
        if name and (found := pointer(pathlib.Path(name))):
            todo.append((pathlib.Path(name), *found))
    total = sum(size for _, _, size in todo)
    print(f"fetch-lfs: {len(todo)} pointer files, {total / 1e6:.0f} MB, from {REPO}@{sha[:12]}", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        errors = [e for e in pool.map(lambda t: fetch(sha, *t), todo) if e]
    for error in errors[:20]:
        print(f"fetch-lfs: FAILED {error}", file=sys.stderr)
    print(f"fetch-lfs: fetched {len(todo) - len(errors)}, failed {len(errors)}", flush=True)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
