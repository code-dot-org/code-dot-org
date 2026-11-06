#!/usr/bin/env python3
"""Build the AI level catalog page from the curriculum files in this repository.

Walks every unit of every stable course down to its levels, including the
levels inside BubbleChoice levels, keeps the levels that put an AI model in
front of students, and writes one self-contained HTML page. See README.md.
"""

import argparse
import collections
import datetime
import glob
import html
import json
import os
import re
import subprocess

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
CONFIG = os.path.join(ROOT, 'dashboard', 'config')

# AI Tutor has no per-level model; see apps/src/lab2/ai/ai-tutor-model-id.ts.
TUTOR_MODEL = 'gemini-2.5-flash'
LEGACY_TUTOR_TYPES = ('Applab', 'Gamelab', 'Weblab')
DSL_TYPES = {'bubble_choice': 'BubbleChoice', 'level_group': 'LevelGroup'}
# Routine that the page's refresh button starts; it runs this script and republishes.
REFRESH_TRIGGER_ID = 'trig_01NboV8Qkb5JDCfRXEFkM8TF'


def truthy(v):
    return v in (True, 'true')


def read(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        return f.read()


def load_levels():
    levels = {}
    for path in glob.glob(f'{CONFIG}/levels/**/*.level', recursive=True):
        s = read(path)
        m = re.match(r'\s*<(\w+)', s)
        cm = re.search(r'<config><!\[CDATA\[(.*?)\]\]></config>', s, re.S)
        props = {}
        if cm:
            try:
                props = json.loads(cm.group(1)).get('properties', {})
            except ValueError:
                pass
        levels[os.path.basename(path)[:-len('.level')]] = (m.group(1) if m else '?', props)
    return levels


def load_dsl_levels():
    dsl = {}
    for ext, typ in DSL_TYPES.items():
        for path in glob.glob(f'{CONFIG}/scripts/**/*.{ext}', recursive=True):
            s = read(path)
            m = re.search(r"^name '((?:[^'\\]|\\.)*)'", s, re.M)
            name = m.group(1).replace("\\'", "'") if m else os.path.basename(path)[:-len(ext) - 1]
            subs = [x.replace("\\'", "'") for x in re.findall(r"^\s*level '((?:[^'\\]|\\.)*)'", s, re.M)]
            dsl[name] = (typ, subs)
    return dsl


def load_yaml(path, *keys):
    loader = getattr(yaml, 'CSafeLoader', yaml.SafeLoader)
    with open(path, encoding='utf-8') as f:
        d = yaml.load(f, Loader=loader)
    for k in keys:
        d = d[k]
    return d


def exempt_units():
    s = read(os.path.join(ROOT, 'dashboard', 'app', 'models', 'unit.rb'))
    m = re.search(r'NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS = %w\((.*?)\)', s, re.S)
    return set(m.group(1).split()) if m else set()


def supported_models():
    with open(os.path.join(ROOT, 'apps', 'static', 'aichat', 'modelDescriptions.json')) as f:
        return [m['id'] for m in json.load(f)]


def aichat_models(props, supported):
    """Models an Aichat level can run, resolved as validateModelId.ts does."""
    a = props.get('aichat_settings') or {}
    if isinstance(a, str):
        a = json.loads(a)
    selected = (a.get('initialCustomizations') or {}).get('selectedModelId') or supported[0]
    allowed = a.get('availableModelIds') or []
    visibility = (a.get('visibilities') or {}).get('selectedModelId') or 'readonly'
    candidates = [m for m in supported if not allowed or m in allowed] or [supported[0]]
    if visibility == 'editable':
        return candidates
    if selected in supported and (not allowed or selected in allowed):
        return [selected]
    return [candidates[0]]


def classify(typ, props, unit, exempt, supported):
    """Return (essential, models, via_tutor) for a level with AI, else None."""
    if typ == 'Aichat':
        return 1, aichat_models(props, supported), False
    if typ == 'Weblab2':
        return (0 if unit in exempt else 1), [TUTOR_MODEL], True
    if typ in LEGACY_TUTOR_TYPES and truthy(props.get('ai_tutor_available')):
        return 0, [TUTOR_MODEL], True
    if typ == 'Pythonlab':
        settings = props.get('ai_tutor_prompt_settings') or {}
        if truthy(props.get('ai_tutor_available')) or (isinstance(settings, dict) and settings.get('answerTypes')):
            return 0, [TUTOR_MODEL], True
    return None


def build():
    levels = load_levels()
    dsl = load_dsl_levels()
    exempt = exempt_units()
    supported = supported_models()
    course_titles = load_yaml(f'{CONFIG}/locales/courses/en.yml', 'en', 'data', 'course', 'name')
    unit_titles = load_yaml(f'{CONFIG}/locales/scripts/en.yml', 'en', 'data', 'script', 'name')

    courses = [json.load(open(p)) for p in sorted(glob.glob(f'{CONFIG}/courses/*.course'))]
    stable = [c for c in courses if c.get('published_state') == 'stable']

    tree = collections.OrderedDict()
    model_counts = collections.Counter()
    exempt_count = collections.Counter()
    for course in stable:
        for upos, unit in enumerate(course['script_names'], 1):
            path = f'{CONFIG}/scripts_json/{unit}.script_json'
            if not os.path.exists(path):
                continue
            with open(path) as f:
                ud = json.load(f)
            lessons = {l['key']: l for l in ud['lessons']}
            for sl in ud['script_levels']:
                lesson = lessons.get(sl['seeding_key']['lesson.key'], {})
                keys = sl['level_keys']
                variants = (sl.get('properties') or {}).get('variants') or {}
                for i, key in enumerate(keys):
                    active = variants.get(key, {}).get('active', True) is not False if variants else i == 0
                    if not active:
                        continue
                    if key in dsl:
                        entries = [(sub, key, j) for j, sub in enumerate(dsl[key][1], 1)]
                    else:
                        entries = [(key, None, None)]
                    for name, parent, sub in entries:
                        if name not in levels:
                            continue
                        typ, props = levels[name]
                        ai = classify(typ, props, unit, exempt, supported)
                        if not ai:
                            continue
                        essential, models, via_tutor = ai
                        model_counts.update(models)
                        if typ == 'Weblab2' and unit in exempt:
                            exempt_count[unit] += 1
                        url = (f"/courses/{course['name']}/units/{upos}"
                               f"/lessons/{lesson.get('relative_position')}/levels/{sl['position']}")
                        if sub:
                            url += f'/sublevel/{sub}'
                        lesson_key = (lesson.get('relative_position'), lesson.get('name') or sl['seeding_key']['lesson.key'])
                        tree.setdefault(course['name'], collections.OrderedDict()) \
                            .setdefault((upos, unit), collections.OrderedDict()) \
                            .setdefault(lesson_key, []) \
                            .append([name, typ, essential, models, url, sl['position'], parent, sub, 1 if via_tutor else 0])

    types = sorted({lv[1] for cu in tree.values() for ls in cu.values() for lvs in ls.values() for lv in lvs})
    models = [m for m, _ in model_counts.most_common()]
    type_index = {t: i for i, t in enumerate(types)}
    model_index = {m: i for i, m in enumerate(models)}

    out = []
    for cname, cu in tree.items():
        units = []
        for (upos, uname), ls in sorted(cu.items()):
            lesson_list = []
            for (lpos, lname), lvs in sorted(ls.items(), key=lambda kv: kv[0][0] or 0):
                lvs.sort(key=lambda x: (x[5], x[7] or 0))
                for lv in lvs:
                    lv[1] = type_index[lv[1]]
                    lv[3] = [model_index[m] for m in lv[3]]
                lesson_list.append({'p': lpos, 'n': lname, 'lv': lvs})
            title = ((unit_titles.get(uname) or {}).get('title') or uname).strip()
            units.append({'n': title, 's': uname, 'p': upos, 'L': lesson_list})
        title = ((course_titles.get(cname) or {}).get('title') or cname).strip()
        out.append({'n': title, 's': cname, 'units': units})
    out.sort(key=lambda c: (c['n'].lower(), [-ord(ch) for ch in c['s']]))

    rows = [lv for c in out for u in c['units'] for L in u['L'] for lv in L['lv']]
    totals = {
        'courses': len(out),
        'stableCourses': len(stable),
        'units': sum(len(c['units']) for c in out),
        'levels': len(rows),
        'unique': len({lv[0] for lv in rows}),
        'essential': sum(lv[2] for lv in rows),
        'optional': sum(1 - lv[2] for lv in rows),
        'inChoice': sum(1 for lv in rows if lv[6]),
    }
    return {
        'types': types,
        'models': models,
        'courses': out,
        'totals': totals,
        'modelCounts': [[model_index[m], n] for m, n in model_counts.most_common()],
    }, exempt_count


def git_revision():
    try:
        return subprocess.run(['git', '-C', ROOT, 'rev-parse', '--short=9', 'HEAD'],
                              capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return 'unknown'


def render(data, exempt_count, revision, built_on):
    t = data['totals']
    n = lambda x: f'{x:,}'
    esc = html.escape
    if exempt_count:
        listed = ', '.join(f'<code>{esc(u)}</code> ({n(c)} levels)' for u, c in sorted(exempt_count.items()))
        exempt_note = (f'Today that covers the Web Lab 2 levels in {listed}, which are listed as optional.')
    else:
        exempt_note = 'No unit in a stable course is on that list today.'
    standfirst = (
        f'Every level in a stable course that puts an AI model in front of students: '
        f'<strong>{n(t["essential"])} levels</strong> need AI to work, and '
        f'<strong>{n(t["optional"])}</strong> offer AI Tutor as an optional aid. Each course opens to its units, '
        f'lessons and levels, with the level type, whether AI is essential, the model it runs and a link to the level '
        f'on studio.code.org.')
    method = f"""
<p><strong>Scope.</strong> Every unit in a course whose <code>published_state</code> is <code>stable</code>; <code>Unit#stable?</code> reads the course's state. {n(t['courses'])} of the {n(t['stableCourses'])} stable courses contain an AI level. Pilot, beta, preview, in-development, sunsetting and deprecated courses are left out.</p>
<p><strong>Source.</strong> Built from the curriculum files in the repository (<code>.course</code>, <code>.script_json</code>, <code>.level</code>, <code>.bubble_choice</code>) on <code>staging</code> at <code>{esc(revision)}</code>, not from a database, by <code>tools/scripts/aiLevelCatalog/build.py</code>. Inactive level variants are skipped.</p>
<p><strong>Choice levels.</strong> {n(t['inChoice'])} rows are levels inside a choice level (BubbleChoice). A link labelled <span class="mono-dim">level 4.2</span> opens choice 2 of level 4.</p>
<p><strong>Essential</strong> means the level cannot do its job without AI: <code>Aichat</code> levels, and <code>Weblab2</code> levels, where AI Tutor is on by default and is part of the lab. This matches <code>Level.with_essential_ai_chat_tools</code>, which also names <code>Adaptive</code>; no stable course uses an Adaptive level yet.</p>
<p><strong>Exempt units.</strong> Units listed in <code>Unit::NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS</code> do not count as requiring AI, because their curriculum never asks students to use the tutor. {exempt_note}</p>
<p><strong>Optional</strong> means AI Tutor is available but the level works without it. That holds for App Lab, Game Lab and Web Lab levels with <code>ai_tutor_available</code>, and Python Lab levels with <code>ai_tutor_available</code> or tutor prompt answer types. The tutor appears only when the teacher's section allows AI. Other labs (Music, Ailab, Panels, free response and more) carry the flag on some levels but never show the tutor, so they are left out.</p>
<p><strong>Model.</strong> AI Tutor runs <code>{TUTOR_MODEL}</code> on every level; no level setting changes it. An AI Chat level shows the model it actually runs once unsupported or retired models are filtered out, the same way the lab does when it loads. Where students may pick the model, every model they can pick is listed.</p>
<p><strong>Not counted.</strong> Music Lab's AI song levels in Mix &amp; Move with AI play pre-generated songs from a cache rather than calling a model. Python Lab's spoken theater descriptions are a screen-reader aid that no level setting controls. AI evaluation of free responses is shown to teachers only. Sprite Lab 2 image generation was in no stable course when this tool was written and is not detected.</p>
"""
    footer = (f'<span>Built from <code>staging</code> at <code>{esc(revision)}</code> on {esc(built_on.isoformat())}.</span>'
              '<span>Counts are script levels, so a level used by two units or courses is listed under each.</span>')
    data = dict(data, built={'revision': revision, 'on': built_on.isoformat()})
    page = read(os.path.join(HERE, 'template.html'))
    for key, value in {
        '/*SNAPSHOT*/': esc(built_on.strftime('%B %-d, %Y')),
        '/*STANDFIRST*/': standfirst,
        '/*METHOD*/': method,
        '/*FOOTER*/': footer,
        '/*TRIGGER_ID*/': REFRESH_TRIGGER_ID,
        '/*DATA*/': json.dumps(data, separators=(',', ':')).replace('</', '<\\/'),
    }.items():
        assert key in page, key
        page = page.replace(key, value)
    return page


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', help='path of the HTML page to write')
    args = parser.parse_args()
    data, exempt_count = build()
    page = render(data, exempt_count, git_revision(), datetime.date.today())
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(page)
    t = data['totals']
    print(f"{args.output}: {t['levels']:,} levels ({t['essential']:,} essential) in {t['courses']} courses, "
          f"{os.path.getsize(args.output):,} bytes")


if __name__ == '__main__':
    main()
