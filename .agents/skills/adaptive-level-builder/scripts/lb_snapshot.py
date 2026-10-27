#!/usr/bin/env python3
"""Split and compare levelbuilder snapshots taken with lb_fetch.js.

usage: lb_snapshot.py split RAW.json DIR [PREFIX]
       lb_snapshot.py diff OLD_DIR NEW_DIR

split writes DIR/pathway.json, DIR/levels/<name>.json and DIR/fetched.txt
from the browser fetch. Each level file holds {id, type, properties}, with
the top-level property names in snake_case as in a .level file, so that
LEVELS_SNAPSHOT=DIR/levels makes repo.py read levels from it. Only levels
whose name starts with PREFIX (default: the fetch's prefix) are kept, plus
any level the pathway names.

diff prints the levels added, removed or changed between two split
snapshots, naming the changed properties, and whether the pathway changed.
"""
import json
import os
import re
import sys

# Fields level_properties adds for the lab, not saved on the level.
RUNTIME_KEYS = {
    'name', 'id', 'type', 'appName', 'useRestrictedSongs', 'usesProjects', 'finishUrl',
    'baseAssetUrl', 'isAssessment', 'enableBlocklyKeyboardNavigation', 'offerBrowserTts',
    'helpVideos', 'templateSources', 'showExemplarLink', 'levelData',
}


def snake(key):
    return re.sub(r'(?<=[a-z0-9])([A-Z])', r'_\1', key).lower()


def pathway_level_names(p):
    if not isinstance(p, dict) or '__status' in p:
        return set()
    names = {(p.get('project') or {}).get('templateLevel')}
    for c in p.get('checkpoints', []):
        names.update(s.get('level') for s in c.get('steps', []) if s.get('kind') == 'level')
    return names - {None}


def split(raw_path, out_dir, prefix=None):
    raw = json.load(open(raw_path, encoding='utf-8'))
    prefix = prefix or raw['prefix']
    adaptive = raw.get('adaptiveLevels') or []
    if isinstance(adaptive, dict):
        adaptive = adaptive.get('levels', [])
    wanted = pathway_level_names(raw['pathway'])
    levels_dir = os.path.join(out_dir, 'levels')
    os.makedirs(levels_dir, exist_ok=True)
    for f in os.listdir(levels_dir):
        os.remove(os.path.join(levels_dir, f))
    kept = []
    for lid, props in raw['levels'].items():
        name = props.get('name', '')
        if not (name.startswith(prefix) or name in wanted):
            continue
        level = {
            'id': int(lid),
            'type': props.get('type'),
            'properties': {snake(k): v for k, v in props.items() if k not in RUNTIME_KEYS},
        }
        with open(os.path.join(levels_dir, name + '.json'), 'w', encoding='utf-8') as f:
            json.dump(level, f, indent=2, ensure_ascii=False)
        kept.append(name)
    with open(os.path.join(out_dir, 'pathway.json'), 'w', encoding='utf-8') as f:
        json.dump(raw['pathway'], f, indent=2, ensure_ascii=False)
    missing = sorted(wanted - set(kept))
    with open(os.path.join(out_dir, 'fetched.txt'), 'w', encoding='utf-8') as f:
        f.write(f"levelbuilder-studio.code.org as {raw.get('user', 'a levelbuilder')}, {raw['fetchedAt']}\n")
        f.write(f"pathway {raw.get('pathwayId') or raw['pathway'].get('id')}; "
                f"{len(kept)} levels named {prefix}* or in the pathway\n")
        f.write('Adaptive levels: ' + ', '.join(f"{l['name']} ({l['id']})" for l in adaptive) + '\n')
        if missing:
            f.write('named by the pathway but not found: ' + ', '.join(missing) + '\n')
    print(open(os.path.join(out_dir, 'fetched.txt')).read(), end='')


def load_dir(d):
    levels_dir = os.path.join(d, 'levels')
    levels = {f[:-5]: json.load(open(os.path.join(levels_dir, f), encoding='utf-8'))
              for f in os.listdir(levels_dir) if f.endswith('.json')}
    return levels, json.load(open(os.path.join(d, 'pathway.json'), encoding='utf-8'))


def diff(old_dir, new_dir):
    old, old_p = load_dir(old_dir)
    new, new_p = load_dir(new_dir)
    for name in sorted(set(old) | set(new)):
        a, b = old.get(name), new.get(name)
        if a is None:
            print(f'added    {name} ({b["type"]}, {b["id"]})')
        elif b is None:
            print(f'removed  {name}')
        else:
            pa, pb = a['properties'], b['properties']
            changed = sorted(k for k in set(pa) | set(pb) if pa.get(k) != pb.get(k))
            if changed:
                print(f'changed  {name} ({b["id"]}): {", ".join(changed)}')
    print('pathway: ' + ('unchanged' if old_p == new_p else 'changed'))


if __name__ == '__main__':
    if len(sys.argv) in (4, 5) and sys.argv[1] == 'split':
        split(*sys.argv[2:])
    elif len(sys.argv) == 4 and sys.argv[1] == 'diff':
        diff(*sys.argv[2:])
    else:
        sys.exit(__doc__)
