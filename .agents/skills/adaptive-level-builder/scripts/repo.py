#!/usr/bin/env python3
"""Read code-dot-org files from GitHub, so no local checkout is needed.

usage: repo.py cat PATH            print a file
       repo.py ls PATH             list a directory
       repo.py level NAME          print a level's JSON (the .level CDATA)
       repo.py where NAME          print a level's path

Reads branch staging of code-dot-org/code-dot-org, or REPO_REF if set.
Uses GITHUB_TOKEN, or `gh auth token`, when available; without one the API
allows 60 requests an hour, which is enough. The level index (every
dashboard/config/levels/custom path, about 20 MB from one API call) is
cached for an hour under ~/.cache/adaptive-level-builder/.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

OWNER_REPO = 'code-dot-org/code-dot-org'
REF = os.environ.get('REPO_REF', 'staging')
LEVELS_DIR = 'dashboard/config/levels/custom'
CACHE = os.path.expanduser('~/.cache/adaptive-level-builder')
INDEX_TTL = 3600


def _token():
    if os.environ.get('GITHUB_TOKEN'):
        return os.environ['GITHUB_TOKEN']
    try:
        return subprocess.run(['gh', 'auth', 'token'], capture_output=True, text=True,
                              timeout=10).stdout.strip() or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def _get(url, api=False):
    headers = {'User-Agent': 'adaptive-level-builder'}
    if api:
        headers['Accept'] = 'application/vnd.github+json'
        token = _token()
        if token:
            headers['Authorization'] = f'Bearer {token}'
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120) as r:
        return r.read()


def cat(path):
    url = f'https://raw.githubusercontent.com/{OWNER_REPO}/{REF}/{urllib.parse.quote(path)}'
    return _get(url).decode('utf-8')


def ls(path):
    url = f'https://api.github.com/repos/{OWNER_REPO}/contents/{urllib.parse.quote(path)}?ref={REF}'
    return [(e['name'], e['type']) for e in json.loads(_get(url, api=True))]


def level_index():
    """Level name -> path, for every .level under LEVELS_DIR on REF."""
    os.makedirs(CACHE, exist_ok=True)
    cached = os.path.join(CACHE, f'levels-{REF.replace("/", "_")}.json')
    if os.path.exists(cached) and time.time() - os.path.getmtime(cached) < INDEX_TTL:
        return json.load(open(cached))
    tree_ish = urllib.parse.quote(f'{REF}:{LEVELS_DIR}', safe='')
    url = f'https://api.github.com/repos/{OWNER_REPO}/git/trees/{tree_ish}?recursive=1'
    tree = json.loads(_get(url, api=True))
    if tree.get('truncated'):
        sys.stderr.write('warning: the level tree came back truncated; some levels may be missing\n')
    index = {}
    for entry in tree['tree']:
        if entry['path'].endswith('.level'):
            index[os.path.basename(entry['path'])[:-len('.level')]] = f'{LEVELS_DIR}/{entry["path"]}'
    with open(cached, 'w') as f:
        json.dump(index, f)
    return index


def level_json(name, index=None):
    """The JSON object in the level file's CDATA block, or None if no such level."""
    path = (index or level_index()).get(name)
    if not path:
        return None
    m = re.search(r'<!\[CDATA\[(.*?)\]\]>', cat(path), re.S)
    return json.loads(m.group(1)) if m else {}


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in ('cat', 'ls', 'level', 'where'):
        sys.exit(__doc__)
    cmd, arg = sys.argv[1:]
    try:
        if cmd == 'cat':
            sys.stdout.write(cat(arg))
        elif cmd == 'ls':
            for name, kind in ls(arg):
                print(name + ('/' if kind == 'dir' else ''))
        elif cmd == 'where':
            path = level_index().get(arg)
            if not path:
                sys.exit(f'no level named {arg} on {REF}')
            print(path)
        else:
            data = level_json(arg)
            if data is None:
                sys.exit(f'no level named {arg} on {REF}')
            print(json.dumps(data, indent=2, ensure_ascii=False))
    except urllib.error.HTTPError as e:
        sys.exit(f'{e.code} {e.reason}: {e.url}')


if __name__ == '__main__':
    main()
