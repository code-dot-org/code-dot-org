#!/usr/bin/env python3
"""Write the pathway JSON from its annotated JSONC, keeping the layout.

usage: jsonc_to_json.py IN.annotated.jsonc OUT.json

Drops // comments outside strings, then lines left blank by a dropped
comment, then trailing commas (editors' JSONC formatters add them). Fails
if the result is not valid JSON.
"""
import json
import re
import sys


def strip_line(line):
    out = []
    in_string = escaped = False
    i = 0
    while i < len(line):
        c = line[i]
        if in_string:
            out.append(c)
            if escaped:
                escaped = False
            elif c == '\\':
                escaped = True
            elif c == '"':
                in_string = False
        elif c == '"':
            in_string = True
            out.append(c)
        elif line.startswith('//', i):
            return ''.join(out).rstrip(), True
        else:
            out.append(c)
        i += 1
    return ''.join(out).rstrip(), False


def main(src, dst):
    lines = []
    with open(src, encoding='utf-8') as f:
        for raw in f:
            stripped, had_comment = strip_line(raw.rstrip('\n'))
            if had_comment and not stripped.strip():
                continue
            lines.append(stripped)
    for i, line in enumerate(lines):
        nxt = next((l for l in lines[i + 1:] if l.strip()), '')
        if line.endswith(',') and re.match(r'\s*[\]}]', nxt):
            lines[i] = line[:-1]
    text = '\n'.join(lines).strip('\n') + '\n'
    json.loads(text)
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(text)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
