#!/usr/bin/env node
// Reports where the DSCO-to-MUI migration stands. It stores nothing: the picture is
// derived from MIGRATION_STATUS.md on a git ref (origin/staging by default), from the
// open pull requests whose titles the two migration workflows emit, and from each
// migrated component's "Deferred changes" table. Run it from any checkout of the
// repo; the current branch does not matter.
//
//   node status.mjs [--format slack|slack-md|markdown|json] [--ref origin/staging]
//                   [--no-fetch] [--no-counts]
//
// --no-counts skips the importer count per Not Started component (one git grep each).
// slack is Slack mrkdwn for pasting into the app; slack-md is the standard markdown the
// claude.ai Slack tool takes (links as [#n](url), bold as **text**).

import {execFileSync} from 'node:child_process';

const OWNER = 'code-dot-org';
const REPO = `${OWNER}/code-dot-org`;
const TRUNK = 'staging';
const LIB = 'frontend/packages/component-library';
const STATUS_DOC = `${LIB}/MIGRATION_STATUS.md`;
const CONSUMER_ROOTS = [
  'apps/src',
  'apps/test',
  'frontend/packages',
  'frontend/apps',
];
const PR_FIELDS =
  'number,title,url,isDraft,baseRefName,headRefName,headRepositoryOwner,' +
  'reviewDecision,reviewRequests,reviews,createdAt,updatedAt,author,statusCheckRollup';
const SEARCH_LIMIT = 200;
// Title shapes come from dsco-mui-design-system-migration.js and
// dsco-mui-finish-migration.js; older step-4 titles lack the word "legacy".
const TITLE = {
  designSystem: /^\[Design System\] Add MUI (\S+)/,
  consumers: /^\[MUI Migration\] (\S+) consumers \((\d+)\/(\d+)\)/,
  deleteLegacy: /^\[MUI Migration\] (\S+): delete the (?:legacy )?DSCO source/,
  deferred: /^\[MUI Migration\] (\S+): hand (.+) to MUI$/,
};
// Components that share a base and migrate in one run, keyed by family member.
const FAMILY = {
  actionDropdown: 'dropdown',
  checkboxDropdown: 'dropdown',
  iconDropdown: 'dropdown',
  simpleDropdown: 'dropdown',
};
const QUIET_DAYS = 7;
const STATE_ORDER = [
  'Migrated',
  'Migrated, behavior pending',
  'In Progress',
  'Not Started',
  'MUI-native',
  'N/A',
];

const opts = parseArgs(process.argv.slice(2));
const now = Date.now();
const warnings = [];

function parseArgs(argv) {
  const o = {format: 'slack', ref: 'origin/staging', fetch: true, counts: true};
  const value = i => {
    if (i >= argv.length) throw new Error(`${argv[i - 1]} needs a value`);
    return argv[i];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') o.format = value(++i);
    else if (a === '--ref') o.ref = value(++i);
    else if (a === '--no-fetch') o.fetch = false;
    else if (a === '--no-counts') o.counts = false;
    else if (a === '--help' || a === '-h') {
      console.log(
        'node status.mjs [--format slack|slack-md|markdown|json] [--ref origin/staging] [--no-fetch] [--no-counts]',
      );
      process.exit(0);
    } else throw new Error(`unknown argument ${a}`);
  }
  if (!['slack', 'slack-md', 'markdown', 'json'].includes(o.format))
    throw new Error(`bad --format ${o.format}`);
  return o;
}

function run(cmd, args, {allowFail = false} = {}) {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 << 20,
    });
  } catch (e) {
    if (allowFail) return null;
    throw new Error(
      `${cmd} ${args.join(' ')} failed: ${e.stderr || e.message}`,
    );
  }
}

const git = (...args) => run('git', args);
const gitShow = path =>
  run('git', ['show', `${opts.ref}:${path}`], {allowFail: true});
const gh = args => JSON.parse(run('gh', ['--repo', REPO, ...args]));

const days = iso => Math.floor((now - Date.parse(iso)) / 86400000);
const stripMd = s => s.replace(/\*\*|`/g, '').trim();
const norm = s =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const same = (a, b) => a.toLowerCase() === b.toLowerCase();

function parseStatusDoc(doc) {
  const rows = [];
  let inTable = false;
  for (const line of doc.split('\n')) {
    if (/^## Component Migration Status/.test(line)) inTable = true;
    else if (/^## /.test(line)) inTable = false;
    if (!inTable) continue;
    const m = /^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/.exec(line);
    if (m)
      rows.push({
        component: m[1],
        status: stripMd(m[2]),
        mui: stripMd(m[3]),
        wrapper: /wrapper/i.test(m[4]),
      });
  }
  if (!rows.length)
    throw new Error(`no component rows found in ${STATUS_DOC} at ${opts.ref}`);
  return rows;
}

function parseDeferredRows(planDoc) {
  const rows = [];
  let inSection = false;
  let header = null;
  for (const line of planDoc.split('\n')) {
    if (/^## Deferred changes/i.test(line)) inSection = true;
    else if (/^## /.test(line)) inSection = false;
    if (!inSection || !line.startsWith('|')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map(c => c.trim());
    if (!header) {
      header = cells.map(norm);
      continue;
    }
    if (/^:?-+:?$/.test(cells[0] || '') || !cells[0]) continue;
    if (norm(cells[0]) === header[0]) continue;
    const ticketIdx = header.indexOf('ticket');
    const ticket = ticketIdx >= 0 ? stripMd(cells[ticketIdx] || '') : '';
    rows.push({
      behavior: stripMd(cells[0]),
      ticket,
      optional: /optional/i.test(ticket),
    });
  }
  return rows;
}

// A wrapper component (dialog) keeps a Mui<X>.tsx twin until step 4 renames it to <X>.tsx;
// a theme-only component (button, tooltip) has no twin, and step 4 leaves no top-level .tsx.
function legacyPresent(row) {
  const listing = gitShow(`${LIB}/src/${row.component}/`);
  if (!listing) return false;
  if (/^Mui[A-Z]\w*\.tsx$/m.test(listing)) return true;
  return !row.wrapper && /^[A-Za-z_]\w*\.tsx$/m.test(listing);
}

function importerCount(component) {
  const out = run(
    'git',
    [
      'grep',
      '-l',
      '-E',
      `component-library/${component}(/[^'"]*)?['"]`,
      opts.ref,
      '--',
      ...CONSUMER_ROOTS,
    ],
    {allowFail: true},
  );
  return out ? out.trim().split('\n').filter(Boolean).length : 0;
}

function classify(pr) {
  let m;
  if ((m = TITLE.designSystem.exec(pr.title)))
    return {kind: 'design-system', component: m[1]};
  if ((m = TITLE.consumers.exec(pr.title)))
    return {kind: 'consumers', component: m[1], index: +m[2], total: +m[3]};
  if ((m = TITLE.deleteLegacy.exec(pr.title)))
    return {kind: 'delete-legacy', component: m[1]};
  if ((m = TITLE.deferred.exec(pr.title)))
    return {kind: 'deferred', component: m[1], behavior: m[2]};
  return null;
}

function checksState(pr) {
  const items = pr.statusCheckRollup || [];
  let pending = false;
  let cancelled = false;
  for (const it of items) {
    const verdict = it.conclusion || it.state || '';
    if (
      [
        'FAILURE',
        'ERROR',
        'TIMED_OUT',
        'ACTION_REQUIRED',
        'STARTUP_FAILURE',
      ].includes(verdict)
    )
      return 'red';
    if (['CANCELLED', 'STALE'].includes(verdict)) cancelled = true;
    if (it.status && it.status !== 'COMPLETED') pending = true;
    if (['PENDING', 'EXPECTED'].includes(it.state)) pending = true;
  }
  if (pending) return 'pending';
  if (cancelled) return 'cancelled';
  return items.length ? 'green' : 'none';
}

const reviewers = (pr, state) => [
  ...new Set(
    (pr.reviews || [])
      .filter(r => r.state === state)
      .map(r => r.author?.login)
      .filter(Boolean),
  ),
];

function decorate(pr) {
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: pr.author?.login || '',
    draft: pr.isDraft,
    base: pr.baseRefName,
    head: pr.headRefName,
    headOwner: pr.headRepositoryOwner?.login || '',
    decision: pr.reviewDecision || '',
    approvedBy: reviewers(pr, 'APPROVED'),
    changesBy: reviewers(pr, 'CHANGES_REQUESTED'),
    requested: (pr.reviewRequests || [])
      .map(r => r.login || r.name)
      .filter(Boolean),
    ageDays: days(pr.createdAt),
    quietDays: days(pr.updatedAt),
    checks: checksState(pr),
    role: classify(pr),
    blockedBy: [],
    orphanBase: false,
  };
}

function fetchPRs() {
  const raw = new Map();
  for (const q of ['MUI in:title', 'DSCO in:title']) {
    const found = gh([
      'pr',
      'list',
      '--state',
      'open',
      '--limit',
      String(SEARCH_LIMIT),
      '--search',
      q,
      '--json',
      PR_FIELDS,
    ]);
    if (found.length >= SEARCH_LIMIT)
      warnings.push(`search "${q}" hit the ${SEARCH_LIMIT} PR limit; the list may be incomplete`);
    for (const pr of found) raw.set(pr.number, pr);
  }
  const prs = new Map([...raw.values()].map(pr => [pr.number, decorate(pr)]));

  // Only branches in this repo can be bases of other PRs here; a fork head named
  // like the trunk must not be mistaken for it.
  const headKey = p => (p.headOwner === OWNER && p.head !== TRUNK ? p.head : null);
  const byHead = new Map();
  const index = p => {
    const k = headKey(p);
    if (k && !byHead.has(k)) byHead.set(k, p);
  };
  for (const p of prs.values()) index(p);

  // A PR based on another open PR's head cannot merge first. The base PR is pulled in
  // when the title search missed it, repeatedly, so a deep stack resolves end to end.
  const queried = new Set();
  let pending = [...prs.values()];
  while (pending.length) {
    const next = [];
    for (const p of pending) {
      if (p.base === TRUNK || byHead.has(p.base) || queried.has(p.base)) continue;
      queried.add(p.base);
      const found = gh([
        'pr',
        'list',
        '--state',
        'open',
        '--head',
        p.base,
        '--json',
        PR_FIELDS,
      ]).filter(pr => pr.headRepositoryOwner?.login === OWNER);
      for (const pr of found) {
        if (prs.has(pr.number)) continue;
        const d = decorate(pr);
        prs.set(d.number, d);
        index(d);
        next.push(d);
      }
    }
    pending = next;
  }
  for (const p of prs.values()) {
    const chain = [];
    let cur = byHead.get(p.base);
    while (cur && !chain.includes(cur.number)) {
      chain.push(cur.number);
      cur = byHead.get(cur.base);
    }
    p.blockedBy = chain;
    p.orphanBase = p.base !== TRUNK && !byHead.has(p.base);
  }
  return prs;
}

function build() {
  if (opts.fetch && opts.ref.startsWith('origin/'))
    git('fetch', '-q', 'origin', opts.ref.slice('origin/'.length));
  const statusDoc = gitShow(STATUS_DOC);
  if (!statusDoc) throw new Error(`${STATUS_DOC} not found at ${opts.ref}`);
  const rows = parseStatusDoc(statusDoc);
  const prs = fetchPRs();
  const all = [...prs.values()];
  const tracked = all.filter(p => p.role);
  const blockerNumbers = new Set(tracked.flatMap(p => p.blockedBy));
  const blocks = n =>
    tracked.filter(p => p.blockedBy.includes(n)).map(p => p.number);
  const nums = list => list.map(p => `#${p.number}`).join(' ');

  const components = rows.map(row => {
    const mine = tracked.filter(p => same(p.role.component, row.component));
    const c = {
      ...row,
      prs: mine.map(p => p.number),
      family: FAMILY[row.component] || null,
      next: [],
      runnable: null,
      deferred: [],
      warnings: [],
    };
    const ds = mine.find(p => p.role.kind === 'design-system');
    const consumers = mine
      .filter(p => p.role.kind === 'consumers')
      .sort((a, b) => a.role.index - b.role.index);
    const del = mine.find(p => p.role.kind === 'delete-legacy');
    const deferredPRs = mine.filter(p => p.role.kind === 'deferred');

    if (c.family) {
      c.next.push(`part of the ${c.family} run`);
    } else if (/^not started/i.test(row.status)) {
      if (ds) {
        c.next.push(
          `migrate run in flight: DS PR #${ds.number}${consumers.length ? `, consumers ${nums(consumers)}` : ''}`,
        );
      } else {
        c.next.push('runnable: migrate run');
        c.runnable = 'migrate';
      }
    } else if (/^in progress/i.test(row.status)) {
      c.next.push(
        consumers.length
          ? `consumers ${nums(consumers)}`
          : 'consumer sweep not open',
      );
    } else if (/^migrated/i.test(row.status)) {
      let step4Done = false;
      if (del) c.next.push(`step 4 delete legacy: #${del.number} in review`);
      else if (legacyPresent(row)) {
        c.next.push('runnable: step 4 delete legacy');
        c.runnable = 'finish';
      } else step4Done = true;

      const planPath = `${LIB}/src/${row.component}/${row.component.toUpperCase().replace(/-/g, '_')}_MIGRATION_TO_MUI.md`;
      const plan = gitShow(planPath);
      const deferredRows = plan ? parseDeferredRows(plan) : [];
      if (/behavior pending/i.test(row.status) && !deferredRows.length)
        c.warnings.push(
          plan
            ? `no Deferred changes rows parsed from ${planPath}`
            : `plan doc missing: ${planPath}`,
        );
      for (const d of deferredRows) {
        const pr = deferredPRs.find(
          p =>
            norm(p.role.behavior).includes(norm(d.behavior)) ||
            norm(d.behavior).includes(norm(p.role.behavior)),
        );
        c.deferred.push({
          ...d,
          pr: pr ? pr.number : null,
          state: pr ? 'in-review' : step4Done ? 'runnable' : 'after-step-4',
        });
      }
      if (step4Done && c.deferred.some(d => d.state === 'runnable'))
        c.runnable = 'finish';
    }
    return c;
  });

  if (opts.counts) {
    for (const c of components)
      if (/^not started/i.test(c.status) && !c.family)
        c.importers = importerCount(c.component);
  }

  const tally = {};
  for (const r of rows) tally[r.status] = (tally[r.status] || 0) + 1;
  const counts = {};
  for (const s of [...STATE_ORDER, ...Object.keys(tally)])
    if (s in tally) counts[s] = tally[s];

  const listed = tracked.concat(
    all.filter(p => blockerNumbers.has(p.number) && !p.role),
  );
  const oldestFirst = (a, b) => b.ageDays - a.ageDays || a.number - b.number;
  const needsReview = listed
    .filter(p => !p.draft && p.decision !== 'APPROVED')
    .sort(oldestFirst);
  const approved = listed
    .filter(p => !p.draft && p.decision === 'APPROVED')
    .sort(oldestFirst);
  const drafts = listed.filter(p => p.draft).sort(oldestFirst);
  const related = all
    .filter(p => !listed.includes(p) && /\b(mui|dsco)\b/i.test(p.title))
    .sort(oldestFirst);

  const withBlocks = p => ({...p, blocks: blocks(p.number)});
  return {
    generatedAt: new Date(now).toISOString(),
    ref: opts.ref,
    warnings,
    counts,
    needsReview: needsReview.map(withBlocks),
    approved: approved.map(withBlocks),
    drafts: drafts.map(withBlocks),
    related: related.map(p => ({
      number: p.number,
      title: p.title,
      url: p.url,
      author: p.author,
      ageDays: p.ageDays,
    })),
    components,
  };
}

function prFacts(p) {
  const f = [`${p.ageDays}d old`];
  if (p.decision === 'APPROVED')
    f.push(`approved by ${p.approvedBy.join(', ') || '?'}`);
  else if (p.decision === 'CHANGES_REQUESTED')
    f.push(`changes requested by ${p.changesBy.join(', ') || '?'}`);
  else if (p.approvedBy.length)
    f.push(`approved by ${p.approvedBy.join(', ')}, review still required`);
  else f.push('no approval');
  if (p.decision !== 'APPROVED') {
    if (p.requested.length) f.push(`waiting on ${p.requested.join(', ')}`);
    else if (!p.draft) f.push('nobody requested');
  }
  if (p.quietDays >= QUIET_DAYS) f.push(`quiet ${p.quietDays}d`);
  if (p.checks === 'red') f.push('checks red');
  if (p.checks === 'pending') f.push('checks pending');
  if (p.checks === 'cancelled') f.push('checks cancelled or stale');
  if (p.blockedBy.length)
    f.push(`blocked by ${p.blockedBy.map(n => `#${n}`).join(' ')}`);
  if (p.orphanBase) f.push(`base ${p.base} has no open PR`);
  if (p.blocks.length) f.push(`blocks ${p.blocks.map(n => `#${n}`).join(' ')}`);
  return f.join(', ');
}

const deferredLabel = d => {
  const ticket = d.ticket.replace(/\s*\((optional)\)/i, ', $1');
  return d.behavior + (ticket ? ` (${ticket})` : d.optional ? ' (optional)' : '');
};

function componentLine(c) {
  const bits = [...c.next];
  const group = (state, label) => {
    const rows = c.deferred.filter(d => d.state === state);
    if (rows.length)
      bits.push(
        `${label}: ${rows.map(d => (d.pr ? `${deferredLabel(d)} #${d.pr}` : deferredLabel(d))).join(', ')}`,
      );
  };
  group('in-review', 'step 5 in review');
  group('runnable', 'runnable: step 5');
  group('after-step-4', 'step 5 after step 4');
  for (const w of c.warnings) bits.push(`warning: ${w}`);
  return bits.join('; ');
}

const escapeMrkdwn = s =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeCell = s => s.replace(/\|/g, '\\|');

function queueLine(m) {
  const queue = m.components.filter(
    c => /^not started/i.test(c.status) && !c.prs.length && !c.family,
  );
  if (!queue.length) return null;
  const members = c =>
    Object.keys(FAMILY).filter(k => FAMILY[k] === c.component);
  const name = c =>
    members(c).length ? `${c.component} (+${members(c).length} family)` : c.component;
  const sorted = opts.counts
    ? [...queue].sort((a, b) => a.importers - b.importers)
    : queue;
  return {
    title: `(${sorted.length}${opts.counts ? ', by importing files' : ''})`,
    body: sorted
      .map(c => (opts.counts ? `${name(c)} ${c.importers}` : name(c)))
      .join(' · '),
  };
}

function renderSlack(m, md) {
  const link = p => (md ? `[#${p.number}](${p.url})` : `<${p.url}|#${p.number}>`);
  const b = s => (md ? `**${s}**` : `*${s}*`);
  const text = md ? s => s : escapeMrkdwn;
  const date = m.generatedAt.slice(0, 10);
  const out = [`${b('DSCO → MUI migration')} · ${date}`];
  out.push(
    Object.entries(m.counts)
      .map(([s, n]) => `${s} ${n}`)
      .join(' · '),
  );
  for (const w of m.warnings) out.push(`warning: ${text(w)}`);

  const section = (title, list) => {
    if (!list.length) return;
    out.push('', b(title));
    for (const p of list)
      out.push(`• ${link(p)} ${text(p.title)} — ${text(prFacts(p))}`);
  };
  section('Needs review (oldest first)', m.needsReview);
  section('Approved, waiting to merge', m.approved);
  section('Drafts', m.drafts);

  const inFlight = m.components.filter(
    c =>
      !c.family &&
      (c.prs.length ||
        c.deferred.length ||
        c.warnings.length ||
        (/^migrated/i.test(c.status) && c.next.length)),
  );
  if (inFlight.length) {
    out.push('', b('By component'));
    for (const c of inFlight)
      out.push(`• \`${c.component}\` ${c.status} — ${text(componentLine(c))}`);
  }

  const queue = queueLine(m);
  if (queue) out.push('', `${b('Not started')} ${queue.title}`, queue.body);

  if (m.related.length) {
    out.push('', b('Other open PRs mentioning MUI or DSCO'));
    for (const p of m.related.slice(0, 8))
      out.push(`• ${link(p)} ${text(p.title)} (${p.author}, ${p.ageDays}d)`);
  }
  return out.join('\n');
}

function renderMarkdown(m) {
  const link = p => `[#${p.number}](${p.url})`;
  const out = [`# DSCO → MUI migration · ${m.generatedAt.slice(0, 10)}`, ''];
  out.push(
    Object.entries(m.counts)
      .map(([s, n]) => `${s} ${n}`)
      .join(' · '),
    '',
  );
  for (const w of m.warnings) out.push(`> warning: ${w}`, '');
  const section = (title, list) => {
    if (!list.length) return;
    out.push(`## ${title}`, '');
    for (const p of list) out.push(`- ${link(p)} ${p.title} — ${prFacts(p)}`);
    out.push('');
  };
  section('Needs review (oldest first)', m.needsReview);
  section('Approved, waiting to merge', m.approved);
  section('Drafts', m.drafts);

  out.push(
    '## Components',
    '',
    '| Component | Status | MUI | Open PRs | Next |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const c of m.components) {
    if (/^(n\/a|mui-native)$/i.test(c.status)) continue;
    const prs = c.prs.map(n => `#${n}`).join(' ');
    const next =
      componentLine(c) +
      (c.importers !== undefined ? ` (${c.importers} importing files)` : '');
    out.push(
      `| \`${c.component}\` | ${c.status} | ${escapeCell(c.mui)} | ${prs} | ${escapeCell(next)} |`,
    );
  }
  out.push('');
  if (m.related.length) {
    out.push('## Other open PRs mentioning MUI or DSCO', '');
    for (const p of m.related)
      out.push(`- ${link(p)} ${p.title} (${p.author}, ${p.ageDays}d)`);
    out.push('');
  }
  return out.join('\n');
}

const model = build();
if (opts.format === 'json') console.log(JSON.stringify(model, null, 2));
else if (opts.format === 'markdown') console.log(renderMarkdown(model));
else console.log(renderSlack(model, opts.format === 'slack-md'));
