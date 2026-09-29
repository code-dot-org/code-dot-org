export const meta = {
  name: 'dsco-mui-finish-migration',
  description:
    'Finish a DSCO-to-MUI migration one PR at a time: delete the legacy DSCO source (lifecycle step 4), or hand one deferred behavior to MUI (step 5)',
  whenToUse:
    'After dsco-mui-design-system-migration has moved every consumer and those PRs have merged; run once per remaining step',
  phases: [
    {title: 'Discover', detail: 'preconditions, the plan doc, the Deferred changes table, which step is next'},
    {title: 'Execute', detail: 'the one step: delete the legacy source, or adopt one deferred MUI behavior'},
    {title: 'Verify', detail: 'package and apps checks, UI-test hooks, import audit; heal loop'},
    {title: 'Publish', detail: 'one branch, one commit, one draft PR'},
  ],
}

// Finishes what dsco-mui-design-system-migration starts. That run moves every consumer
// and keeps the legacy behavior the plan chose not to change, listing each such behavior
// in the "Deferred changes" table of <component>/<COMPONENT>_MIGRATION_TO_MUI.md. This
// run does exactly one of the remaining steps and opens one PR for it:
//
//   - step 4, delete-legacy: remove the deprecated DSCO source and exports, give the MUI
//     version the plain names, rewrite consumer imports with the component's codemod,
//     and drop the eslint ban. Behavior does not change.
//   - step 5, one table row: turn the MUI behavior on, delete what stood in for it,
//     update the unit tests and the UI-test hooks the row names, and delete the row. The
//     status row becomes Migrated when the table is empty.
//
// Eyes and the test build see a behavior change only after a push, so this run cannot
// prove one; the PR says which runs are required before merge.
//
// args: the component directory name, or an object:
//   Workflow({name: 'dsco-mui-finish-migration', args: 'dialog'})
//   Workflow({name: 'dsco-mui-finish-migration',
//             args: {component: 'dialog', step: 'Focus trap', jira: 'RE-216'}})
//
//   component     required.
//   step          'delete-legacy', or a Behavior cell of the Deferred changes table
//                 (case-insensitive). Default: the next step Discover finds.
//   base          branch the PR targets and HEAD must sit on (default 'staging'). A
//                 local-only branch works with publish: false, to stack a dry run on one.
//   branchPrefix  branch namespace (default '<owner>/mui-<component>').
//   jira          ticket key or browse URL for the commit and PR (default none).
//   publish       false leaves one local branch: no push, no PR.
//   maxHealAttempts  heal loop budget (default 3).
//
// Run from a checkout that has apps/node_modules, frontend/node_modules and apps/build,
// with no tracked modifications, on base.
const a = typeof args === 'string' ? {component: args.trim()} : args || {}
const component = a.component
if (!component || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(component)) {
  throw new Error('args must name one DSCO component directory, e.g. "dialog" or {component: "dialog"}')
}
const refName = (v, name) => {
  if (v === undefined) return undefined
  if (typeof v !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(v) || v.includes('..') || v.endsWith('/')) {
    throw new Error(`${name} must be a plain git ref name, got ${JSON.stringify(v)}`)
  }
  return v
}
const base = refName(a.base, 'base') || 'staging'
const branchPrefixArg = refName(a.branchPrefix, 'branchPrefix')
// Spliced into prompts, so only a table cell's worth of plain text.
const stepArg = a.step === undefined ? '' : a.step
if (typeof stepArg !== 'string' || !/^[A-Za-z0-9 `'().,/-]{0,80}$/.test(stepArg)) {
  throw new Error(`step must be 'delete-legacy' or a Behavior cell of the Deferred changes table, got ${JSON.stringify(a.step)}`)
}
const jira = a.jira === undefined ? '' : a.jira
if (jira !== '' && !(typeof jira === 'string' && /^(https:\/\/[a-z0-9.-]+\.atlassian\.net\/browse\/)?[A-Z][A-Z0-9]+-\d+$/.test(jira))) {
  throw new Error(`jira must be a ticket key like RE-216 or its Atlassian browse URL, got ${JSON.stringify(jira)}`)
}
const jiraKey = jira ? jira.replace(/^.*\//, '') : ''
const publish = a.publish !== false
const maxHealAttempts =
  a.maxHealAttempts === undefined ? 3 : Number.isInteger(a.maxHealAttempts) && a.maxHealAttempts > 0 ? a.maxHealAttempts : null
if (maxHealAttempts === null) throw new Error('maxHealAttempts must be a positive integer')

const LIB = 'frontend/packages/component-library'
const LIB_SRC = `${LIB}/src`
const COMPONENT_DIR = `${LIB_SRC}/${component}`
const STATUS_DOC = `${LIB}/MIGRATION_STATUS.md`
const CODEMODS_DIR = `${LIB}/codemods`
const STORYBOOK = 'frontend/apps/design-system-storybook'
const SKILL_DOC = '.agents/skills/design-system/SKILL.md'
const ESLINT_APPS = 'apps/.eslintrc.js'
const PLAN_DOC = `${COMPONENT_DIR}/${component.toUpperCase().replace(/-/g, '_')}_MIGRATION_TO_MUI.md`
const UI_TEST_DIRS = 'dashboard/test/ui/features, dashboard/test/ui/step_definitions and frontend/packages/e2e-tests/tests'
const COMMIT_TRAILER = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
const PR_FOOTER = '🤖 Generated with [Claude Code](https://claude.com/claude-code)'
// Aliases, so each resolves to the current release. Discover gathers facts on Sonnet;
// code, gates and git run on Opus. Every agent pins its effort, so a run behaves the same
// whoever starts it: xhigh to write or diagnose, high to discover or gate, medium for git.
const READ_MODEL = 'sonnet'
const WORK_MODEL = 'opus'
const DEEP_EFFORT = 'xhigh'
const CHECK_EFFORT = 'high'
const ROUTINE_EFFORT = 'medium'
const componentTitle = component.charAt(0).toUpperCase() + component.slice(1)

// Same contract as the migration script: agents edit, the Publish agent alone owns git.
const TREE_RULES = `## Working-tree rules
- All paths are repo-root relative; run commands from the repo root unless told otherwise.
- Never run git checkout, stash, reset, commit, rebase, clean, or add, except where a step
  below names one. Read-only git (status, diff, log, show, grep) is fine.
- Report every file you create, modify, or delete in filesTouched.
- No new dependencies. No inline styles. Semantic CSS tokens before primitives.
- Comments state a fact the code cannot show; never narrate the code. One line each.
- apps/ resolves @code-dot-org/component-library to its dist/. After editing the package,
  run \`yarn build\` in ${LIB} or apps sees stale code.
- Inside a frontend package, run eslint as \`../../node_modules/.bin/eslint .\` (hoisted).
- Storybook: build with \`yarn build\` in ${STORYBOOK}; serve dist statically and open it as
  http://localhost:<port>, never 127.0.0.1 (the fonts' CORS allows only localhost).`

// ── Discover ─────────────────────────────────────────────────────────────────
phase('Discover')

const ROW_SCHEMA = {
  type: 'object',
  required: ['behavior', 'legacyToday', 'withMui', 'uiTestsAtRisk', 'ticket', 'movesDom', 'after'],
  properties: {
    behavior: {type: 'string', description: 'The Behavior cell, verbatim'},
    legacyToday: {type: 'string'},
    withMui: {type: 'string'},
    uiTestsAtRisk: {type: 'array', items: {type: 'string'}},
    ticket: {type: 'string', description: 'Ticket key from the row, or ""'},
    movesDom: {type: 'boolean', description: 'true when adopting it moves elements in the DOM (a portal) or changes rendering, so eyes and the test build must run before merge'},
    after: {type: 'array', items: {type: 'string'}, description: 'Behavior cells this row must follow, from an After column or the prose around the table; [] if none'},
  },
}

const DISCOVER_SCHEMA = {
  type: 'object',
  required: [
    'preflight', 'headOnBase', 'branchOwner', 'preexistingUntracked', 'planDocFound', 'statusState',
    'legacySourceFiles', 'legacyExports', 'legacyImports', 'eslintBanPresent', 'codemod', 'rows',
    'reference', 'consumerTestFiles', 'next', 'notes',
  ],
  properties: {
    preflight: {type: 'array', items: {type: 'string'}, description: 'Blockers found in step 0; [] if none'},
    headOnBase: {type: 'boolean'},
    branchOwner: {type: 'string', description: 'The part before the first "/" of the current branch, or ""'},
    preexistingUntracked: {type: 'array', items: {type: 'string'}},
    planDocFound: {type: 'boolean'},
    statusState: {type: 'string', description: `The component's state in ${STATUS_DOC}, e.g. "Migrated, behavior pending"`},
    legacySourceFiles: {type: 'array', items: {type: 'string'}, description: 'Deprecated DSCO files still in the tree: sources, their styles, tests and stories'},
    legacyExports: {type: 'array', items: {type: 'string'}, description: 'Legacy names the entry point still exports ("default" included when it is legacy)'},
    legacyImports: {type: 'array', items: {type: 'string'}, description: 'Files outside the component directory that still import a legacy export'},
    eslintBanPresent: {type: 'boolean'},
    codemod: {type: 'string', description: 'The component codemod path and its yarn script, or ""'},
    rows: {type: 'array', items: ROW_SCHEMA, description: 'The Deferred changes table, in table order'},
    reference: {type: 'string', description: 'A reference implementation the plan names (PR number, branch), or ""'},
    consumerTestFiles: {type: 'array', items: {type: 'string'}, description: 'apps/ and frontend/ test files of the consumers'},
    next: {
      type: 'object',
      required: ['kind', 'behavior', 'reason'],
      properties: {
        kind: {type: 'string', enum: ['delete-legacy', 'behavior', 'done', 'blocked']},
        behavior: {type: 'string', description: 'The row, when kind is behavior; else ""'},
        reason: {type: 'string'},
      },
    },
    notes: {type: 'string', description: 'Anything about the table or plan doc that made this harder to read than it should be'},
  },
}

const discover = await agent(
  `You DISCOVER where the MUI "${component}" migration stands, so one finishing step can
run. Facts only; change no file.

${TREE_RULES}

─── STEP 0 — Preflight ────────────────────────────────────────────────────────
  Record blockers; do not fix them: apps/node_modules, frontend/node_modules and apps/build
  exist; git status --porcelain shows no tracked modifications (list ?? lines as
  preexistingUntracked); ${publish ? 'gh auth status succeeds.' : 'publish is off; skip gh.'}
  git fetch origin ${base} (skip it when ${base} is a local-only branch). headOnBase is
  true when HEAD is at, or an ancestor of, origin/${base} when that exists, else the local
  ${base}. branchOwner from the current branch name.

─── STEP 1 — Docs ─────────────────────────────────────────────────────────────
  Read ${PLAN_DOC} in full (planDocFound), and the ${component} row of ${STATUS_DOC}
  (statusState). Parse the "Deferred changes" section into rows, in table order. For each
  row take after from an After column when there is one, else from the prose around the
  table ("X goes before Y"). movesDom from what the row says MUI would do. reference: a PR
  or branch the plan names as the reference implementation.

─── STEP 2 — The tree ─────────────────────────────────────────────────────────
  legacySourceFiles: the deprecated files under ${COMPONENT_DIR} (the export policy in the
  plan names them; a @deprecated JSDoc marks them). legacyExports from its index.ts.
  legacyImports: grep apps/src, apps/test, frontend and ${LIB_SRC} (excluding
  ${COMPONENT_DIR}) for imports of a legacy export from
  '@code-dot-org/component-library/${component}' or relative paths into ${COMPONENT_DIR}.
  eslintBanPresent: ${ESLINT_APPS} has a no-restricted-imports entry for that path.
  codemod: under ${CODEMODS_DIR} and ${LIB}/package.json. consumerTestFiles: tests of
  every file that imports from the component entry point.

─── STEP 3 — Next step ────────────────────────────────────────────────────────
  Requested: ${stepArg ? JSON.stringify(stepArg) : 'nothing; pick the next one'}.
  - delete-legacy is allowed when legacySourceFiles is non-empty, legacyImports is empty
    and eslintBanPresent is true.
  - A row is allowed when legacySourceFiles is empty and every row in its after list is
    gone from the table.
  - With no request: delete-legacy if legacySourceFiles is non-empty, else the first
    allowed row, else done when the table is empty.
  kind blocked, with the reason, when the request (or every candidate) is not allowed.`,
  {schema: DISCOVER_SCHEMA, label: 'discover', phase: 'Discover', model: READ_MODEL, effort: CHECK_EFFORT},
)
if (!discover) throw new Error('discover agent was skipped')
if (discover.preflight.length) throw new Error(`Preflight: ${discover.preflight.join('; ')}`)
if (!discover.headOnBase) throw new Error(`HEAD is not on ${base}. Check out ${base} (or pass base) first.`)
if (!discover.planDocFound) throw new Error(`${PLAN_DOC} not found; this component was not migrated by the planned workflow.`)
if (discover.notes) log(`Discover notes: ${discover.notes}`)
const next = discover.next
if (next.kind === 'done') {
  log(`${component}: nothing left to finish (${next.reason})`)
  return {component, step: 'done', reason: next.reason}
}
if (next.kind === 'blocked') throw new Error(`${component}: ${next.reason}`)
const row = next.kind === 'behavior' ? discover.rows.find(r => r.behavior === next.behavior) : null
if (next.kind === 'behavior' && !row) throw new Error(`Discover picked "${next.behavior}", which is not a row of the table`)
const stepTitle = row ? row.behavior : 'delete the legacy DSCO source'
const ticket = jiraKey || (row && row.ticket) || ''
const remainingAfter = row ? discover.rows.filter(r => r !== row) : discover.rows
log(`${component}: ${stepTitle}${ticket ? ` (${ticket})` : ''}; ${discover.rows.length} deferred row(s) in the table`)

// ── Execute ──────────────────────────────────────────────────────────────────
phase('Execute')

const TOUCHED_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}},
    notes: {type: 'string', description: 'What changed, and every choice the plan left open'},
    uiTestEdits: {type: 'array', items: {type: 'string'}, description: 'file:line and what changed, for each UI-test hook edited'},
  },
}

const deleteLegacyBrief = `STEP 4: delete the legacy DSCO source. Behavior must not change: leave every disable*
flag, slot override and legacy hook the MUI version still uses exactly as it is.

LEGACY FILES: ${JSON.stringify(discover.legacySourceFiles)}
LEGACY EXPORTS: ${JSON.stringify(discover.legacyExports)}
CODEMOD: ${discover.codemod || 'none'}

1. Delete the legacy files and anything that exists only to serve them.
2. Exports, per the plan's export policy: the MUI version takes the plain names at the
   entry point. When the policy leaves details open, keep one exported name per component
   (the plain one), rename the MuiX files, tests and stories to match, and record the
   choice.
3. Consumers: extend the codemod with a transform that rewrites MuiX imports (aliased or
   not) to the plain names, run it over apps/ and frontend/, and document the transform in
   ${CODEMODS_DIR}/README.md. Hand-edit only what the transform cannot reach.
4. ${ESLINT_APPS}: remove the no-restricted-imports entry for the component; the names it
   bans no longer exist.
5. Docs: ${STATUS_DOC} row notes step 4 is done (the state stays as it is while deferred
   rows remain; it becomes **Migrated** only if the table is empty); the component README
   loses its legacy section; ${SKILL_DOC} names the plain import; ${PLAN_DOC} gains a
   "Legacy source deleted" paragraph under its Outcome.`

const rowBrief = row && `STEP 5, one deferred behavior: ${JSON.stringify(row)}
OTHER ROWS (leave them alone; their legacy behavior stays): ${JSON.stringify(remainingAfter.map(r => r.behavior))}
REFERENCE IMPLEMENTATION: ${discover.reference || 'none named'}

1. Read the plan's Shared globals, Risks and Deferred changes sections, the MUI version's
   source, and the reference implementation if one is named (gh pr diff <n>, or
   git show <branch>:<path>). The reference is a guide, not a patch: this tree has moved.
2. Hand this one behavior to MUI: remove the disable* flag(s) or slot override that kept
   it legacy, and the legacy hook or code that stood in for it. Delete the hook itself when
   nothing else uses it (grep ${LIB_SRC} and apps/src). Keep the legacy behavior of every
   other row. Adjust the "Deferred changes" comment in the source so it names only what is
   still kept.
3. Unit tests that pinned the legacy behavior now pin the MUI behavior. Add a test for
   anything the row says changes.
4. UI tests: the hooks the row names, plus any hook in ${UI_TEST_DIRS} that depends on the
   DOM or behavior this changes. Rewrite them against the new DOM (role/name or
   data-testid first). Report each edit in uiTestEdits. Do not run Cucumber or Playwright.
5. Docs: delete the row from ${PLAN_DOC}'s Deferred changes table, and add one line under
   its Outcome saying what changed. ${remainingAfter.length ? `${STATUS_DOC}: keep the state, and drop this behavior from the row's note.` : `${STATUS_DOC}: the table is now empty, so set the row to **Migrated** and say so in the note.`}
   Update the component README where it describes this behavior.`

const exec = await agent(
  `You EXECUTE one finishing step of the MUI "${component}" migration. Edit files only;
the Publish phase commits.

${TREE_RULES}

${next.kind === 'delete-legacy' ? deleteLegacyBrief : rowBrief}

Then run in ${LIB}: yarn test, yarn typecheck, ../../node_modules/.bin/eslint ., yarn build.
Report every file touched and every open choice you made.`,
  {schema: TOUCHED_SCHEMA, label: 'execute', phase: 'Execute', model: WORK_MODEL, effort: DEEP_EFFORT},
)
if (!exec) throw new Error('execute agent was skipped')

// ── Verify ───────────────────────────────────────────────────────────────────
phase('Verify')

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['pass', 'checks', 'failures', 'uiTestsNotRun', 'filesTouched'],
  properties: {
    pass: {type: 'boolean'},
    checks: {type: 'object', additionalProperties: {type: 'string'}, description: 'check name -> result'},
    failures: {
      type: 'array',
      items: {
        type: 'object',
        required: ['check', 'detail', 'suspectFiles'],
        properties: {check: {type: 'string'}, detail: {type: 'string'}, suspectFiles: {type: 'array', items: {type: 'string'}}},
      },
    },
    uiTestsNotRun: {type: 'array', items: {type: 'string'}, description: 'Cucumber features and Playwright specs whose hooks this change touches; a human runs them'},
    filesTouched: {type: 'array', items: {type: 'string'}},
  },
}

let touched = [...exec.filesTouched]
let uiTestEdits = [...(exec.uiTestEdits || [])]
const verifyPrompt = attempt => `You are the VERIFY GATE for one finishing step of the MUI "${component}" migration:
${stepTitle} (attempt ${attempt}/${maxHealAttempts}). Report each check exactly; fix nothing.

${TREE_RULES}

FILES CHANGED: ${JSON.stringify(touched)}
CONSUMER TESTS: ${JSON.stringify(discover.consumerTestFiles)}

1. ${LIB}: yarn test; yarn typecheck; ../../node_modules/.bin/eslint .; yarn build.
   ${STORYBOOK}: yarn build.
2. apps/: yarn run typecheck; yarn test:unit with every apps/ file in CONSUMER TESTS in ONE
   jest invocation.
3. Every other frontend package with a changed file: yarn test, yarn typecheck, eslint.
4. Lint like Drone: git add -- <changed files> (the one git write you may do), run
   ./tools/hooks/pre-commit from the repo root, then git restore --staged -- <the same
   files>. Never stage
   ${JSON.stringify(discover.preexistingUntracked)}.
5. Import audit: grep apps/src, apps/test, frontend and ${LIB_SRC} for any import of a name
   or path this step removed. Any hit is a failure.
6. UI-test hooks: grep ${UI_TEST_DIRS} for selectors that depend on what changed. List each
   feature or spec in uiTestsNotRun; a selector that no longer matches the new DOM is a
   failure.

pass is true only when every check is clean. Name suspect files for each failure.`

let verify = null
let attempt = 0
while (true) {
  attempt++
  verify = await agent(verifyPrompt(attempt), {schema: VERIFY_SCHEMA, label: `verify-${attempt}`, phase: 'Verify', model: WORK_MODEL, effort: CHECK_EFFORT})
  if (!verify) throw new Error('verify agent was skipped')
  touched = [...new Set([...touched, ...verify.filesTouched])]
  log(`Verify ${attempt}: ${verify.pass ? 'clean' : verify.failures.map(f => f.check).join(', ')}`)
  if (verify.pass || attempt >= maxHealAttempts) break
  const heal = await agent(
    `You HEAL failing checks in one finishing step of the MUI "${component}" migration:
${stepTitle}. Fix the root cause, not the assertion; keep the step's scope.

${TREE_RULES}

${next.kind === 'delete-legacy' ? deleteLegacyBrief : rowBrief}

FAILURES: ${JSON.stringify(verify.failures)}
FILES CHANGED SO FAR: ${JSON.stringify(touched)}

Re-run only the checks that failed, then report filesTouched and notes.`,
    {schema: TOUCHED_SCHEMA, label: `heal-${attempt}`, phase: 'Verify', model: WORK_MODEL, effort: DEEP_EFFORT},
  )
  if (heal) {
    touched = [...new Set([...touched, ...heal.filesTouched])]
    uiTestEdits = [...uiTestEdits, ...(heal.uiTestEdits || [])]
  }
}
if (!verify.pass) log(`WARNING: verify still failing after ${attempt} attempt(s); the PR says so`)

// ── Publish ──────────────────────────────────────────────────────────────────
phase('Publish')

const owner = /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(discover.branchOwner || '') ? discover.branchOwner : 'mui'
const branchPrefix = branchPrefixArg || `${owner}/mui-${component}`
const slug = (row ? row.behavior : 'delete-legacy').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const branch = `${branchPrefix}/finish-${slug}`
const subject = row
  ? `[MUI Migration] ${componentTitle}: hand ${row.behavior.replace(/`/g, '')} to MUI`
  : `[MUI Migration] ${componentTitle}: delete the legacy DSCO source`
const requiredRuns = row && row.movesDom ? 'Eyes and the test build must run before merge: this change moves DOM or changes rendering.' : ''
const failingNote = verify.pass ? '' : `Verify was still failing when the heal budget ran out: ${JSON.stringify(verify.failures)}`

const PUBLISH_SCHEMA = {
  type: 'object',
  required: ['branch', 'sha', 'prUrl', 'leftovers'],
  properties: {
    branch: {type: 'string'},
    sha: {type: 'string'},
    prUrl: {type: 'string', description: 'Draft PR URL, or "" when publish is off'},
    leftovers: {type: 'array', items: {type: 'string'}},
  },
}

const published = await agent(
  `You PUBLISH one finishing step of the MUI "${component}" migration. This step owns git.
Run from the repo root and stop at the first git error rather than improvising.

1. git branch --list ${branch}; if it exists, stop and report it in leftovers.
   git checkout -b ${branch}
2. git add -- the files that changed and exist or were deleted, from this list:
   ${JSON.stringify(touched)}
   NEVER stage ${JSON.stringify(discover.preexistingUntracked)}, anything under ${STORYBOOK}/dist,
   or any *.png. Commit:
     ${subject}

     <two or three sentences: what changed, what did not, and the UI tests at risk>
     ${ticket ? `\n     Jira: ${ticket}\n` : ''}
     ${COMMIT_TRAILER}
   The pre-commit hook lints staged files; fix lint errors in them, re-stage, retry.
3. git status --porcelain: anything left besides the never-stage list goes in leftovers,
   uncommitted.
${publish ? `4. git push -u origin ${branch}; then gh pr create --draft --base ${base} --head ${branch}
   --title "${subject}" --body-file <file>. The body follows .github/pull_request_template.md
   (read it); delete Deployment notes and Privacy; end with "${PR_FOOTER}". It says:
   lifecycle step ${row ? 5 : 4} of the ${component} migration, a link to ${PLAN_DOC}; what
   changed and what did not (${JSON.stringify(exec.notes)}); the UI-test edits
   ${JSON.stringify(uiTestEdits)}; "UI tests to run before merge" listing
   ${JSON.stringify(verify.uiTestsNotRun)}; ${requiredRuns ? `the line "${requiredRuns}"; ` : ''}the deferred rows still
   left ${JSON.stringify(remainingAfter.map(r => r.behavior))}; ${ticket ? `Links: Jira ${ticket}` : 'the Jira bullet left empty'}.
   ${failingNote ? `A "Failing checks" section: ${failingNote}` : ''}` : '4. publish is off: no push, no gh. prUrl is "".'}

Report the branch, the commit sha, the PR URL and leftovers.`,
  {schema: PUBLISH_SCHEMA, label: 'publish', phase: 'Publish', model: WORK_MODEL, effort: ROUTINE_EFFORT},
)
if (!published) throw new Error('publish agent was skipped; the tree may hold uncommitted work')
if (published.leftovers.length) log(`WARNING: leftovers: ${published.leftovers.join(', ')}`)
log(`Done: ${published.branch} ${published.sha}${published.prUrl ? ` ${published.prUrl}` : ' (local only)'}`)

return {
  component,
  step: row ? row.behavior : 'delete-legacy',
  ticket,
  branch: published.branch,
  sha: published.sha,
  pr: published.prUrl,
  verify: verify.pass ? 'clean' : 'failing',
  verifyAttempts: attempt,
  uiTestsToRun: verify.uiTestsNotRun,
  requiredRuns,
  remainingRows: remainingAfter.map(r => r.behavior),
  discoverNotes: discover.notes,
  leftovers: published.leftovers,
}
