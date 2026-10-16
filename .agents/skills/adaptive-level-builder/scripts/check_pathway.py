#!/usr/bin/env python3
"""Check an adaptive pathway build: its JSON, annotated JSONC, and task list.

usage: check_pathway.py WORKSPACE/<id>.json

Reads <id>.annotated.jsonc and <id>.tasks.md beside the JSON. Mirrors the
shape and reference rules of apps/src/adaptive/schema (not a substitute for
the zod schema, which CI runs), checks every text line of the JSONC carries
a well-formed tag, and that the task list covers every level the pathway
names, every placeholder image, and every TODO. Levels are looked up on
GitHub through repo.py; offline, those checks are skipped with a note.
Exits nonzero on any PROBLEM. Prints TODO paths and task counts.
"""
import json
import os
import re
import sys
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsonc_to_json import strip_line  # noqa: E402
import repo  # noqa: E402

TEXT_KEYS = (
    'title description objective text instructions instructionsPrompt '
    'questionTitle placeholder imageUrl minLabel maxLabel standards'
).split()
TEXT_LINE = re.compile(r'^\s*(?:\{[^"]*)?"(%s)"\s*:' % '|'.join(TEXT_KEYS))
CHOICE_LINE = re.compile(r'^\s*\{\s*"id":\s*"[^"]*",\s*"text":')
TAG = re.compile(r'^\s*//\s*(copied|minimal|modified|todo|generated|unplaced|provided|me):(.*)$')
TEXT_TAGS = {'copied', 'minimal', 'modified', 'todo', 'generated', 'provided', 'me'}
CLOSING_LINE = re.compile(r'^\s*\},?\s*//')
TASK_LINE = re.compile(r'^\s*- \[( |x)\] (?:~~)?\*\*([A-Z]\d+)\*\*')
REGISTRY_ROW = re.compile(r'^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|')


# Mirrors the strict zod objects: required keys (non-empty strings unless in
# MAY_BE_EMPTY), then optional keys.
SHAPES = {
    'pathway': ({'formatVersion', 'id', 'title', 'objective', 'project', 'skills', 'checkpoints'}, set()),
    'project': ({'templateLevel', 'description'}, set()),
    'skill': ({'id', 'title', 'description'}, {'standards'}),
    'checkpoint': ({'id', 'title', 'description', 'steps'}, {'skillIds', 'requires'}),
    'panels': ({'id', 'title', 'kind', 'panels'}, set()),
    'panel': ({'key', 'imageUrl', 'text'}, {'layout', 'typing', 'fadeInOverPrevious'}),
    'questions': ({'id', 'title', 'kind', 'questions'}, {'description'}),
    'MultipleChoiceQuestion': ({'id', 'type', 'questionName', 'questionTitle', 'choices'}, {'correctChoiceId'}),
    'choice': ({'id', 'text'}, set()),
    'freeResponse': ({'id', 'type', 'text'}, {'placeholder'}),
    'scale': ({'id', 'type', 'text', 'scale'}, set()),
    'level': ({'id', 'title', 'kind', 'level'}, {'instructions', 'instructionsPrompt', 'project'}),
}
MAY_BE_EMPTY = {('panel', 'text')}
LAYOUTS = {f'text-{v}-{h}' for v in ('top', 'bottom') for h in ('left', 'center', 'right')}


def shape_problems(p):
    problems = []

    def check(obj, shape, where):
        if not isinstance(obj, dict):
            problems.append(f'{where}: expected an object')
            return
        required, optional = SHAPES[shape]
        for key in sorted(required - obj.keys()):
            problems.append(f'{where}.{key}: missing')
        for key in sorted(obj.keys() - required - optional):
            problems.append(f'{where}.{key}: not allowed')
        for key, value in obj.items():
            if isinstance(value, str) and not value and (shape, key) not in MAY_BE_EMPTY:
                problems.append(f'{where}.{key}: empty')

    check(p, 'pathway', 'pathway')
    if p.get('formatVersion') != 4:
        problems.append('pathway.formatVersion: must be 4')
    check(p.get('project'), 'project', 'project')
    for key, skill in (p.get('skills') or {}).items():
        check(skill, 'skill', f'skills.{key}')
    for i, c in enumerate(p.get('checkpoints') or []):
        cw = f'checkpoints.{i}'
        check(c, 'checkpoint', cw)
        for j, s in enumerate(c.get('steps') or []):
            sw = f'{cw}.steps.{j}'
            kind = s.get('kind')
            if kind not in ('panels', 'questions', 'level'):
                problems.append(f'{sw}.kind: unknown {kind!r}')
                continue
            check(s, kind, sw)
            for k, panel in enumerate(s.get('panels') or []):
                check(panel, 'panel', f'{sw}.panels.{k}')
                if 'layout' in panel and panel['layout'] not in LAYOUTS:
                    problems.append(f'{sw}.panels.{k}.layout: unknown {panel["layout"]!r}')
            for k, q in enumerate(s.get('questions') or []):
                qtype = q.get('type')
                if qtype not in ('MultipleChoiceQuestion', 'freeResponse', 'scale'):
                    problems.append(f'{sw}.questions.{k}.type: unknown {qtype!r}')
                    continue
                check(q, qtype, f'{sw}.questions.{k}')
                if qtype == 'MultipleChoiceQuestion':
                    if not (isinstance(q.get('id'), int) and q['id'] > 0):
                        problems.append(f'{sw}.questions.{k}.id: must be a positive integer')
                    if len(q.get('choices') or []) < 2:
                        problems.append(f'{sw}.questions.{k}.choices: needs at least 2')
                elif not isinstance(q.get('id'), str):
                    problems.append(f'{sw}.questions.{k}.id: must be a string')
                for m, choice in enumerate(q.get('choices') or []):
                    check(choice, 'choice', f'{sw}.questions.{k}.choices.{m}')
            if kind == 'level' and 'project' in s and s['project'] is not True:
                problems.append(f'{sw}.project: must be true or absent')
    return problems


def reference_problems(p):
    problems = []
    for key, skill in p.get('skills', {}).items():
        if skill.get('id') != key:
            problems.append(f'skills.{key}: id does not match key')
    cps = p['checkpoints']
    ids = [c['id'] for c in cps]
    if len(set(ids)) != len(ids):
        problems.append('checkpoints: ids must be unique')
    if not any(not c.get('requires') for c in cps):
        problems.append('checkpoints: no root (every checkpoint has requires)')
    requires = {c['id']: c.get('requires', []) for c in cps}
    for c in cps:
        for r in c.get('requires', []):
            if r not in requires:
                problems.append(f'checkpoints.{c["id"]}.requires: unknown {r}')
        for s in c.get('skillIds', []):
            if s not in p.get('skills', {}):
                problems.append(f'checkpoints.{c["id"]}.skillIds: unknown {s}')

    def reaches_root(cid, path):
        if cid in path or cid not in requires:
            return False
        return all(reaches_root(r, path | {cid}) for r in requires[cid])

    for c in cps:
        if not reaches_root(c['id'], set()):
            problems.append(f'checkpoints.{c["id"]}: can never unlock')

    steps = [(c, s) for c in cps for s in c['steps']]
    step_ids = [s['id'] for _, s in steps]
    if len(set(step_ids)) != len(step_ids):
        problems.append('checkpoints: step ids must be unique across checkpoints')
    if 'project' in step_ids:
        problems.append("checkpoints: step id 'project' is reserved")

    question_ids = []
    used_levels = {}
    template = p['project']['templateLevel']
    for c, s in steps:
        where = f'{c["id"]}/{s["id"]}'
        if s['kind'] == 'questions':
            for q in s['questions']:
                question_ids.append(q['id'])
                if q['type'] != 'MultipleChoiceQuestion':
                    continue
                choice_ids = [ch['id'] for ch in q['choices']]
                if len(set(choice_ids)) != len(choice_ids):
                    problems.append(f'{where}: repeated choice id')
                if 'correctChoiceId' in q and q['correctChoiceId'] not in choice_ids:
                    problems.append(f'{where}: correctChoiceId not a choice')
        if s['kind'] == 'level':
            if s.get('instructionsPrompt') and not s.get('project'):
                problems.append(f'{where}: instructionsPrompt on a non-project step')
            if s['level'] == template:
                problems.append(f'{where}: plays the template level, which only the project view plays')
            if s['level'] in used_levels:
                problems.append(f'{where}: level already played by {used_levels[s["level"]]}')
            used_levels.setdefault(s['level'], where)
    if len(set(map(repr, question_ids))) != len(question_ids):
        problems.append('checkpoints: question ids must be unique')
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
        if not (TEXT_LINE.match(line) or CHOICE_LINE.match(line)):
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
    """The id an open task must name for a TODO at `path`: its step, else
    its checkpoint or skill, else the top-level field."""
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
        if todo_owner(path) not in open_text:
            problems.append(f'tasks: TODO at {path} has no open task naming {todo_owner(path)}')

    created = [n for n, row in registry.items() if row[3].lower().startswith('created')]
    not_found = [n for n in created if files is not None and n not in files]
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
    problems = []
    if p.get('id') != os.path.basename(base):
        problems.append(f'id {p.get("id")!r} does not match the file name {os.path.basename(base)!r}')
    problems += shape_problems(p)
    if problems:
        for problem in problems:
            print('PROBLEM', problem)
        sys.exit(1)
    problems += reference_problems(p)
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
        print('created on levelbuilder, not yet on GitHub staging (normal until the nightly content push):',
              ', '.join(not_found))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
