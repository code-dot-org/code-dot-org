export const meta = {
  name: 'dsco-mui-design-system-migration',
  description:
    'Migrate one DSCO component to MUI: build the MUI version, gate it on Storybook pixel parity, sweep every consumer, update docs, open stacked draft PRs',
  phases: [
    {title: 'Scout', detail: 'read the DSCO component, map props to MUI, enumerate consumers'},
    {title: 'Build', detail: 'MUI overrides or wrapper, stories, tests, README, codemod'},
    {title: 'Parity', detail: 'Storybook screenshots, DSCO vs MUI, judged; loop until clean'},
    {title: 'Migrate', detail: 'one agent per consumer chunk; chunks own disjoint files'},
    {title: 'Verify', detail: 'typecheck, lint, unit tests, UI-test selectors; heal loop'},
    {title: 'Docs', detail: 'status doc, design-system skill, deprecation, eslint rule'},
    {title: 'Publish', detail: 'stacked branches, screenshot branch, draft PRs'},
  ],
}

// args: the DSCO component directory name under frontend/packages/component-library/src,
// or an object:
//   Workflow({name: 'dsco-mui-design-system-migration', args: 'dialog'})
//   Workflow({name: 'dsco-mui-design-system-migration',
//             args: {component: 'dialog', jira: 'RE-190', chunkSize: 25, publish: false}})
//
//   component    required. A family that shares a base (the dropdowns) is one run.
//   base         branch the first PR targets (default 'staging'). HEAD should sit on it.
//   branchPrefix branch namespace (default '<first segment of current branch>/mui-<component>').
//   chunkSize    consumer files per PR, roughly (default 25).
//   jira         ticket for the PR bodies' Links section (default none).
//   publish      false carves the local stacked branches and stops: no push, no PRs.
//   force        true proceeds even when the status doc already lists the component as
//                In Progress or Migrated. It does not reuse branches: a redo after an
//                interrupted run needs the old branches deleted or a new branchPrefix.
//   maxParityAttempts / maxHealAttempts  loop budgets (default 3 each).
//
// Run from a checkout that has apps/node_modules, frontend/node_modules and apps/build.
// A fresh worktree has none of them; Scout aborts early with the list of what is missing.
// The working tree must have no tracked modifications: the run commits as it goes.
const a = typeof args === 'string' ? {component: args.trim()} : args || {}
const component = a.component
// One directory name: the value is spliced into paths every agent reads and stages.
if (!component || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(component)) {
  throw new Error(
    'args must name one DSCO component directory (letters, digits, dashes), e.g. "dialog" or {component: "dialog"}',
  )
}
const positiveInt = (v, dflt, name) => {
  if (v === undefined) return dflt
  if (!Number.isInteger(v) || v < 1) throw new Error(`${name} must be a positive integer, got ${JSON.stringify(v)}`)
  return v
}
const base = a.base || 'staging'
const chunkSize = positiveInt(a.chunkSize, 25, 'chunkSize')
const jira = a.jira || ''
const publish = a.publish !== false
const force = !!a.force
const maxParityAttempts = positiveInt(a.maxParityAttempts, 3, 'maxParityAttempts')
const maxHealAttempts = positiveInt(a.maxHealAttempts, 3, 'maxHealAttempts')

const LIB = 'frontend/packages/component-library'
const LIB_SRC = `${LIB}/src`
const COMPONENT_DIR = `${LIB_SRC}/${component}`
const OVERRIDES_DIR = `${LIB_SRC}/themes/code.org/styleOverrides`
const AUGMENTATION = `${LIB_SRC}/themes/code.org/muiAugmentation.ts`
const STATUS_DOC = `${LIB}/MIGRATION_STATUS.md`
const CODEMODS_DIR = `${LIB}/codemods`
const STORYBOOK = 'frontend/apps/design-system-storybook'
const SKILL_DOC = '.agents/skills/design-system/SKILL.md'
const ESLINT_APPS = 'apps/.eslintrc.js'
// Storybook's dist/ is gitignored, so screenshots parked here never reach a commit.
const PARITY_DIR = `${STORYBOOK}/dist/parity/${component}`
const COMMIT_TRAILER = 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>'
const PR_FOOTER = '🤖 Generated with [Claude Code](https://claude.com/claude-code)'

// Shared rules for every agent that edits files. Chunk agents run concurrently in ONE
// working tree, so anything that moves HEAD or the index would corrupt a sibling's work.
const TREE_RULES = `## Working-tree rules
- All paths are repo-root relative; run commands from the repo root unless told otherwise.
- Never run git checkout, stash, reset, commit, rebase, clean, or add. The Publish phase
  owns git. Read-only git (status, diff, log, show, grep) is fine.
- Edit only the files this brief assigns to you, plus files that exist solely to serve
  one of them (its .module.scss, its test, its story, a jest snapshot). Report every file
  you create, modify, or delete in filesTouched, or Publish cannot carve your PR.
- No new dependencies. No inline styles. Semantic CSS tokens
  (@code-dot-org/component-library-styles/colors.css) before primitives.
- Comments state a fact the code cannot show; never narrate the code.
- apps/ resolves @code-dot-org/component-library to its dist/. After editing the package,
  run \`yarn build\` in ${LIB} or apps sees stale code.`

const MIGRATION_RULES = `## Migration rules
- The MUI version reproduces what the DSCO component renders TODAY. Figma is out of scope:
  where you know the DSCO version drifted from Figma, note it in knownDeviations and move
  on. A later run reconciles MUI with Figma.
- Approach: pure theme style overrides in ${OVERRIDES_DIR} when every DSCO prop maps onto
  an MUI prop or slot (Tooltip, Button did this). A wrapper component inside
  ${COMPONENT_DIR}, built on MUI primitives (the way notification-banner is), when the
  DSCO component carries composition or behavior MUI does not have. Both when the wrapper
  is thin and the look belongs in the theme.
- Precedents to read before writing anything: ${OVERRIDES_DIR}/tooltip.ts and
  ${LIB_SRC}/tooltip/ (index.ts exports, README, stories, tests); ${OVERRIDES_DIR}/button.tsx;
  ${LIB}/CONTRIBUTING.md; ${STATUS_DOC} sections "How to Migrate" and "Migration Strategy".
- Register overrides in ${OVERRIDES_DIR}/index.ts. Type augmentations go in ${AUGMENTATION}.
- Story titles follow 'DesignSystem/<Component>/<Name>'. Keep the DSCO stories: the Parity
  phase screenshots DSCO and MUI stories side by side, so every DSCO story needs an MUI
  twin with the same visual state.
- Consumers import MUI from '@mui/material' (aliased MuiX when a local name collides) or
  the wrapper from '@code-dot-org/component-library/${component}'. CdoTheme is already
  applied at the app level.`

// ── Phase 1: Scout ───────────────────────────────────────────────────────────
// Static analysis only. Finds the component's surface, decides the MUI approach,
// and enumerates every consumer the sweep must touch. Writes nothing.
phase('Scout')

const SCOUT_SCHEMA = {
  type: 'object',
  required: [
    'preflight', 'startRef', 'headOnBase', 'branchOwner', 'existingBranches', 'preexistingUntracked',
    'alreadyMigrated', 'componentFiles', 'exports', 'dscoStories', 'approach',
    'muiComponents', 'propMap', 'consumers', 'uiTestFiles', 'codemodFeasible',
    'knownDeviations', 'risks',
  ],
  properties: {
    preflight: {
      type: 'object',
      required: ['ok', 'problems'],
      properties: {
        ok: {type: 'boolean'},
        problems: {
          type: 'array', items: {type: 'string'},
          description: 'Each blocker in one line: missing node_modules, dirty tree, missing gh auth, ...',
        },
      },
    },
    startRef: {type: 'string', description: 'Current branch name (git rev-parse --abbrev-ref HEAD)'},
    headOnBase: {
      type: 'boolean',
      description: `true if HEAD is an ancestor of origin/${base}; false means the first PR would carry unrelated commits`,
    },
    branchOwner: {
      type: 'string',
      description: "Namespace this developer uses for branches: the first segment of startRef when it contains '/', else the most common first segment among local branches that contain '/', else the first word of git config user.name in lowercase",
    },
    existingBranches: {
      type: 'array', items: {type: 'string'},
      description: `Local or origin branches matching */mui-${component}/* (git branch --list, git ls-remote --heads origin). A previous run left them; this run cannot reuse them.`,
    },
    preexistingUntracked: {
      type: 'array', items: {type: 'string'},
      description: 'Untracked paths present before the run (git status --porcelain, ?? lines). Publish must not commit these.',
    },
    alreadyMigrated: {
      type: 'boolean',
      description: `true if ${STATUS_DOC} lists the component as In Progress or Migrated, or an override/wrapper for it already exists`,
    },
    componentFiles: {
      type: 'array', items: {type: 'string'},
      description: `Every file under ${COMPONENT_DIR}: sources, scss modules, tests, stories, README`,
    },
    exports: {
      type: 'array', items: {type: 'string'},
      description: `Public exports of ${COMPONENT_DIR}/index.ts (components, types, helpers)`,
    },
    dscoStories: {
      type: 'array',
      description: 'Every existing DSCO story export the Parity phase must pair with an MUI twin',
      items: {
        type: 'object',
        required: ['file', 'title', 'exportName', 'storyId', 'state'],
        properties: {
          file: {type: 'string'},
          title: {type: 'string', description: "meta.title, e.g. 'DesignSystem/Dialog/Dialog'"},
          exportName: {type: 'string'},
          storyId: {
            type: 'string',
            description: "Storybook id: title lowercased with '/' -> '-' and spaces removed, '--', export name in kebab-case (e.g. designsystem-dialog-dialog--default). Parity confirms against dist/index.json.",
          },
          state: {type: 'string', description: 'What visual state the story shows, in one line'},
        },
      },
    },
    approach: {type: 'string', enum: ['overrides', 'wrapper', 'both']},
    approachRationale: {type: 'string'},
    muiComponents: {
      type: 'array', items: {type: 'string'},
      description: "MUI components the migration builds on, e.g. ['Dialog', 'DialogTitle', 'DialogActions']",
    },
    propMap: {
      type: 'array',
      description: 'One entry per DSCO prop (and per callback/ref/children convention)',
      items: {
        type: 'object',
        required: ['dscoProp', 'muiEquivalent', 'kind'],
        properties: {
          dscoProp: {type: 'string'},
          muiEquivalent: {type: 'string', description: 'MUI prop, slot, sx path, or wrapper prop; "" if dropped'},
          kind: {
            type: 'string',
            enum: ['direct', 'rename', 'wrapper-logic', 'theme-default', 'drop'],
            description: 'direct = same name and meaning; rename = mechanical; wrapper-logic = needs code; theme-default = becomes a defaultProps/override; drop = no MUI meaning, consumers lose it',
          },
          notes: {type: 'string'},
        },
      },
    },
    consumers: {
      type: 'array',
      description: `Every file outside ${COMPONENT_DIR} that imports from '@code-dot-org/component-library/${component}' or a relative path into it. Include tests that import it.`,
      items: {
        type: 'object',
        required: ['file', 'kind', 'testFiles'],
        properties: {
          file: {type: 'string'},
          kind: {
            type: 'string',
            enum: ['apps', 'frontend-package', 'frontend-app', 'component-library-internal', 'test'],
          },
          testFiles: {
            type: 'array', items: {type: 'string'},
            description: 'Unit test files exercising this consumer (apps/test/unit mirror or __tests__ sibling), or []',
          },
          imports: {type: 'array', items: {type: 'string'}, description: 'Named imports taken from the component'},
        },
      },
    },
    uiTestFiles: {
      type: 'array', items: {type: 'string'},
      description: 'Cucumber (dashboard/test/ui) and Playwright (frontend/packages/e2e-tests) files whose selectors depend on the DSCO DOM: class names, data-testids, aria structure',
    },
    codemodFeasible: {
      type: 'boolean',
      description: 'true when most propMap entries are direct/rename so a jscodeshift codemod pays for itself',
    },
    codemodNotes: {type: 'string'},
    knownDeviations: {type: 'string', description: 'Known DSCO-vs-Figma drift, from comments, READMEs, or the status doc'},
    risks: {type: 'string', description: 'What the Build and Migrate phases must watch: theming under Lab2 Dark, RTL, portal vs in-place rendering, focus management, UI-test selectors'},
  },
}

const scout = await agent(
  `You are the SCOUT for migrating the DSCO "${component}" component to MUI. Pure static
analysis. Write NO files. Run only read-only commands.

${MIGRATION_RULES}

─── STEP 0 — Preflight ────────────────────────────────────────────────────────
  Record blockers; do not fix them. All of these must hold:
    - apps/node_modules, frontend/node_modules, apps/build exist (ls -d).
    - git status --porcelain shows no tracked modifications (lines not starting "??").
      Untracked paths are allowed: list them in preexistingUntracked.
    - ${COMPONENT_DIR} exists.
    - ${publish ? 'gh auth status succeeds and origin is the code-dot-org remote (publish is on).' : 'publish is off; skip the gh check.'}
  Also record startRef, branchOwner, and whether HEAD is an ancestor of origin/${base}
  (git fetch origin ${base} first; git merge-base --is-ancestor HEAD origin/${base}).
  List existingBranches: git branch --list '*/mui-${component}/*' and
  git ls-remote --heads origin '*/mui-${component}/*'.

─── STEP 1 — The component ────────────────────────────────────────────────────
  Read every file under ${COMPONENT_DIR}: sources, scss modules, README, stories, tests.
  List the public exports and every story export with its title and computed storyId.
  Check ${STATUS_DOC} for the component's row and ${OVERRIDES_DIR} for an existing
  override; set alreadyMigrated accordingly.

─── STEP 2 — MUI target ───────────────────────────────────────────────────────
  Read the precedents named in the rules. Decide overrides / wrapper / both by the rule
  there and write the rationale. Build the propMap from the DSCO props interface: one
  entry per prop, classified. Be exact about what a consumer loses (kind: drop).

─── STEP 3 — Consumers ────────────────────────────────────────────────────────
  grep for BOTH import forms everywhere: the package path
  '@code-dot-org/component-library/${component}' and relative paths into ${COMPONENT_DIR}
  (../${component}, ../../${component}, ./${component}). Search apps/src, apps/test,
  frontend/packages, frontend/apps, dashboard, AND ${LIB_SRC} itself; exclude only
  ${COMPONENT_DIR}. Sibling components, their stories and tests inside ${LIB_SRC} use
  either form (snackbar's story imports '@code-dot-org/component-library/alert'); they
  are the inside-out consumers, kind component-library-internal. For each apps consumer, find
  its unit test under apps/test/unit by the mirrored path or by grep for its basename.
  dashboard/ has no JS consumers; its exposure is UI tests. For uiTestFiles, grep
  dashboard/test/ui/features and frontend/packages/e2e-tests/tests for the DSCO class
  names, data-testids and distinctive DOM of this component (read its scss modules and
  JSX to know what to grep for).

─── STEP 4 — Codemod feasibility, deviations, risks ───────────────────────────
  codemodFeasible is true when a jscodeshift transform can handle most consumers
  (see ${CODEMODS_DIR}/button-to-mui-button.ts for the shape). Note known Figma drift
  and the risks listed in the schema.

Return the structured plan.`,
  {schema: SCOUT_SCHEMA, label: 'scout', phase: 'Scout'},
)
if (!scout) throw new Error('scout agent was skipped; nothing to build on')

if (!scout.preflight.ok) {
  throw new Error(`Preflight failed:\n- ${scout.preflight.problems.join('\n- ')}`)
}
if (scout.alreadyMigrated && !force) {
  log(`${component} is already In Progress or Migrated per ${STATUS_DOC}. Pass force: true to redo.`)
  return {component, status: 'already-migrated'}
}
// Branches are created with checkout -b and pushed without --force, so a leftover
// from an earlier run would stop the carve halfway. Fail before any file changes.
if (scout.existingBranches.length && !(a.branchPrefix && !scout.existingBranches.some(b => b.includes(a.branchPrefix)))) {
  throw new Error(
    `Branches from an earlier run exist: ${scout.existingBranches.join(', ')}. ` +
      'Delete them (local and origin) or pass a different branchPrefix.',
  )
}
if (!scout.headOnBase) {
  log(`WARNING: HEAD (${scout.startRef}) is not on origin/${base}; the first PR will carry unrelated commits.`)
}

// Chunks are keyed by the consumer's home directory so one PR reads as one area.
// Inside-out consumers sort first: other DSCO components must stop importing this one
// before its source can ever be deleted.
const groupOf = file => {
  if (file.startsWith(LIB_SRC)) return '0-component-library-internal'
  let m = file.match(/^apps\/test\/unit\/([^/]+)(?:\/([^/]+))?/)
  if (m) return `apps/src/${m[1]}${m[2] && !/\.[jt]sx?$/.test(m[2]) ? '/' + m[2] : ''}`
  m = file.match(/^apps\/src\/([^/]+)(?:\/([^/]+))?/)
  if (m) return `apps/src/${m[1]}${m[2] && !/\.[jt]sx?$/.test(m[2]) ? '/' + m[2] : ''}`
  m = file.match(/^frontend\/(packages|apps)\/([^/]+)/)
  if (m) return `frontend/${m[1]}/${m[2]}`
  return file.split('/').slice(0, 2).join('/')
}
const slugOf = group =>
  group
    .replace(/^0-/, '')
    .replace(/^(apps\/src|frontend\/packages|frontend\/apps)\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()

const chunkConsumers = (rawConsumers, size) => {
  // Scout may list one file twice (two import forms); a file belongs to one chunk.
  const seen = new Set()
  const consumers = rawConsumers.filter(c => (seen.has(c.file) ? false : seen.add(c.file)))
  const groups = new Map()
  for (const c of consumers) {
    const g = groupOf(c.file)
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g).push(c)
  }
  const ordered = [...groups.keys()].sort()
  const chunks = []
  let cur = null
  const flush = () => {
    if (cur && cur.consumers.length) chunks.push(cur)
    cur = null
  }
  for (const g of ordered) {
    const items = groups.get(g)
    if (items.length > size) {
      flush()
      const parts = Math.ceil(items.length / size)
      for (let i = 0; i < parts; i++) {
        chunks.push({slug: `${slugOf(g)}-${i + 1}`, groups: [g], consumers: items.slice(i * size, (i + 1) * size)})
      }
      continue
    }
    if (cur && cur.consumers.length + items.length > size) flush()
    if (!cur) cur = {slug: '', groups: [], consumers: []}
    cur.groups.push(g)
    cur.consumers.push(...items)
  }
  flush()
  // Chunk agents edit concurrently, so a test shared by two consumers must belong to
  // exactly one chunk: the first that claims it.
  const claimed = new Set()
  for (const ch of chunks) {
    if (!ch.slug) {
      const names = ch.groups.map(slugOf)
      ch.slug = names.length > 2 ? `${names.slice(0, 2).join('-')}-and-${names.length - 2}-more` : names.join('-')
    }
    ch.files = []
    for (const f of ch.consumers.flatMap(c => [c.file, ...(c.testFiles || [])])) {
      if (claimed.has(f)) continue
      claimed.add(f)
      ch.files.push(f)
    }
  }
  return chunks
}

const chunks = chunkConsumers(scout.consumers, chunkSize)
log(`Scout: ${scout.approach} via ${scout.muiComponents.join(', ')} · ${scout.consumers.length} consumer(s) in ${chunks.length} chunk(s) · ${scout.dscoStories.length} DSCO story(ies) · ${scout.uiTestFiles.length} UI-test file(s)`)
const dropped = scout.propMap.filter(p => p.kind === 'drop')
if (dropped.length) log(`${dropped.length} DSCO prop(s) have no MUI meaning: ${dropped.map(p => p.dscoProp).join(', ')}`)

// ── Phase 2: Build ───────────────────────────────────────────────────────────
// Writes the design-system side: overrides and/or wrapper, MUI stories twinned with
// the DSCO ones, tests, README, codemod, augmentation, In Progress status row.
phase('Build')

const BUILD_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'legacyExports', 'muiStories', 'codemodCommand', 'checks', 'allChecksPass', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}},
    legacyExports: {
      type: 'array', items: {type: 'string'},
      description: `Names exported from ${COMPONENT_DIR}/index.ts that are now deprecated DSCO code (the wrapper's own exports are NOT listed). Verify greps consumers for these.`,
    },
    muiStories: {
      type: 'array',
      description: 'One MUI story per DSCO story, same visual state',
      items: {
        type: 'object',
        required: ['storyId', 'pairsWithDscoStoryId', 'exportName', 'file'],
        properties: {
          storyId: {type: 'string'},
          pairsWithDscoStoryId: {type: 'string'},
          exportName: {type: 'string'},
          file: {type: 'string'},
        },
      },
    },
    codemodCommand: {
      type: 'string',
      description: `Exact command consumers run (yarn script in ${LIB}/package.json taking a path), or "" if no codemod`,
    },
    checks: {
      type: 'object',
      required: ['vitest', 'typecheck', 'lint', 'build', 'storybookBuild'],
      properties: {
        vitest: {type: 'string', description: 'pass, or the failing test names'},
        typecheck: {type: 'string'},
        lint: {type: 'string'},
        build: {type: 'string', description: `yarn build in ${LIB}`},
        storybookBuild: {type: 'string', description: `yarn build in ${STORYBOOK}`},
      },
    },
    allChecksPass: {type: 'boolean'},
    notes: {type: 'string', description: 'Design decisions a reviewer needs; deviations from the propMap'},
  },
}

const buildBrief = `SCOUT PLAN
  approach:        ${scout.approach} (${scout.approachRationale || ''})
  muiComponents:   ${scout.muiComponents.join(', ')}
  exports:         ${scout.exports.join(', ')}
  componentFiles:  ${JSON.stringify(scout.componentFiles)}
  dscoStories:     ${JSON.stringify(scout.dscoStories)}
  propMap:         ${JSON.stringify(scout.propMap)}
  codemodFeasible: ${scout.codemodFeasible} ${scout.codemodNotes || ''}
  knownDeviations: ${scout.knownDeviations}
  risks:           ${scout.risks}`

let build = await agent(
  `You BUILD the MUI version of the DSCO "${component}" component inside the design
system. Nothing outside ${LIB}, ${STORYBOOK} and (only if an augmentation needs a
mirror) apps/src is yours in this phase.

${MIGRATION_RULES}

${TREE_RULES}

${buildBrief}

Do, in order:
1. Read the precedents and every componentFile. Read ${LIB}/README.md and
   ${LIB}/CONTRIBUTING.md (README hierarchy rule).
2. Implement the approach. Overrides: ${OVERRIDES_DIR}/${component}.ts(x), registered in
   index.ts, with defaultProps where the DSCO default differs from MUI's. Wrapper: a new
   MUI-native component in ${COMPONENT_DIR}, exported from index.ts beside the legacy one
   (see how ${LIB_SRC}/tooltip/index.ts keeps LegacyTooltip). Match the DSCO rendering in
   Light and Dark ([data-theme]) and RTL. Augmentations in ${AUGMENTATION}.
3. Stories: one MUI story per dscoStories entry, same visual state, under a title of the
   form 'DesignSystem/<Component>/<MuiName>'. Keep the DSCO stories untouched.
4. Tests: vitest coverage for the MUI version equal to the DSCO tests' intent; keep the
   legacy tests running (a separate file if the tooltip precedent fits).
5. README for ${COMPONENT_DIR}: how to use the MUI version, prop mapping table from the
   propMap, what consumers lose (kind drop).
6. Codemod: if codemodFeasible, write ${CODEMODS_DIR}/${component}-to-mui.ts modeled on
   button-to-mui-button.ts, add a yarn script "codemod:${component}" to ${LIB}/package.json,
   document it in ${CODEMODS_DIR}/README.md, and dry-run it on one apps consumer with
   jscodeshift --dry --print to confirm the output. --dry only: reverting a real run
   would need git checkout, which is forbidden here.
7. Mark the legacy DSCO component @deprecated in its JSDoc with the migration path. Set
   the component's row in ${STATUS_DOC} to In Progress with the override file and a
   note; update the STYLE_OVERRIDES code block there if you registered an override.
8. Checks, all from ${LIB} unless noted: yarn test; yarn typecheck; yarn lint; yarn build.
   Then yarn build in ${STORYBOOK}. Fix everything you broke; report each check's result.

Return the structured result.`,
  {schema: BUILD_SCHEMA, label: 'build', phase: 'Build'},
)
if (!build) throw new Error('build agent was skipped; nothing to gate or migrate')
if (!build.allChecksPass) {
  log(`Build checks failing (${Object.entries(build.checks).filter(([, v]) => v !== 'pass').map(([k]) => k).join(', ')}); one repair pass`)
  const repaired = await agent(
    `The BUILD of the MUI "${component}" left failing checks. Repair them without
changing behavior the stories and tests already pin down.

${TREE_RULES}

Failing checks: ${JSON.stringify(build.checks)}
Files the build touched: ${JSON.stringify(build.filesTouched)}
Build notes: ${build.notes}

Re-run every check (yarn test / typecheck / lint / build in ${LIB}; yarn build in
${STORYBOOK}) and report. filesTouched = the build's list plus anything you changed.
muiStories, legacyExports and codemodCommand: copy from the build unless you changed them:
${JSON.stringify({muiStories: build.muiStories, legacyExports: build.legacyExports, codemodCommand: build.codemodCommand})}`,
    {schema: BUILD_SCHEMA, label: 'build-repair', phase: 'Build'},
  )
  if (repaired) build = repaired
  if (!build.allChecksPass) throw new Error(`Build checks still failing: ${JSON.stringify(build.checks)}`)
}
log(`Build: ${build.filesTouched.length} file(s), ${build.muiStories.length} MUI story twin(s)${build.codemodCommand ? ', codemod ready' : ''}`)

// ── Phase 3: Parity ──────────────────────────────────────────────────────────
// Screenshot every DSCO/MUI story pair in Light+Dark and LTR+RTL from a static
// Storybook build, diff them numerically, then LOOK at them. A fix agent takes the
// mismatches back to the Build role until the judge passes or the budget runs out.
phase('Parity')

const PARITY_SCHEMA = {
  type: 'object',
  required: ['pairs', 'pass', 'summary'],
  properties: {
    pairs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['dscoStoryId', 'muiStoryId', 'theme', 'dir', 'dscoPng', 'muiPng', 'diffPng', 'mismatchRatio', 'verdict', 'notes'],
        properties: {
          dscoStoryId: {type: 'string'},
          muiStoryId: {type: 'string'},
          theme: {type: 'string', enum: ['Light', 'Dark']},
          dir: {type: 'string', enum: ['ltr', 'rtl']},
          dscoPng: {type: 'string', description: 'repo-root-relative path'},
          muiPng: {type: 'string'},
          diffPng: {type: 'string'},
          mismatchRatio: {type: 'number', description: 'pixelmatch mismatched pixels / total, 0..1'},
          verdict: {
            type: 'string',
            enum: ['match', 'acceptable', 'mismatch'],
            description: 'match: no visible difference; acceptable: sub-pixel antialiasing or a difference the notes justify; mismatch: a reviewer would reject it',
          },
          notes: {type: 'string', description: 'What differs, in words a Build agent can act on'},
        },
      },
    },
    pass: {type: 'boolean', description: 'true when no pair is a mismatch'},
    summary: {type: 'string'},
  },
}

const storyPairs = build.muiStories.map(m => ({
  mui: m.storyId,
  dsco: m.pairsWithDscoStoryId,
  state: (scout.dscoStories.find(s => s.storyId === m.pairsWithDscoStoryId) || {}).state || '',
}))

const parityPrompt = attempt => `You are the PARITY GATE for the MUI "${component}" (attempt ${attempt}/${maxParityAttempts}).
Decide whether the MUI stories render the same as their DSCO twins. Do not edit component
code; a separate fix agent does that from your notes.

${TREE_RULES}

STORY PAIRS (dsco -> mui): ${JSON.stringify(storyPairs)}

1. Build Storybook if dist/ is missing or older than the sources: yarn build in
   ${STORYBOOK}. Serve dist/component-library-storybook statically (npx http-server or
   python3 -m http.server) on a free port. Confirm every storyId exists in
   dist/component-library-storybook/index.json; if an id is off, use the id the index
   shows for that export and record it.
2. Screenshot with Playwright from frontend/node_modules (require it from that path; use
   chromium with channel 'chrome' if the bundled browser is absent). For each pair, for
   theme in Light, Dark and dir in ltr, rtl: open
   iframe.html?id=<storyId>&viewMode=story, set document.documentElement.dataset.theme
   and .dir before the story mounts (addInitScript), wait for fonts
   (document.fonts.ready) and a settled DOM, screenshot the story root (#storybook-root)
   clipped to its bounding box, both stories at the same viewport. Read
   ${STORYBOOK}/.storybook/preview.js first: if it already exposes a theme global, use it
   instead of writing the attribute by hand. Write PNGs under ${PARITY_DIR}/ named
   <exportName>-<theme>-<dir>-{dsco,mui,diff}.png.
3. Diff with pixelmatch from apps/node_modules (pngjs is there too): mismatchRatio and a
   diff PNG per pair. Sizes differ -> that is itself a mismatch; record both sizes.
4. LOOK at every pair with a mismatchRatio above 0.002 or any size difference: open the
   dsco, mui and diff PNGs with the Read tool and describe what differs (spacing, radius,
   weight, color, missing element). Grade each pair. Antialiasing-only noise is
   acceptable; anything a design reviewer would see is a mismatch.

Return the structured verdict. pass is true only when no pair is a mismatch.`

let parity = null
let parityAttempt = 0
while (parityAttempt < maxParityAttempts) {
  parityAttempt++
  parity = await agent(parityPrompt(parityAttempt), {schema: PARITY_SCHEMA, label: `parity-${parityAttempt}`, phase: 'Parity'})
  if (!parity) throw new Error('parity agent was skipped')
  const bad = parity.pairs.filter(p => p.verdict === 'mismatch')
  log(`Parity ${parityAttempt}: ${parity.pairs.length} pair(s), ${bad.length} mismatch(es)`)
  if (parity.pass) break
  if (parityAttempt >= maxParityAttempts) break
  const fix = await agent(
    `The PARITY GATE rejected the MUI "${component}". Fix the design-system side so the
MUI stories render like their DSCO twins. Same role and rules as the Build phase.

${MIGRATION_RULES}

${TREE_RULES}

MISMATCHES: ${JSON.stringify(bad)}
Look at each listed dsco/mui/diff PNG with the Read tool before changing anything. Fix
the override or wrapper, not the story, unless the story itself fails to reproduce the
DSCO story's state. Then re-run yarn test / typecheck / lint / build in ${LIB} and
yarn build in ${STORYBOOK}. Report every file touched.`,
    {schema: BUILD_SCHEMA, label: `parity-fix-${parityAttempt}`, phase: 'Parity'},
  )
  if (fix) {
    build.filesTouched = [...new Set([...build.filesTouched, ...fix.filesTouched])]
    build.notes += `\nParity fix ${parityAttempt}: ${fix.notes}`
  }
}
const parityStatus = parity.pass ? 'pass' : 'mismatches-remain'
if (!parity.pass) log(`Parity budget exhausted; ${parity.pairs.filter(p => p.verdict === 'mismatch').length} mismatch(es) go into the PR body for human review`)

// Showcase for the PR body: Light+LTR first, one per story, then Dark, capped at six
// pairs so a component with many stories does not bury the review.
const showcase = []
for (const pref of [{theme: 'Light', dir: 'ltr'}, {theme: 'Dark', dir: 'ltr'}]) {
  for (const p of parity.pairs) {
    if (showcase.length >= 6) break
    const dup = showcase.some(s => s.dscoStoryId === p.dscoStoryId && s.theme === p.theme)
    if (p.theme === pref.theme && p.dir === pref.dir && !dup) showcase.push(p)
  }
}

// ── Commit the design-system PR before consumers start ──────────────────────
// Consumers build on top of this commit, so it is carved now, while the only changes in
// the tree are the design-system ones.
const branchPrefix = a.branchPrefix || `${scout.branchOwner || 'mui'}/mui-${component}`
const DS_BRANCH = `${branchPrefix}/1-design-system`
const componentTitle = component.charAt(0).toUpperCase() + component.slice(1)

const COMMIT_SCHEMA = {
  type: 'object',
  required: ['branch', 'sha', 'leftovers'],
  properties: {
    branch: {type: 'string'},
    sha: {type: 'string'},
    leftovers: {type: 'array', items: {type: 'string'}, description: 'Changed tracked or new files NOT committed, excluding preexisting untracked paths'},
  },
}

const dsCommit = await agent(
  `Carve the design-system commit for the MUI "${component}" migration. Run from the
repo root. This is the ONE phase that may use git write commands.

1. git checkout -b ${DS_BRANCH}   (from current HEAD)
2. Stage exactly the design-system files: every path in this list that exists, plus any
   changed path under ${LIB} or ${STORYBOOK}:
   ${JSON.stringify(build.filesTouched)}
   Never stage these preexisting untracked paths: ${JSON.stringify(scout.preexistingUntracked)}
   Never stage anything under ${STORYBOOK}/dist.
3. Commit with this message (heredoc keeps the newlines):
     [Design System] Add MUI ${componentTitle}

     ${scout.approach === 'overrides' ? 'Theme style overrides' : scout.approach === 'wrapper' ? 'MUI-native wrapper' : 'Theme overrides plus an MUI-native wrapper'} for ${scout.muiComponents.join(', ')}, twinned stories, tests, README${build.codemodCommand ? ', codemod' : ''}.
     Legacy DSCO ${componentTitle} is deprecated; consumers move in the stacked PRs.

     ${COMMIT_TRAILER}
   The pre-commit hook lints staged files. Fix lint errors inside the staged files,
   re-stage, commit again. Do not bypass the hook.
4. Report branch, sha (git rev-parse HEAD), and leftovers: git status --porcelain paths
   other than the preexisting untracked ones and ${STORYBOOK}/dist.`,
  {schema: COMMIT_SCHEMA, label: 'commit-design-system', phase: 'Parity'},
)
if (!dsCommit) throw new Error('design-system commit agent was skipped')
if (dsCommit.leftovers.length) log(`WARNING: uncommitted after DS carve: ${dsCommit.leftovers.join(', ')}`)
log(`Committed ${DS_BRANCH} @ ${dsCommit.sha.slice(0, 10)}`)

// ── Phase 4: Migrate ─────────────────────────────────────────────────────────
// One agent per chunk, all in the same tree. Chunks own disjoint files, so no worktree
// isolation; the rules forbid the git and build commands that would collide.
phase('Migrate')

const CHUNK_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'filesSkipped', 'tests', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}},
    filesSkipped: {
      type: 'array',
      description: 'Assigned consumers left on DSCO, each with the reason (a dropped prop it depends on, a UI test that pins the DOM, ...)',
      items: {type: 'object', required: ['file', 'reason'], properties: {file: {type: 'string'}, reason: {type: 'string'}}},
    },
    tests: {type: 'string', description: 'The exact test command(s) run and pass/fail per file'},
    notes: {type: 'string', description: 'Behavior changes a reviewer must know about'},
  },
}

// For agents whose only contract is "which files did you edit": heal and docs.
const TOUCHED_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}},
    notes: {type: 'string'},
  },
}

const chunkResults = chunks.length
  ? await pipeline(chunks, (chunk, _item, i) =>
      agent(
        `You MIGRATE consumer chunk ${i + 1}/${chunks.length} ("${chunk.slug}") of the DSCO
"${component}" to MUI. Other agents are migrating other chunks in this same working tree
right now: touch only your files and their companions.

${MIGRATION_RULES}

${TREE_RULES}
- Additionally: no yarn build anywhere (the design-system dist is already current), no
  full test suites, no apps typecheck (Verify runs it once).

YOUR FILES: ${JSON.stringify(chunk.files)}
PROP MAP: ${JSON.stringify(scout.propMap)}
MUI COMPONENTS: ${scout.muiComponents.join(', ')}
BUILD NOTES: ${build.notes}
${build.codemodCommand ? `CODEMOD: from ${LIB}, run \`${build.codemodCommand} <path>\` per file (paths relative to that directory, see ${CODEMODS_DIR}/README.md), then hand-fix what it leaves.` : 'CODEMOD: none. Migrate by hand.'}
${chunk.groups[0] === '0-component-library-internal' ? `This chunk is the inside-out replacement: other design-system components importing the legacy ${componentTitle}. After editing, run yarn test and yarn typecheck in ${LIB}.` : ''}

For each consumer: replace the DSCO import and JSX with the MUI equivalent per the prop
map and ${COMPONENT_DIR}/README.md. Keep behavior: callbacks, ids, data-testids,
aria attributes, and class hooks that tests or UI tests read. Move any styling that the
DSCO props carried into the consumer's .module.scss with semantic tokens. Delete scss
that only styled the DSCO internals. Where a consumer depends on a dropped prop with no
MUI path, leave it on DSCO and record it in filesSkipped with the reason.
Match the file's existing language: JS files stay JS.

Tests: run each consumer's unit test. apps: from apps/, yarn test:unit <test files>.
frontend packages: from that package, yarn test <file>. Update snapshots only when the
diff is exactly the DSCO->MUI DOM change. Lint your files: from apps/, npx eslint
<files>; frontend: yarn lint in the package. Fix what you broke.

Return the structured result.`,
        {schema: CHUNK_SCHEMA, label: `migrate:${chunk.slug}`, phase: 'Migrate'},
      ),
    )
  : []

const migrated = chunkResults.map((r, i) => ({chunk: chunks[i], result: r}))
const skippedChunks = migrated.filter(m => !m.result)
if (skippedChunks.length) log(`WARNING: ${skippedChunks.length} chunk agent(s) returned nothing: ${skippedChunks.map(m => m.chunk.slug).join(', ')}`)
const allSkippedFiles = migrated.flatMap(m => (m.result ? m.result.filesSkipped : []))
log(`Migrate: ${migrated.filter(m => m.result).reduce((n, m) => n + m.result.filesTouched.length, 0)} file(s) touched, ${allSkippedFiles.length} consumer(s) left on DSCO`)

// ── Phase 5: Verify ──────────────────────────────────────────────────────────
// One pass over the whole dirty tree: the checks Drone would run, plus the UI-test
// selector audit. Heal fixes in place; the carve step routes its edits to the owning PR.
phase('Verify')

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['pass', 'checks', 'failures', 'remainingLegacyImports', 'filesTouched'],
  properties: {
    pass: {type: 'boolean'},
    remainingLegacyImports: {
      type: 'array', items: {type: 'string'},
      description: `Files outside ${COMPONENT_DIR} that still import a legacy export of the component, from a fresh repo-wide grep (not from the chunk reports)`,
    },
    checks: {
      type: 'object',
      required: ['appsTypecheck', 'appsUnit', 'appsLint', 'libTests', 'libTypecheck', 'libBuild', 'frontendPackages', 'storybookBuild', 'uiTestSelectors'],
      properties: {
        appsTypecheck: {type: 'string', description: 'pass, or first errors'},
        appsUnit: {type: 'string'},
        appsLint: {type: 'string'},
        libTests: {type: 'string'},
        libTypecheck: {type: 'string'},
        libBuild: {type: 'string'},
        frontendPackages: {type: 'string', description: 'per package touched: test + typecheck + lint'},
        storybookBuild: {type: 'string'},
        uiTestSelectors: {type: 'string', description: 'which UI-test files needed selector updates, or "none needed"'},
      },
    },
    failures: {
      type: 'array',
      items: {
        type: 'object',
        required: ['check', 'detail', 'suspectFiles'],
        properties: {check: {type: 'string'}, detail: {type: 'string'}, suspectFiles: {type: 'array', items: {type: 'string'}}},
      },
    },
    filesTouched: {type: 'array', items: {type: 'string'}, description: 'Files this phase edited (UI-test selector updates, small fixes)'},
  },
}

const touchedByMigrate = [...new Set(migrated.flatMap(m => (m.result ? m.result.filesTouched : [])))]
const allTestFiles = [...new Set(chunks.flatMap(c => c.consumers.flatMap(x => x.testFiles || [])))]
const frontendPkgsTouched = [...new Set(touchedByMigrate.map(f => (f.match(/^frontend\/(packages|apps)\/[^/]+/) || [])[0]).filter(Boolean))]

const verifyPrompt = attempt => `You VERIFY the whole MUI "${component}" migration (attempt ${attempt}/${maxHealAttempts}).
Run the checks below on the current tree and report each result exactly. Fix nothing
except UI-test selectors (step 6), which are yours.

${TREE_RULES}

FILES THE MIGRATION TOUCHED: ${JSON.stringify(touchedByMigrate)}
UNIT TESTS TO RUN (apps): ${JSON.stringify(allTestFiles.filter(f => f.startsWith('apps/')))}
FRONTEND PACKAGES TOUCHED: ${JSON.stringify(frontendPkgsTouched)}
UI-TEST FILES TO AUDIT: ${JSON.stringify(scout.uiTestFiles)}

1. ${LIB}: yarn test; yarn typecheck; yarn build (the dist must be current before apps
   checks). ${STORYBOOK}: yarn build.
2. apps/: yarn run typecheck.
3. apps/: yarn test:unit <all listed apps test files> in ONE jest invocation; also any
   test file under apps/test whose basename matches a touched source file.
4. Lint like Drone: stage every touched file with git add -- <files> (this is the one
   git write you may do), run ./tools/hooks/pre-commit from the repo root, then git
   reset -q to unstage. Report the output. Never stage
   ${JSON.stringify(scout.preexistingUntracked)}.
5. Each frontend package touched: yarn test, yarn typecheck, yarn lint from its directory.
6. UI-test selectors: read every listed UI-test file. Where a selector depends on DSCO
   DOM this migration changed (class name, wrapper nesting, role), rewrite it to match
   the MUI DOM by reading the migrated consumer and the MUI component's rendered
   structure (MUI class names via *Classes exports are stable; prefer role/name or
   data-testid). Report which files you changed in filesTouched. Do not run Cucumber.
7. Import audit, independent of what the chunk agents reported: grep the whole repo
   (apps/src, apps/test, frontend, dashboard, ${LIB_SRC}; exclude ${COMPONENT_DIR}) for
   both import forms of the component (package path and relative) and list every file
   whose named imports include one of these legacy exports:
   ${JSON.stringify(build.legacyExports)}. That list is remainingLegacyImports. It does
   not affect pass; the Docs phase uses it to decide whether the component is Migrated.

pass is true only when every check is clean. For failures, name the files most likely
at fault so a healer can start there.`

let verify = null
let healAttempt = 0
let healTouched = []
while (true) {
  healAttempt++
  verify = await agent(verifyPrompt(healAttempt), {schema: VERIFY_SCHEMA, label: `verify-${healAttempt}`, phase: 'Verify'})
  if (!verify) throw new Error('verify agent was skipped')
  log(`Verify ${healAttempt}: ${verify.pass ? 'clean' : verify.failures.length + ' failure(s): ' + verify.failures.map(f => f.check).join(', ')}`)
  healTouched = [...new Set([...healTouched, ...verify.filesTouched])]
  if (verify.pass || healAttempt >= maxHealAttempts) break
  const heal = await agent(
    `You HEAL failing checks in the MUI "${component}" migration (attempt ${healAttempt}/${maxHealAttempts}).

${MIGRATION_RULES}

${TREE_RULES}

FAILURES: ${JSON.stringify(verify.failures)}
FULL CHECK REPORT: ${JSON.stringify(verify.checks)}
FILES THE MIGRATION TOUCHED: ${JSON.stringify([...touchedByMigrate, ...build.filesTouched, ...healTouched])}

Fix the root cause, not the assertion: a failing test that pins DSCO DOM gets its
expectation updated; a failing typecheck gets its types fixed; a lint error gets its
code fixed. If the design-system side is at fault, fix it under ${LIB} and run yarn
build there. Re-run only the checks that failed, then return filesTouched and notes.`,
    {schema: TOUCHED_SCHEMA, label: `heal-${healAttempt}`, phase: 'Verify'},
  )
  if (heal) healTouched = [...new Set([...healTouched, ...heal.filesTouched])]
}
const verifyStatus = verify.pass ? 'green' : 'failing'

// ── Phase 6: Docs ────────────────────────────────────────────────────────────
phase('Docs')

// Agents' own reports are necessary but not sufficient: the Verify grep is the
// evidence that no legacy import is left.
const fullyMigrated =
  allSkippedFiles.length === 0 && skippedChunks.length === 0 && verify.remainingLegacyImports.length === 0
if (!fullyMigrated && verify.remainingLegacyImports.length) {
  log(`${verify.remainingLegacyImports.length} file(s) still import the legacy ${component}: ${verify.remainingLegacyImports.join(', ')}`)
}
const docs = await agent(
  `You update the DOCS for the MUI "${component}" migration. Docs only; no component or
consumer code.

${TREE_RULES}

STATE
  approach:         ${scout.approach}; MUI ${scout.muiComponents.join(', ')}
  codemod:          ${build.codemodCommand || 'none'}
  consumers total:  ${scout.consumers.length}; left on DSCO: ${JSON.stringify(allSkippedFiles)}
  legacy imports still found by grep: ${JSON.stringify(verify.remainingLegacyImports)}
  fully migrated:   ${fullyMigrated}
  parity:           ${parityStatus}; known Figma drift: ${scout.knownDeviations}
  dropped props:    ${JSON.stringify(dropped)}

1. ${STATUS_DOC}: set the ${component} row to ${fullyMigrated ? '**Migrated**' : 'In Progress'}, MUI
   equivalent, override file, and a note in the style of the tooltip row (what moved,
   what remains). Keep the STYLE_OVERRIDES block and Internal Dependency Blockers section
   truthful. Fix any stale statement you have to read to do this (for example a file path
   that no longer exists) but touch nothing unrelated.
2. ${SKILL_DOC}: move ${componentTitle} into the "Use MUI" list with the import to use, and
   out of the "Use DSCO" list. Keep the file's terse style.
3. ${COMPONENT_DIR}/README.md: confirm it documents the MUI path first and the legacy
   path as deprecated. ${CODEMODS_DIR}/README.md: confirm the codemod is documented if
   one exists.
4. ${fullyMigrated ? `${ESLINT_APPS}: add a no-restricted-imports entry for '@code-dot-org/component-library/${component}' next to the button entry, message naming the MUI replacement${build.codemodCommand ? ' and the codemod command' : ''}. Skip this if the wrapper lives at that same import path (then the path stays legitimate).` : `Do NOT add the eslint no-restricted-imports rule: consumers remain on DSCO.`}
5. Run prettier on the markdown you changed if the package has a prettier script.

Return filesTouched (and notes on anything you could not make truthful).`,
  {schema: TOUCHED_SCHEMA, label: 'docs', phase: 'Docs'},
)
const docsTouched = docs ? docs.filesTouched : []

// ── Phase 7: Publish ─────────────────────────────────────────────────────────
// Carve the consumer commits onto stacked branches by file ownership, park the
// screenshots on an orphan branch, push, open one draft PR per branch.
phase('Publish')

// Heal and Verify edits go to the chunk that owns the file, else to the chunk whose
// area contains it (this keeps component-library-internal consumers out of the
// design-system fixup), else to the design-system fixup, else to the last chunk.
const ownerOf = file => {
  for (let i = 0; i < chunks.length; i++) {
    const touched = migrated[i].result && migrated[i].result.filesTouched.includes(file)
    if (chunks[i].files.includes(file) || touched) return i
  }
  const g = groupOf(file)
  for (let i = 0; i < chunks.length; i++) if (chunks[i].groups.includes(g)) return i
  if (file.startsWith(LIB) || file.startsWith(STORYBOOK)) return 'ds'
  return chunks.length ? chunks.length - 1 : 'ds'
}
const extraFiles = [...new Set([...healTouched, ...touchedByMigrate])].filter(f => !chunks.some(c => c.files.includes(f)))
const dsFixups = []
for (const f of extraFiles) {
  const o = ownerOf(f)
  if (o === 'ds') dsFixups.push(f)
  else chunks[o].files = [...new Set([...chunks[o].files, f])]
}

const consumerBranches = chunks.map((c, i) => ({
  branch: `${branchPrefix}/${i + 2}-consumers-${c.slug}`,
  files: c.files,
  slug: c.slug,
  groups: c.groups,
  skipped: migrated[i].result ? migrated[i].result.filesSkipped : c.consumers.map(x => ({file: x.file, reason: 'chunk agent returned nothing'})),
  notes: migrated[i].result ? migrated[i].result.notes : '',
  tests: migrated[i].result ? migrated[i].result.tests : '',
}))
const lastBranch = consumerBranches.length ? consumerBranches[consumerBranches.length - 1].branch : DS_BRANCH
const totalPrs = consumerBranches.length + 1

const mismatches = parity.pairs.filter(p => p.verdict === 'mismatch')
const failingSection = verifyStatus === 'failing'
  ? `\n## ⚠ Failing checks\nThe workflow's heal budget ran out with these still failing. Fix before review.\n${verify.failures.map(f => `- **${f.check}**: ${f.detail}`).join('\n')}\n`
  : ''

const PUBLISH_SCHEMA = {
  type: 'object',
  required: ['branches', 'prs', 'screenshotsBranch', 'leftovers'],
  properties: {
    branches: {
      type: 'array',
      items: {type: 'object', required: ['branch', 'sha', 'fileCount'], properties: {branch: {type: 'string'}, sha: {type: 'string'}, fileCount: {type: 'number'}}},
    },
    prs: {
      type: 'array',
      items: {type: 'object', required: ['branch', 'base', 'url'], properties: {branch: {type: 'string'}, base: {type: 'string'}, url: {type: 'string'}}},
    },
    screenshotsBranch: {type: 'string', description: 'branch@sha holding the PNGs, or ""'},
    leftovers: {type: 'array', items: {type: 'string'}, description: 'Changed paths not committed anywhere (excluding preexisting untracked)'},
  },
}

const published = await agent(
  `You PUBLISH the MUI "${component}" migration as stacked branches${publish ? ' and draft PRs' : ' (local only: no push, no PRs)'}.
This phase owns git. Run from the repo root. HEAD is on ${DS_BRANCH}. Work in this order
and stop at the first git error rather than improvising around it.

NEVER stage: ${JSON.stringify(scout.preexistingUntracked)}, anything under ${STORYBOOK}/dist,
or any *.png outside the screenshots branch step.

─── 1. Design-system fixups (still on ${DS_BRANCH}) ─────────────────────────────
  Exactly these files, and nothing else under ${LIB} (the docs and the internal
  consumer chunks also changed files there; those belong to later branches):
  ${JSON.stringify(dsFixups)}
  If the list is non-empty: git add -- <them>; commit
  "[Design System] MUI ${componentTitle}: fixups from the consumer sweep" with the trailer
  ${COMMIT_TRAILER}

─── 2. Consumer commits, one branch each, stacked ───────────────────────────────
  For k over this list, in order (each branch is created from the previous one's tip):
  ${JSON.stringify(consumerBranches.map(b => ({branch: b.branch, files: b.files})))}
    git checkout -b <branch>
    git add -- <those files that exist or are deleted>   (a deleted path needs git add too; a listed path that never changed is skipped)
    commit:
      [MUI Migration] ${componentTitle} consumers (<k>/${consumerBranches.length}): <slug>

      Move the listed consumers from DSCO ${componentTitle} to MUI. Stacked on the previous PR.

      ${COMMIT_TRAILER}
  The pre-commit hook lints staged files; fix lint errors in the staged files, re-stage, retry.

─── 3. Docs commit on the last branch (${lastBranch}) ───────────────────────────
  git add -- ${JSON.stringify(docsTouched)}; commit "[MUI Migration] ${componentTitle}: docs, skill, deprecation${fullyMigrated ? ', eslint rule' : ''}" with the trailer.
  Then git status --porcelain: anything left besides the never-stage list goes into one
  more commit on this branch, "[MUI Migration] ${componentTitle}: leftovers", and into leftovers in your report.
${publish ? `
─── 4. Screenshots branch ───────────────────────────────────────────────────────
  Park the showcase PNGs where a PR body can reference them without polluting any PR:
    git worktree add --detach ../.mui-shots-${component} HEAD   (path outside this tree; remove it at the end)
    cd there; git checkout --orphan ${branchPrefix}/screenshots; git rm -rfq .
    copy these files in, flat, keeping basenames: ${JSON.stringify(showcase.flatMap(p => [p.dscoPng, p.muiPng]))}
    git add . ; commit "MUI ${componentTitle} parity screenshots (not for merge)"; git push -u origin ${branchPrefix}/screenshots
    SHA=$(git rev-parse HEAD); cd back; git worktree remove --force ../.mui-shots-${component}
  Image URL form (public repo): https://raw.githubusercontent.com/code-dot-org/code-dot-org/<SHA>/<basename>

─── 5. Push and open draft PRs ──────────────────────────────────────────────────
  git push -u origin <branch> for ${DS_BRANCH} and every consumer branch.
  Then, in stack order, gh pr create --draft --base <base> --head <branch> --title <subject> --body-file <file>
  where base is ${base} for ${DS_BRANCH} and the previous branch for each consumer branch.
  Titles: the commit subjects above. Bodies follow .github/pull_request_template.md
  (read it): fill Summary, Links, Testing story; delete Deployment notes and Privacy
  sections; end with "${PR_FOOTER}".

  Design-system PR body includes:
    - approach (${scout.approach}) and MUI components; prop map as a table from:
      ${JSON.stringify(scout.propMap)}
    - dropped props (consumers lose): ${JSON.stringify(dropped.map(p => p.dscoProp))}
    - a "Parity" section: a table with columns Story | Theme | DSCO | MUI, one row per
      showcase pair, images via the URL form above; below it the mismatch ratio per row.
      ${mismatches.length ? `Then an "Open mismatches" list: ${JSON.stringify(mismatches.map(m => ({story: m.muiStoryId, theme: m.theme, dir: m.dir, notes: m.notes})))}` : 'State that every pair passed the gate.'}
    - known Figma drift carried over, for a later reconciliation: ${scout.knownDeviations}
    - "Stack" section: this is PR 1 of ${totalPrs}; list the consumer PR URLs once created
      (edit this body with gh pr edit after all PRs exist).
    - build notes: ${build.notes}
  Each consumer PR body includes: which areas (${consumerBranches.map(b => b.groups.join(', ')).join(' | ')}),
  its consumers left on DSCO with reasons, its agent notes and tests run, "Stack: PR k of
  ${totalPrs}, stacked on <previous PR URL>". The last one also lists the docs changes${fullyMigrated ? ' and the new eslint rule' : ''}.
  ${jira ? `Links: Jira ${jira}.` : 'Links: no Jira given; leave the bullet for the author.'}
  ${failingSection ? `Every PR body carries this section verbatim:\n${failingSection}` : ''}
  Per-branch data: ${JSON.stringify(consumerBranches.map(b => ({branch: b.branch, groups: b.groups, skipped: b.skipped, notes: b.notes, tests: b.tests})))}
` : `
─── 4. No push ──────────────────────────────────────────────────────────────────
  publish is false. Do not push, do not run gh. Report screenshotsBranch as "".`}

Finish on ${lastBranch} with a clean tree (except the never-stage list). Report every
branch with its sha and file count, every PR URL, and leftovers.`,
  {schema: PUBLISH_SCHEMA, label: 'publish', phase: 'Publish'},
)
if (!published) throw new Error('publish agent was skipped; branches may be half carved')
if (published.leftovers.length) log(`WARNING: uncommitted leftovers: ${published.leftovers.join(', ')}`)
log(`Published ${published.branches.length} branch(es)${publish ? `, ${published.prs.length} draft PR(s)` : ' (local only)'}; verify ${verifyStatus}, parity ${parityStatus}`)

return {
  component,
  approach: scout.approach,
  consumers: scout.consumers.length,
  leftOnDsco: allSkippedFiles,
  parity: parityStatus,
  verify: verifyStatus,
  branches: published.branches,
  prs: published.prs,
  screenshotsBranch: published.screenshotsBranch,
  leftovers: published.leftovers,
}
