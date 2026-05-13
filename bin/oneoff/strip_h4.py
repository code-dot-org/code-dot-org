#!/usr/bin/env python3
"""
Strip #### markdown and <h4> HTML body-text prefixes from .external files.
Handles:
  - Plain paragraphs: "#### text" -> "text"
  - Bullet items:     "* #### text" -> "* text"
  - No-space:         "####text" -> "text"
  - HTML inline:      "<h4>text</h4>" -> "text"
  - HTML in lists:    "<li><h4>text</h4></li>" -> "<li>text</li>"
Does NOT touch ##### (5+ hashes).
"""
import re
import glob
import sys

scripts_dir = '/Users/eric/programming/code-dot-org/dashboard/config/scripts'
dry_run = '--dry-run' in sys.argv

# Exactly 4 hashes, NOT followed by a 5th hash
# Handles optional leading whitespace and optional bullet marker
# Group 1: prefix before ####  (whitespace, or "* ", or "- ", etc.)
# Group 2: content after ####  (with optional leading space stripped)
bullet_re = re.compile(r'^(\s*[-*]\s*)####(?!#)\s*(.*)')
plain_re  = re.compile(r'^(\s*)####(?!#)\s*(.*)')

# Strip <h4 ...> and </h4> tags anywhere on a line
h4_tag_re = re.compile(r'<h4[^>]*>|</h4>')

files = glob.glob(f'{scripts_dir}/**/*.external', recursive=True)
files += glob.glob(f'{scripts_dir}/*.external')
files = sorted(set(files))

files_modified = 0
lines_modified = 0

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    lines = original.split('\n')
    new_lines = []
    changed = False

    for line in lines:
        m = bullet_re.match(line)
        if m:
            new_line = m.group(1) + m.group(2)
            new_lines.append(new_line)
            if new_line != line:
                changed = True
                lines_modified += 1
            continue

        m = plain_re.match(line)
        if m:
            new_line = m.group(1) + m.group(2)
            new_lines.append(new_line)
            if new_line != line:
                changed = True
                lines_modified += 1
            continue

        new_line = h4_tag_re.sub('', line)
        new_lines.append(new_line)
        if new_line != line:
            changed = True
            lines_modified += 1

    if changed:
        files_modified += 1
        if dry_run:
            orig_lines = original.split('\n')
            print(f'\n=== {filepath} ===')
            for i, (old, new) in enumerate(zip(orig_lines, new_lines)):
                if old != new:
                    print(f'  -{repr(old)}')
                    print(f'  +{repr(new)}')
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))

action = 'Would modify' if dry_run else 'Modified'
print(f'\n{action} {files_modified} files, {lines_modified} lines')
