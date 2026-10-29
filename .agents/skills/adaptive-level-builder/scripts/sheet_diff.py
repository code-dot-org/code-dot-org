#!/usr/bin/env python3
"""Compare two sheet.txt dumps by row key, and renumber JSONC citations.

usage: sheet_diff.py OLD NEW [--key SHEET=COL]... [--renumber JSONC --code CODE=SHEET...]

A line diff of sheet.txt is useless once a row is inserted: every address
below it changes. With --key, rows of SHEET are matched by the value in
column COL (a step or checkpoint id), so the report lists added, removed
and changed rows by key, and maps each old row number to its new one.
Sheets without a key are compared row by row.

--renumber rewrites, in the comments of JSONC only, each citation
CODE!<cell> or CODE!<cell>-<cell> whose row moved, using the row map of the
sheet CODE names. A citation of a removed row is left alone and reported.
Text lines are never touched; update those by hand from the report.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsonc_to_json import strip_line  # noqa: E402

CELL_LINE = re.compile(r'^([^\t#][^\t]*)!([A-Z]+)(\d+)\t(.*)$')


def load(path):
    """sheet -> row -> col -> [values], newlines and backslashes decoded."""
    out = {}
    for line in open(path, encoding='utf-8'):
        m = CELL_LINE.match(line.rstrip('\n'))
        if not m:
            continue
        sheet, col, row, value = m.groups()
        value = re.sub(r'\\(n|\\)', lambda x: '\n' if x.group(1) == 'n' else '\\', value)
        out.setdefault(sheet, {}).setdefault(int(row), {}).setdefault(col, []).append(value)
    return out


def text(values):
    return ' | '.join(values) if values else '(empty)'


def keyed_rows(rows, col):
    """key -> row, or None if a key repeats."""
    by_key = {}
    for n, cells in rows.items():
        key = (cells.get(col) or [''])[0]
        if not key:
            continue
        if key in by_key:
            return None
        by_key[key] = n
    return by_key


def compare(old, new, keys):
    report, row_maps = [], {}
    for sheet in sorted(set(old) | set(new)):
        a, b = old.get(sheet, {}), new.get(sheet, {})
        col = keys.get(sheet)
        ka = kb = None
        if col:
            ka, kb = keyed_rows(a, col), keyed_rows(b, col)
            if ka is None or kb is None:
                report.append(f'{sheet}: column {col} repeats a key; compared row by row instead')
                col = None
        if not col:
            row_maps[sheet] = {n: n for n in a}
            for n in sorted(set(a) | set(b)):
                for c in sorted(set(a.get(n, {})) | set(b.get(n, {}))):
                    if a.get(n, {}).get(c) != b.get(n, {}).get(c):
                        report.append(f'{sheet}!{c}{n}: {text(a.get(n, {}).get(c))} -> {text(b.get(n, {}).get(c))}')
            continue
        row_map = {ka[k]: kb[k] for k in ka if k in kb}
        row_maps[sheet] = row_map
        moved = sum(1 for o, n in row_map.items() if o != n)
        if moved:
            report.append(f'{sheet}: {moved} rows moved; citations of them need renumbering')
        for k in sorted(set(ka) - set(kb), key=ka.get):
            report.append(f'{sheet} {k}: removed (was row {ka[k]})')
        for k in sorted(set(kb) - set(ka), key=kb.get):
            cells = b[kb[k]]
            report.append(f'{sheet} {k}: added at row {kb[k]}: ' +
                          '; '.join(f'{c}={text(cells[c])}' for c in sorted(cells)))
        for k in sorted(set(ka) & set(kb), key=kb.get):
            ra, rb = a[ka[k]], b[kb[k]]
            for c in sorted(set(ra) | set(rb)):
                if ra.get(c) != rb.get(c):
                    report.append(f'{sheet} {k} {c}{ka[k]}->{c}{kb[k]}: {text(ra.get(c))} -> {text(rb.get(c))}')
        # Rows without a key are compared by position among themselves.
        ua = [n for n in sorted(a) if not (a[n].get(col) or [''])[0]]
        ub = [n for n in sorted(b) if not (b[n].get(col) or [''])[0]]
        for i in range(max(len(ua), len(ub))):
            ra = a[ua[i]] if i < len(ua) else {}
            rb = b[ub[i]] if i < len(ub) else {}
            if ra != rb:
                where = f'row {ua[i] if i < len(ua) else "-"}->{ub[i] if i < len(ub) else "-"}'
                report.append(f'{sheet} unkeyed {where}: changed')
            if i < len(ua) and i < len(ub):
                row_map[ua[i]] = ub[i]
    return report, row_maps


def renumber(jsonc, codes, row_maps):
    cite = re.compile(r'\b(%s)!([A-Z]+)(\d+)(?:-([A-Z]+)(\d+))?' % '|'.join(map(re.escape, codes)))
    lines = open(jsonc, encoding='utf-8').read().split('\n')
    changed, stale = 0, []

    def sub(m, n):
        code, c1, r1, c2, r2 = m.groups()
        row_map = row_maps.get(codes[code], {})

        def move(r):
            if int(r) not in row_map:
                stale.append(f'{jsonc}:{n + 1}: {m.group(0)} cites a removed or unknown row')
                return r
            return str(row_map[int(r)])
        return f'{code}!{c1}{move(r1)}' + (f'-{c2}{move(r2)}' if c2 else '')

    for n, line in enumerate(lines):
        code_part, has_comment = strip_line(line)
        if not has_comment:
            continue
        head, comment = line[:len(code_part)], line[len(code_part):]
        new = cite.sub(lambda m: sub(m, n), comment)
        if new != comment:
            lines[n] = head + new
            changed += 1
    with open(jsonc, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    return changed, stale


def main(argv):
    args, keys, codes, jsonc = [], {}, {}, None
    i = 0
    while i < len(argv):
        if argv[i] in ('--key', '--code', '--renumber') and i + 1 < len(argv):
            flag, val = argv[i], argv[i + 1]
            if flag == '--renumber':
                jsonc = val
            else:
                name, _, rest = val.partition('=')
                if not rest:
                    sys.exit(__doc__)
                (keys if flag == '--key' else codes)[name] = rest
            i += 2
        else:
            args.append(argv[i])
            i += 1
    if len(args) != 2 or (jsonc and not codes):
        sys.exit(__doc__)
    report, row_maps = compare(load(args[0]), load(args[1]), keys)
    print('\n'.join(report) if report else 'no changes')
    if jsonc:
        changed, stale = renumber(jsonc, codes, row_maps)
        print(f'renumbered citations on {changed} lines of {jsonc}')
        for s in stale:
            print('STALE', s)


if __name__ == '__main__':
    main(sys.argv[1:])
