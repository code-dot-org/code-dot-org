#!/usr/bin/env node
// Reports where the DSCO-to-MUI migration stands. It stores nothing: the picture is
// derived from MIGRATION_STATUS.md on a git ref (origin/staging by default) and from
// the open pull requests whose titles the two migration workflows emit. Run it from
// any checkout of the repo; the current branch does not matter.
//
//   node status.mjs [--format slack|slack-md|markdown|json] [--ref origin/staging]
//                   [--no-fetch] [--no-counts]
//
// --no-counts skips the importer count per Not Started component (one git grep each).
// slack is Slack mrkdwn for pasting into the app; slack-md is the standard markdown the
// claude.ai Slack tool takes (links as [#n](url), bold as **text**).

import {execFileSync} from 'node:child_process';

const REPO = 'code-dot-org/code-dot-org';
const LIB = 'frontend/packages/component-library';
const STATUS_DOC = `${LIB}/MIGRATION_STATUS.md`;
const CONSUMER_ROOTS = [
  'apps/src',
  'apps/test',
  'frontend/packages',
  'frontend/apps',
];
const PR_FIELDS =
  'number,title,url,isDraft,baseRefName,headRefName,reviewDecision,reviewRequests,' +
  'reviews,createdAt,updatedAt,author,statusCheckRollup';
// Title shapes come from dsco-mui-design-system-migration.js and dsco-mui-finish-migration.js.
// The button step-4 PR predates the word "legacy" in the finish title, hence the optional group.
const TITLE = {
  designSystem: /^\[Design System\] Add MUI (\S+)/,
  consumers: /^\[MUI Migration\] (\S+) consumers \((\d+)\/(\d+)\)/,
  deleteLegacy: /^\[MUI Migration\] (\S+): delete the (?:legacy )?DSCO source/,
  deferred: /^\[MUI Migration\] (\S+): hand (.+) to MUI$/,
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

function parseArgs(argv) {
  const o = {format: 'slack', ref: 'origin/staging', fetch: true, counts: true};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') o.format = argv[++i];
    else if (a === '--ref') o.ref = argv[++i];
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
// The workflows title PRs with the capitalized directory name: dialog -> Dialog, closeButton -> CloseButton.
const dirName = title => title.charAt(0).toLowerCase() + title.slice(1);
const norm = s =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// ─── Status doc ────────────────────────────────────────────────────────────────

function parseStatusDoc(doc) {
  const rows = [];
  let inTable = false;
  for (const line of doc.split('\n')) {
    if (/^## Component Migration Status/.test(line)) inTable = true;
    else if (/^## /.test(line)) inTable = false;
    if (!inTable) continue;
    const m = /^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|/.exec(line);
    if (m)
      rows.push({component: m[1], status: stripMd(m[2]), mui: stripMd(m[3])});
  }
  if (!rows.length)
    throw new Error(`no component rows found in ${STATUS_DOC} at ${opts.ref}`);
  return rows;
}

function parseDeferredRows(planDoc) {
  if (!planDoc) return [];
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
    if (/^-+$/.test(cells[0] || '')) continue;
    const ticketIdx = header.indexOf('ticket');
    rows.push({
      behavior: stripMd(cells[0]),
      ticket: ticketIdx >= 0 ? stripMd(cells[ticketIdx] || '') : '',
    });
  }
  return rows;
}

function legacyPresent(component) {
  const listing = gitShow(`${LIB}/src/${component}/`);
  // The finish step 4 renames Mui<X>.tsx to <X>.tsx, so a Mui* file means the legacy source still exists.
  return !!listing && /^Mui[A-Z]\w*\.tsx$/m.test(listing);
}

function importerCount(component) {
  const out = run(
    'git',
    [
      'grep',
      '-l',
      '-E',
      `component-library/${component}['"]`,
      opts.ref,
      '--',
      ...CONSUMER_ROOTS,
    ],
    {allowFail: true},
  );
  return out ? out.trim().split('\n').filter(Boolean).length : 0;
}

// ─── Pull requests ─────────────────────────────────────────────────────────────

function classify(pr) {
  let m;
  if ((m = TITLE.designSystem.exec(pr.title)))
    return {kind: 'design-system', component: dirName(m[1])};
  if ((m = TITLE.consumers.exec(pr.title)))
    return {
      kind: 'consumers',
      component: dirName(m[1]),
      index: +m[2],
      total: +m[3],
    };
  if ((m = TITLE.deleteLegacy.exec(pr.title)))
    return {kind: 'delete-legacy', component: dirName(m[1])};
  if ((m = TITLE.deferred.exec(pr.title)))
    return {kind: 'deferred', component: dirName(m[1]), behavior: m[2]};
  return null;
}

function checksState(pr) {
  const items = pr.statusCheckRollup || [];
  let pending = false;
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
    if (it.status && it.status !== 'COMPLETED') pending = true;
    if (['PENDING', 'EXPECTED'].includes(it.state)) pending = true;
  }
  return pending ? 'pending' : items.length ? 'green' : 'none';
}

function decorate(pr) {
  const approvedBy = [
    ...new Set(
      (pr.reviews || [])
        .filter(r => r.state === 'APPROVED')
        .map(r => r.author?.login)
        .filter(Boolean),
    ),
  ];
  const changesBy = [
    ...new Set(
      (pr.reviews || [])
        .filter(r => r.state === 'CHANGES_REQUESTED')
        .map(r => r.author?.login)
        .filter(Boolean),
    ),
  ];
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    author: pr.author?.login || '',
    draft: pr.isDraft,
    base: pr.baseRefName,
    head: pr.headRefName,
    decision: pr.reviewDecision || '',
    approvedBy,
    changesBy,
    requested: (pr.reviewRequests || [])
      .map(r => r.login || r.name)
      .filter(Boolean),
    ageDays: days(pr.createdAt),
    quietDays: days(pr.updatedAt),
    checks: checksState(pr),
    role: classify(pr),
    blockedBy: [],
  };
}

function fetchPRs() {
  const byNumber = new Map();
  for (const q of ['MUI in:title', 'DSCO in:title']) {
    for (const pr of gh([
      'pr',
      'list',
      '--state',
      'open',
      '--limit',
      '200',
      '--search',
      q,
      '--json',
      PR_FIELDS,
    ])) {
      byNumber.set(pr.number, pr);
    }
  }
  const prs = new Map(
    [...byNumber.values()].map(pr => [pr.number, decorate(pr)]),
  );

  // A PR whose base is another open PR's head cannot merge first. Pull in bases the
  // title search missed (a workflow-infra PR, say) so the chain is complete.
  const byHead = new Map([...prs.values()].map(p => [p.head, p]));
  const baseName = opts.ref.replace(/^origin\//, '');
  for (const p of [...prs.values()]) {
    if (p.base === baseName || byHead.has(p.base)) continue;
    const found = gh([
      'pr',
      'list',
      '--state',
      'open',
      '--head',
      p.base,
      '--json',
      PR_FIELDS,
    ]);
    for (const pr of found) {
      const d = decorate(pr);
      prs.set(d.number, d);
      byHead.set(d.head, d);
    }
  }
  for (const p of prs.values()) {
    const chain = [];
    let cur = byHead.get(p.base);
    while (cur && !chain.includes(cur.number)) {
      chain.push(cur.number);
      cur = byHead.get(cur.base);
    }
    p.blockedBy = chain;
  }
  return prs;
}

// ─── Model ─────────────────────────────────────────────────────────────────────

function build() {
  if (opts.fetch)
    git('fetch', '-q', 'origin', opts.ref.replace(/^origin\//, ''));
  const statusDoc = gitShow(STATUS_DOC);
  if (!statusDoc) throw new Error(`${STATUS_DOC} not found at ${opts.ref}`);
  const rows = parseStatusDoc(statusDoc);
  const prs = fetchPRs();
  const all = [...prs.values()];
  const tracked = all.filter(p => p.role);
  const blockerNumbers = new Set(tracked.flatMap(p => p.blockedBy));
  const blocks = n =>
    tracked.filter(p => p.blockedBy.includes(n)).map(p => p.number);

  const components = rows.map(row => {
    const mine = tracked.filter(
      p => p.role.component.toLowerCase() === row.component.toLowerCase(),
    );
    const c = {...row, prs: mine.map(p => p.number), next: [], deferred: []};
    const ds = mine.find(p => p.role.kind === 'design-system');
    const consumers = mine
      .filter(p => p.role.kind === 'consumers')
      .sort((a, b) => a.role.index - b.role.index);
    const del = mine.find(p => p.role.kind === 'delete-legacy');
    const deferredPRs = mine.filter(p => p.role.kind === 'deferred');

    if (/^not started$/i.test(row.status)) {
      if (ds)
        c.next.push(
          `migrate run in flight: DS PR #${ds.number}${consumers.length ? `, consumers ${consumers.map(p => `#${p.number}`).join(' ')}` : ''}`,
        );
      else c.next.push('migrate run');
    } else if (/^in progress$/i.test(row.status)) {
      c.next.push(
        consumers.length
          ? `consumers ${consumers.map(p => `#${p.number}`).join(' ')}`
          : 'consumer sweep not open',
      );
    } else if (/^migrated/i.test(row.status)) {
      if (del) c.next.push(`step 4 delete legacy: #${del.number}`);
      else if (legacyPresent(row.component))
        c.next.push('step 4 delete legacy: not started');
      const plan = gitShow(
        `${LIB}/src/${row.component}/${row.component.toUpperCase().replace(/-/g, '_')}_MIGRATION_TO_MUI.md`,
      );
      for (const d of parseDeferredRows(plan)) {
        const pr = deferredPRs.find(
          p =>
            norm(p.role.behavior).includes(norm(d.behavior)) ||
            norm(d.behavior).includes(norm(p.role.behavior)),
        );
        c.deferred.push({
          behavior: d.behavior,
          ticket: d.ticket,
          pr: pr ? pr.number : null,
        });
      }
    }
    return c;
  });

  if (opts.counts) {
    for (const c of components)
      if (/^not started$/i.test(c.status))
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
  const byAge = (a, b) => a.ageDays - b.ageDays || a.number - b.number;
  const needsReview = listed
    .filter(p => !p.draft && p.decision !== 'APPROVED')
    .sort((a, b) => b.ageDays - a.ageDays);
  const approved = listed
    .filter(p => !p.draft && p.decision === 'APPROVED')
    .sort(byAge);
  const drafts = listed.filter(p => p.draft).sort(byAge);
  const related = all
    .filter(p => !listed.includes(p) && /\b(mui|dsco)\b/i.test(p.title))
    .sort(byAge);

  const withBlocks = p => ({...p, blocks: blocks(p.number)});
  return {
    generatedAt: new Date(now).toISOString(),
    ref: opts.ref,
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

// ─── Rendering ─────────────────────────────────────────────────────────────────

function prFacts(p) {
  const f = [`${p.ageDays}d old`];
  if (p.decision === 'APPROVED')
    f.push(`approved by ${p.approvedBy.join(', ') || '?'}`);
  else if (p.decision === 'CHANGES_REQUESTED')
    f.push(`changes requested by ${p.changesBy.join(', ') || '?'}`);
  else f.push('no approval');
  if (p.requested.length) f.push(`waiting on ${p.requested.join(', ')}`);
  else if (!p.draft && p.decision !== 'APPROVED') f.push('nobody requested');
  if (p.quietDays >= QUIET_DAYS) f.push(`quiet ${p.quietDays}d`);
  if (p.checks === 'red') f.push('checks red');
  if (p.checks === 'pending') f.push('checks pending');
  if (p.blockedBy.length)
    f.push(`blocked by ${p.blockedBy.map(n => `#${n}`).join(' ')}`);
  if (p.blocks.length) f.push(`blocks ${p.blocks.map(n => `#${n}`).join(' ')}`);
  return f.join(', ');
}

function componentLine(c) {
  const bits = [];
  for (const n of c.next) bits.push(n);
  if (c.deferred.length) {
    const open = c.deferred
      .filter(d => d.pr)
      .map(d => `${d.behavior} #${d.pr}`);
    const rest = c.deferred.filter(d => !d.pr).map(d => d.behavior);
    if (open.length) bits.push(`step 5 in review: ${open.join(', ')}`);
    if (rest.length) bits.push(`step 5 not started: ${rest.join(', ')}`);
  }
  return bits.join('; ');
}

function renderSlack(m, md) {
  const link = p => (md ? `[#${p.number}](${p.url})` : `<${p.url}|#${p.number}>`);
  const b = s => (md ? `**${s}**` : `*${s}*`);
  const date = m.generatedAt.slice(0, 10);
  const out = [`${b('DSCO → MUI migration')} · ${date}`];
  out.push(
    Object.entries(m.counts)
      .map(([s, n]) => `${s} ${n}`)
      .join(' · '),
  );

  const section = (title, list) => {
    if (!list.length) return;
    out.push('', b(title));
    for (const p of list) out.push(`• ${link(p)} ${p.title} — ${prFacts(p)}`);
  };
  section('Needs review (oldest first)', m.needsReview);
  section('Approved, waiting to merge', m.approved);
  section('Drafts', m.drafts);

  const inFlight = m.components.filter(
    c =>
      c.prs.length ||
      c.deferred.length ||
      (/^migrated/i.test(c.status) && c.next.length),
  );
  if (inFlight.length) {
    out.push('', b('By component'));
    for (const c of inFlight)
      out.push(`• \`${c.component}\` ${c.status} — ${componentLine(c)}`);
  }

  const queue = m.components.filter(
    c => /^not started$/i.test(c.status) && !c.prs.length,
  );
  if (queue.length) {
    const sorted =
      'importers' in (queue[0] || {})
        ? [...queue].sort((a, b) => a.importers - b.importers)
        : queue;
    out.push(
      '',
      `${b('Not started')} (${sorted.length}${opts.counts ? ', by importing files' : ''})`,
    );
    out.push(
      sorted
        .map(c => (opts.counts ? `${c.component} ${c.importers}` : c.component))
        .join(' · '),
    );
  }

  if (m.related.length) {
    out.push('', b('Other open PRs mentioning MUI or DSCO'));
    for (const p of m.related.slice(0, 8))
      out.push(`• ${link(p)} ${p.title} (${p.author}, ${p.ageDays}d)`);
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
      componentLine(c) ||
      (c.importers !== undefined ? `${c.importers} importing files` : '');
    out.push(
      `| \`${c.component}\` | ${c.status} | ${c.mui} | ${prs} | ${next} |`,
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
