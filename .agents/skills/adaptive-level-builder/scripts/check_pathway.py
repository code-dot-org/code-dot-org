#!/usr/bin/env python3
"""Check an adaptive pathway build: its JSON, annotated JSONC, and task list.

usage: check_pathway.py WORKSPACE/<id>.json

Reads <id>.annotated.jsonc and <id>.tasks.md beside the JSON. Validates the
JSON with the zod schema itself through validate_pathway.mjs (needs Node;
without it, only the structure the other checks read), checks every text
line of the JSONC carries a well-formed tag, and that the task list covers
every level the pathway names, every placeholder image, and every TODO. Levels are looked up on
GitHub through repo.py; offline, those checks are skipped with a note.
Video keys are checked against dashboard/config/videos.csv the same way.
Exits nonzero on any PROBLEM. Prints TODO paths and task counts.
"""
import csv
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsonc_to_json import strip_line  # noqa: E402
import repo  # noqa: E402

TEXT_KEYS = (
    'title description objective text instructions instructionsPrompt '
    'questionTitle placeholder imageUrl standards'
).split()
TEXT_LINE = re.compile(r'^\s*(?:\{[^"]*)?"(%s)"\s*:' % '|'.join(TEXT_KEYS))
# A skill's evidence level description: a digit key with a string value.
EVIDENCE_TEXT_LINE = re.compile(r'^\s*"(0|[1-9]\d*)"\s*:\s*"')
CHOICE_LINE = re.compile(r'^\s*\{\s*"id":\s*"[^"]*",\s*"text":')
TAG = re.compile(r'^\s*//\s*(copied|minimal|modified|todo|generated|unplaced|provided|me):(.*)$')
TEXT_TAGS = {'copied', 'minimal', 'modified', 'todo', 'generated', 'provided', 'me'}
CLOSING_LINE = re.compile(r'^\s*\},?\s*//')
TASK_LINE = re.compile(r'^\s*- \[( |x)\] (?:~~)?\*\*([A-Z]\d+)\*\*')
REGISTRY_ROW = re.compile(r'^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|')


def schema_problems(json_path):
    """Problems from the zod schema itself (validate_pathway.mjs), or None,
    with a note printed, when it cannot run."""
    node = shutil.which('node')
    if not node:
        print('note: schema check skipped, Node is not installed; CI runs it (contentFilesTest.ts)')
        return None
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'validate_pathway.mjs')
    try:
        out = subprocess.run([node, script, json_path], capture_output=True, text=True, timeout=600)
        result = json.loads(out.stdout.strip().splitlines()[-1])
    except (subprocess.TimeoutExpired, IndexError, ValueError) as e:
        print(f'note: schema check skipped, the validator failed ({e}); CI runs it (contentFilesTest.ts)')
        return None
    if 'skipped' in result:
        print(f'note: schema check skipped, {result["skipped"]}; CI runs it (contentFilesTest.ts)')
        return None
    return result['problems']


def structure_problems(p):
    """Only what the checks below need to read the file, for when the schema
    check cannot run. Not a substitute for it."""
    if not isinstance(p, dict) or not isinstance(p.get('checkpoints'), list):
        return ['pathway: expected an object with a checkpoints list']
    if not isinstance(p.get('project'), dict) or not isinstance(p['project'].get('templateLevel'), str):
        return ['project.templateLevel: missing']
    problems = []
    for i, c in enumerate(p['checkpoints']):
        if not (isinstance(c, dict) and isinstance(c.get('steps'), list)):
            problems.append(f'checkpoints.{i}: expected an object with a steps list')
            continue
        for j, s in enumerate(c['steps']):
            if not (isinstance(s, dict) and 'kind' in s and 'id' in s):
                problems.append(f'checkpoints.{i}.steps.{j}: expected an object with id and kind')
            elif s['kind'] == 'level' and not isinstance(s.get('level'), str):
                problems.append(f'checkpoints.{i}.steps.{j}.level: missing')
            elif s['kind'] == 'video' and not isinstance(s.get('videoKey'), str):
                problems.append(f'checkpoints.{i}.steps.{j}.videoKey: missing')
    return problems


def pathway_levels(p):
    """(name, role, used by) for the template and every level step."""
    out = [(p['project']['templateLevel'], 'template', 'project')]
    for c in p['checkpoints']:
        for s in c['steps']:
            if s['kind'] == 'level':
                out.append((s['level'], 'project' if s.get('project') else 'sandbox', f'{c["id"]}/{s["id"]}'))
    return out


def level_problems(p, files):
    problems = []
    template = p['project']['templateLevel']
    for name, role, where in pathway_levels(p):
        if name not in files:
            continue
        template_name = (repo.level_json(name, files) or {}).get('properties', {}).get('project_template_level_name')
        if role == 'template':
            if template_name:
                problems.append(f'template {name} itself names a project template ({template_name})')
        elif (template_name == template) != (role == 'project'):
            problems.append(f'{where}: project flag disagrees with level {name} '
                            f'(its project template is {template_name or "unset"})')
    return problems


def annotation_problems(jsonc_path):
    problems = []
    placeholder_keys = []
    lines = open(jsonc_path, encoding='utf-8').read().split('\n')
    last_key = None
    for n, line in enumerate(lines):
        km = re.match(r'^\s*"key":\s*"([^"]+)"', line)
        if km:
            last_key = km.group(1)
        m = TAG.match(line)
        if m:
            tag, body = m.group(1), m.group(2)
            if tag == 'modified' and not ('was: "' in body and 'why:' in body):
                problems.append(f'{jsonc_path}:{n + 1}: modified needs was: "..." and why:')
            if tag == 'minimal' and 'changes:' not in body:
                problems.append(f'{jsonc_path}:{n + 1}: minimal needs changes:')
        if not (TEXT_LINE.match(line) or CHOICE_LINE.match(line) or EVIDENCE_TEXT_LINE.match(line)):
            continue
        code, trailing = strip_line(line)
        tags = []
        if trailing:
            m = TAG.match('//' + line[len(code):].split('//', 1)[1])
            tags.append(m.group(1) if m else None)
        # A formatter that wraps a one-line choice moves its comment to the closing brace.
        if n + 1 < len(lines) and CLOSING_LINE.match(lines[n + 1]):
            m = TAG.match('//' + lines[n + 1].split('//', 1)[1])
            tags.append(m.group(1) if m else None)
        k = n - 1
        while k >= 0 and lines[k].lstrip().startswith('//'):
            m = TAG.match(lines[k])
            tags.append(m.group(1) if m else None)
            k -= 1
        text_tags = [t for t in tags if t in TEXT_TAGS]
        if not text_tags:
            problems.append(f'{jsonc_path}:{n + 1}: text line has no annotation')
        elif 'todo' in text_tags and '"imageUrl"' in code:
            placeholder_keys.append(last_key)
        elif 'todo' in text_tags and 'TODO' not in code:
            problems.append(f'{jsonc_path}:{n + 1}: todo line has no visible TODO')
        elif 'generated' in text_tags and '"instructionsPrompt"' not in code and \
                "at the user's request" not in ' '.join(lines[max(0, n - 3):n + 1]):
            problems.append(f'{jsonc_path}:{n + 1}: generated is only for instructionsPrompt, or text the user asked for')
    return problems, placeholder_keys


def todo_paths(node, path=''):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from todo_paths(v, f'{path}.{k}' if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            key = v.get('id', i) if isinstance(v, dict) else i
            yield from todo_paths(v, f'{path}.{key}')
    elif isinstance(node, str) and 'TODO' in node:
        yield path


def todo_owner(path):
    """The id an open task must name, in backticks, for a TODO at `path`:
    its step, else its checkpoint or skill, else the top-level field."""
    parts = path.split('.')
    if parts[0] == 'checkpoints':
        return parts[3] if len(parts) > 3 and parts[2] == 'steps' else parts[1]
    if parts[0] == 'skills':
        return parts[1]
    return parts[0]


def task_problems(p, tasks_path, placeholder_keys, files):
    problems = []
    text = open(tasks_path, encoding='utf-8').read()
    lines = text.split('\n')
    tasks = [TASK_LINE.match(l) for l in lines]
    tasks = [(m.group(2), m.group(1) == 'x', l) for m, l in zip(tasks, lines) if m]
    ids = [t[0] for t in tasks]
    for dup in sorted({i for i in ids if ids.count(i) > 1}):
        problems.append(f'tasks: id {dup} is used more than once')
    # An open task's text includes its indented detail lines.
    open_lines, current_open = [], False
    for line in lines:
        m = TASK_LINE.match(line)
        if m:
            current_open = m.group(1) == ' '
        elif not line.startswith((' ', '\t')):
            current_open = False
        if current_open:
            open_lines.append(line)
    open_text = '\n'.join(open_lines)

    registry = {}
    for line in lines:
        m = REGISTRY_ROW.match(line)
        if m and m.group(1) != 'Level name':
            registry[m.group(1)] = [g.strip() for g in m.groups()[1:]]
    wanted = pathway_levels(p)
    names = {name for name, _, _ in wanted}
    for name, role, where in wanted:
        if name not in registry:
            problems.append(f'tasks: level {name} ({role}, {where}) has no row in the Levels table')
        elif f'`{name}`' not in text.replace(registry_row_text(lines, name), ''):
            problems.append(f'tasks: level {name} has a row but no task')
    for name in registry:
        if name not in names:
            problems.append(f'tasks: Levels table lists {name}, which the pathway no longer names')
    for key in placeholder_keys:
        if key and key not in text:
            problems.append(f'tasks: placeholder image on panel {key} has no task')
    for key in placeholder_keys:
        if key and key in text and key not in open_text:
            problems.append(f'tasks: panel {key} still has a placeholder image but its task is checked off')
    for path in todo_paths(p):
        if f'`{todo_owner(path)}`' not in open_text:
            problems.append(f'tasks: TODO at {path} has no open task naming `{todo_owner(path)}`')

    not_found = []
    if files is not None:
        for name in sorted(names - files.keys()):
            status = registry.get(name, ['', '', ''])[2].lower()
            if status.startswith('exists'):
                problems.append(f'tasks: level {name} is listed as existing, but GitHub staging has no '
                                'level by that name; check the spelling')
            else:
                not_found.append(name)
    done = sum(1 for _, d, _ in tasks if d)
    return problems, len(tasks) - done, done, not_found


def registry_row_text(lines, name):
    for line in lines:
        m = REGISTRY_ROW.match(line)
        if m and m.group(1) == name:
            return line
    return ''


def main(json_path):
    base = json_path[:-len('.json')]
    jsonc_path, tasks_path = base + '.annotated.jsonc', base + '.tasks.md'
    p = json.load(open(json_path, encoding='utf-8'))
    problems = schema_problems(json_path)
    if problems is None:
        problems = structure_problems(p)
        if isinstance(p, dict) and p.get('id') != os.path.basename(base):
            problems.append(f'id {p.get("id")!r} does not match the file name {os.path.basename(base)!r}')
    if problems:
        # The checks below assume a valid pathway.
        for problem in problems:
            print('PROBLEM', problem)
        sys.exit(1)
    try:
        files = repo.level_index()
        problems += level_problems(p, files)
    except (urllib.error.URLError, OSError, ValueError) as e:
        files = None
        print(f'note: level checks skipped, GitHub unreachable ({e})')

    from jsonc_to_json import main as convert
    tmp = json_path + '.check.tmp'
    try:
        convert(jsonc_path, tmp)
        if json.load(open(tmp, encoding='utf-8')) != p:
            problems.append('the JSONC without comments does not match the JSON; regenerate it')
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    ann, placeholder_keys = annotation_problems(jsonc_path)
    problems += ann

    open_count = done = 0
    not_found = []
    if os.path.exists(tasks_path):
        tp, open_count, done, not_found = task_problems(p, tasks_path, placeholder_keys, files)
        problems += tp
    else:
        problems.append(f'{tasks_path} is missing')

    for problem in problems:
        print('PROBLEM', problem)
    todos = list(todo_paths(p))
    print('TODO values:', len(todos))
    for path in todos:
        print('  ', path)
    print('placeholder images:', len(placeholder_keys))
    print(f'tasks: {open_count} open, {done} done')
    if not_found:
        print('not yet on GitHub staging (normal until the nightly content push after each is created;',
              'publishing fails its tests until they are):', ', '.join(not_found))
    if files is not None:
        missing_videos = video_keys_not_on_github(p)
        if missing_videos:
            print('video keys not in dashboard/config/videos.csv on GitHub staging (normal until the',
                  'content push after the video is added; check the spelling):', ', '.join(missing_videos))
    sys.exit(1 if problems else 0)


def video_keys_not_on_github(p):
    keys = sorted({s['videoKey'] for c in p['checkpoints'] for s in c['steps'] if s['kind'] == 'video'})
    if not keys:
        return []
    try:
        known = {row['Key'] for row in csv.DictReader(io.StringIO(repo.cat('dashboard/config/videos.csv')))}
    except (urllib.error.URLError, OSError) as e:
        print(f'note: video check skipped, GitHub unreachable ({e})')
        return []
    return [k for k in keys if k not in known]


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
