#!/usr/bin/env python3
"""Dump every cell of a spreadsheet, one per line, for citing by address.

usage: xlsx_dump.py SOURCE OUT_DIR

SOURCE is a .xlsx file, or the JSON file the Google Drive connector saves
for download_file_content (its "content" is the base64 .xlsx). Writes
OUT_DIR/sheet.txt and extracts embedded images to OUT_DIR/media/.

sheet.txt holds, per sheet in tab order:

    # Sheet: <name>
    merged: A1:H1, ...
    <Sheet>!B3<TAB><text>          newlines in a cell written as \\n
    <Sheet>!B3<TAB>link: <url>     a hyperlink on that cell
    <Sheet>!B3<TAB>image: media/<file>   an image anchored at that cell

The read_file_content connector call samples a few rows of each sheet and
cuts cells at 80 characters; this export is the whole sheet.
"""
import base64
import json
import os
import posixpath
import re
import sys
import zipfile
from io import BytesIO
from xml.etree import ElementTree as ET

NS = {
    'm': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
    'xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
}
R_ID = '{%s}id' % NS['r']
R_EMBED = '{%s}embed' % NS['r']


def load(source):
    data = open(source, 'rb').read()
    if data[:2] == b'PK':
        return zipfile.ZipFile(BytesIO(data))
    return zipfile.ZipFile(BytesIO(base64.b64decode(json.loads(data)['content'])))


def rels(z, part):
    path = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels')
    if path not in z.namelist():
        return {}
    out = {}
    for r in ET.fromstring(z.read(path)).findall('rel:Relationship', NS):
        target = r.get('Target')
        if r.get('TargetMode') != 'External':
            target = posixpath.normpath(posixpath.join(posixpath.dirname(part), target))
        out[r.get('Id')] = target
    return out


def text_of(node):
    return ''.join(t.text or '' for t in node.iter('{%s}t' % NS['m']))


def col_name(n):
    s = ''
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def cell_sort_key(ref):
    m = re.match(r'([A-Z]+)(\d+)', ref)
    col = 0
    for ch in m.group(1):
        col = col * 26 + ord(ch) - 64
    return int(m.group(2)), col


def main(source, out_dir):
    z = load(source)
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        shared = [text_of(si) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    book_rels = rels(z, 'xl/workbook.xml')
    book = ET.fromstring(z.read('xl/workbook.xml'))
    os.makedirs(os.path.join(out_dir, 'media'), exist_ok=True)
    lines = []
    for sheet in book.find('m:sheets', NS):
        name = sheet.get('name')
        part = book_rels[sheet.get(R_ID)]
        root = ET.fromstring(z.read(part))
        sheet_rels = rels(z, part)
        lines.append(f'# Sheet: {name}')
        merged = [m.get('ref') for m in root.iter('{%s}mergeCell' % NS['m'])]
        if merged:
            lines.append('merged: ' + ', '.join(merged))
        entries = {}
        for c in root.iter('{%s}c' % NS['m']):
            t = c.get('t')
            if t == 'inlineStr':
                value = text_of(c)
            else:
                v = c.find('m:v', NS)
                if v is None or v.text is None:
                    continue
                value = shared[int(v.text)] if t == 's' else v.text
                if t in (None, 'n') and value.endswith('.0'):
                    value = value[:-2]
            if value.strip():
                entries.setdefault(c.get('r'), []).append(value.replace('\\', '\\\\').replace('\n', '\\n'))
        for h in root.iter('{%s}hyperlink' % NS['m']):
            target = sheet_rels.get(h.get(R_ID)) or ('#' + h.get('location', ''))
            entries.setdefault(h.get('ref'), []).append('link: ' + target)
        for d in root.iter('{%s}drawing' % NS['m']):
            drawing = sheet_rels[d.get(R_ID)]
            drawing_rels = rels(z, drawing)
            for anchor in ET.fromstring(z.read(drawing)):
                frm = anchor.find('xdr:from', NS)
                blip = anchor.find('.//a:blip', NS)
                if frm is None or blip is None:
                    continue
                ref = col_name(int(frm.find('xdr:col', NS).text) + 1) + str(int(frm.find('xdr:row', NS).text) + 1)
                media = drawing_rels[blip.get(R_EMBED)]
                fname = f'{re.sub(r"[^A-Za-z0-9_-]", "_", name)}_{ref}_{posixpath.basename(media)}'
                with open(os.path.join(out_dir, 'media', fname), 'wb') as f:
                    f.write(z.read(media))
                entries.setdefault(ref, []).append('image: media/' + fname)
        for ref in sorted(entries, key=cell_sort_key):
            for value in entries[ref]:
                lines.append(f'{name}!{ref}\t{value}')
        lines.append('')
    with open(os.path.join(out_dir, 'sheet.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
