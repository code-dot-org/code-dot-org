export const meta = {
  name: 'dsco-mui-design-system-migration-planned',
  description:
    'Migrate one DSCO component to MUI in four phases: discover, plan (a reviewable doc that decides approach and codemod), execute with a parity gate, then codemod-first consumer sweep with a verify gate and stacked draft PRs',
  phases: [
    {title: 'Discover', detail: 'component surface, consumers, UI-test hooks, baseline Storybook screenshots'},
    {title: 'Plan', detail: 'approach, export policy, prop map, codemod spec, parity tolerance, chunks; written to a doc the PR carries'},
    {title: 'Execute', detail: 'design-system code per the plan, parity gate against the baselines, design-system PR opened early'},
    {title: 'Migrate', detail: 'codemod over every consumer, residue by chunk, verify gate, sampled apps parity, stacked consumer PRs'},
  ],
}

// The second shape for the same job as dsco-mui-design-system-migration.js, written so
// the two can be run on the same component and compared. Differences from that script:
//
//   - A Plan phase between discovery and code. It decides approach, export names, the
//     prop map, whether a codemod is mandatory, the parity tolerance, which legacy defects
//     to fix while here, and how consumers are chunked. It writes those decisions to
//     <component>/<COMPONENT>_MIGRATION_TO_MUI.md (the button precedent), which the
//     design-system PR carries, so a human can object before code exists. `stopAfterPlan`
//     halts the run there; resume with resumeFromRunId to continue from cache.
//   - Baseline screenshots of the DSCO stories are taken in Discover, before any code
//     changes, and the parity gate compares MUI twins against them.
//   - The codemod runs first over every consumer; chunk agents handle only the residue.
//     When the prop map is all direct/rename the plan must require a codemod (the dialog
//     run hand-edited 38 pure renames because an early heuristic said no).
//   - The design-system PR opens as soon as parity passes, before the consumer sweep,
//     so review starts while the sweep runs. Sweep-time fixups land as follow-up commits.
//   - Optional apps-level parity: the plan names a few consumer pages with a recipe; a
//     before/after capture runs against a local studio when one is reachable.
//   - Fewer handoffs: Discover -> Plan -> Execute -> Migrate, with Parity and Verify kept
//     as independent gate agents (a gate should not grade its own work).
//
// Models are chosen by alias so they track the latest release: Discover and the
// mechanical codemod run use `sonnet`; everything else inherits the session model.
//
// args: the DSCO component directory name, or an object:
//   Workflow({name: 'dsco-mui-design-system-migration-planned', args: 'dialog'})
//   Workflow({name: 'dsco-mui-design-system-migration-planned',
//             args: {component: 'dialog', stopAfterPlan: true}})
//
//   component        required. A family that shares a base (the dropdowns) is one run.
//   base             branch the first PR targets (default 'staging'). HEAD must be an
//                    ancestor of origin/<base>; Discover aborts otherwise.
//   branchPrefix     branch namespace (default '<owner>/mui-<component>').
//   chunkSize        consumer files per PR (default: the plan's choice, else 25).
//   jira             ticket key or browse URL for the PR bodies (default none).
//   publish          false carves local branches only: no push, no PRs.
//   stopAfterPlan    true returns after the plan doc is written; nothing is committed.
//   parityTolerance  mismatch ratio treated as acceptable (default 0.005, i.e. 0.5%).
//   appsParity       false skips the sampled apps-level capture even when a studio is up.
//   force            true proceeds when the status doc already lists the component as
//                    In Progress or Migrated. It does not reuse branches.
//   maxParityAttempts / maxHealAttempts  loop budgets (default 3 each).
//
// Run from a checkout that has apps/node_modules, frontend/node_modules and apps/build,
// with no tracked modifications: the run commits as it goes.
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
// Both end up inside git and gh commands an agent types, so they must be plain ref names.
const refName = (v, name) => {
  if (v === undefined) return undefined
  if (typeof v !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(v) || v.includes('..') || v.endsWith('/')) {
    throw new Error(`${name} must be a plain git ref name, got ${JSON.stringify(v)}`)
  }
  return v
}
const base = refName(a.base, 'base') || 'staging'
const branchPrefixArg = refName(a.branchPrefix, 'branchPrefix')
const chunkSizeArg = a.chunkSize === undefined ? undefined : positiveInt(a.chunkSize, 25, 'chunkSize')
// A ticket key or its browse URL; anything else is text that would land inside a prompt.
const jira = a.jira === undefined ? '' : a.jira
if (jira !== '' && !(typeof jira === 'string' && /^(https:\/\/[a-z0-9.-]+\.atlassian\.net\/browse\/)?[A-Z][A-Z0-9]+-\d+$/.test(jira))) {
  throw new Error(`jira must be a ticket key like RE-190 or its Atlassian browse URL, got ${JSON.stringify(jira)}`)
}
const publish = a.publish !== false
const stopAfterPlan = !!a.stopAfterPlan
const appsParity = a.appsParity !== false
const force = !!a.force
const parityTolerance = a.parityTolerance === undefined ? 0.005 : a.parityTolerance
if (typeof parityTolerance !== 'number' || !(parityTolerance >= 0 && parityTolerance < 0.1)) {
  throw new Error(`parityTolerance must be a ratio in [0, 0.1), got ${JSON.stringify(a.parityTolerance)}`)
}
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
const PLAN_DOC = `${COMPONENT_DIR}/${component.toUpperCase().replace(/-/g, '_')}_MIGRATION_TO_MUI.md`
// Storybook's dist/ is gitignored, so screenshots parked here never reach a commit.
const PARITY_DIR = `${STORYBOOK}/dist/parity/${component}`
const BASELINE_DIR = `${PARITY_DIR}/baseline`
const COMMIT_TRAILER = 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>'
const PR_FOOTER = '🤖 Generated with [Claude Code](https://claude.com/claude-code)'
const componentTitle = component.charAt(0).toUpperCase() + component.slice(1)

// Shared rules for every agent that edits files. Chunk agents run concurrently in ONE
// working tree, so anything that moves HEAD or the index would corrupt a sibling's work.
const TREE_RULES = `## Working-tree rules
- All paths are repo-root relative; run commands from the repo root unless told otherwise.
- Never run git checkout, stash, reset, commit, rebase, clean, or add. The commit steps own
  git. Read-only git (status, diff, log, show, grep) is fine.
- Edit only the files this brief assigns to you, plus files that exist solely to serve
  one of them (its .module.scss, its test, its story, a jest snapshot). Report every file
  you create, modify, or delete in filesTouched, or the carve cannot place your work.
- No new dependencies. No inline styles. Semantic CSS tokens
  (@code-dot-org/component-library-styles/colors.css) before primitives.
- Comments state a fact the code cannot show; never narrate the code. One line each.
- apps/ resolves @code-dot-org/component-library to its dist/. After editing the package,
  run \`yarn build\` in ${LIB} or apps sees stale code.
- Inside a frontend package, \`yarn lint\` fails with "command not found: eslint": the
  binary is hoisted. Run \`../../node_modules/.bin/eslint .\` from the package.
- Storybook: build with \`yarn build\` in ${STORYBOOK}, serve dist/component-library-storybook
  statically and open it as http://localhost:<port>, never 127.0.0.1 (dsco.code.org's font
  CORS allows only the localhost origin; stories do not render without the fonts).`

const MIGRATION_RULES = `## Migration rules
- The MUI version reproduces what the DSCO component renders TODAY, within the plan's
  parity tolerance, except for the legacy defects the plan lists as fixed while here.
  Figma is out of scope; a later run reconciles MUI with Figma.
- Approach options: pure theme style overrides in ${OVERRIDES_DIR} when every DSCO prop
  maps onto an MUI prop or slot (Tooltip, Button did this); an MUI-native wrapper inside
  ${COMPONENT_DIR} (the way notification-banner is built) when the DSCO component carries
  composition or behavior MUI lacks; both when the wrapper is thin and the look belongs
  in the theme. The Plan phase decides; later phases follow the plan.
- Precedents: ${OVERRIDES_DIR}/tooltip.ts and ${LIB_SRC}/tooltip/ (exports, README,
  stories, tests); ${OVERRIDES_DIR}/button.tsx; ${LIB_SRC}/button/BUTTON_MIGRATION_TO_MUI.md
  (the plan-doc precedent); ${LIB}/CONTRIBUTING.md; ${STATUS_DOC} sections "How to Migrate"
  and "Migration Strategy".
- Register overrides in ${OVERRIDES_DIR}/index.ts. Type augmentations go in ${AUGMENTATION}.
- Story titles follow 'DesignSystem/<Component>/<Name>'. Keep the DSCO stories: every DSCO
  story needs an MUI twin with the same visual state, and the gate diffs them.
- When the legacy component owns a global side effect (body scroll lock, document key
  listeners, z-index stacking, a portal target), the MUI version must share the SAME
  manager the legacy one uses, not run a parallel one: both coexist during the staged
  migration and two managers release each other's state out of order.
- Consumers import MUI from '@mui/material' (aliased MuiX when a local name collides) or
  the wrapper from '@code-dot-org/component-library/${component}'. CdoTheme is already
  applied at the app level.`

// ── Phase 1: Discover ────────────────────────────────────────────────────────
// Facts only: the component's surface, its consumers, the UI-test hooks that depend on
// its DOM, and baseline screenshots of every DSCO story. It recommends nothing final.
phase('Discover')

const DISCOVER_SCHEMA = {
  type: 'object',
  required: [
    'preflight', 'startRef', 'headOnBase', 'branchOwner', 'existingBranches', 'preexistingUntracked',
    'alreadyMigrated', 'componentFiles', 'exports', 'defaultExportIsLegacy', 'propsSurface',
    'dscoStories', 'baselines', 'captureRecipe', 'consumers', 'uiTestFiles', 'legacyGlobals',
    'legacyDefects', 'approachHint', 'muiCandidates', 'risks',
  ],
  properties: {
    preflight: {
      type: 'object',
      required: ['ok', 'problems'],
      properties: {
        ok: {type: 'boolean'},
        problems: {type: 'array', items: {type: 'string'}, description: 'Each blocker in one line'},
      },
    },
    startRef: {type: 'string', description: 'Current branch name'},
    headOnBase: {type: 'boolean', description: `true if HEAD is an ancestor of origin/${base}`},
    branchOwner: {
      type: 'string',
      description: "Namespace this developer uses for branches: first segment of startRef when it contains '/', else the most common first segment among local branches containing '/', else the first word of git config user.name, lowercase",
    },
    existingBranches: {
      type: 'array', items: {type: 'string'},
      description: `Local or origin branches matching */mui-${component}/*; a previous run left them and this run cannot reuse them`,
    },
    preexistingUntracked: {
      type: 'array', items: {type: 'string'},
      description: 'Untracked paths present before the run (git status --porcelain ?? lines); never committed by this run',
    },
    alreadyMigrated: {
      type: 'boolean',
      description: `true if ${STATUS_DOC} lists the component as In Progress or Migrated, or an override/wrapper for it exists`,
    },
    componentFiles: {type: 'array', items: {type: 'string'}, description: `Every file under ${COMPONENT_DIR}`},
    exports: {type: 'array', items: {type: 'string'}, description: `Public exports of ${COMPONENT_DIR}/index.ts`},
    defaultExportIsLegacy: {type: 'boolean', description: 'true if index.ts has a default export and it is the legacy component'},
    propsSurface: {
      type: 'array',
      description: 'One entry per DSCO prop and per behavioral contract (focus, Escape, scroll lock, ids, roles, console.warn contracts)',
      items: {
        type: 'object',
        required: ['name', 'type', 'meaning', 'consumerCount'],
        properties: {
          name: {type: 'string'},
          type: {type: 'string', description: 'TypeScript type as declared, or "behavior"'},
          meaning: {type: 'string', description: 'What it does, in one line'},
          consumerCount: {type: 'number', description: 'How many consumer files pass or depend on it (grep)'},
          muiCandidate: {type: 'string', description: 'The obvious MUI prop/slot if there is one, else ""'},
        },
      },
    },
    dscoStories: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'title', 'exportName', 'storyId', 'state'],
        properties: {
          file: {type: 'string'},
          title: {type: 'string'},
          exportName: {type: 'string'},
          storyId: {type: 'string', description: 'Confirmed against dist/component-library-storybook/index.json'},
          state: {type: 'string', description: 'Visual state the story shows, one line'},
        },
      },
    },
    baselines: {
      type: 'array',
      description: `One PNG per DSCO story x theme x direction under ${BASELINE_DIR}`,
      items: {
        type: 'object',
        required: ['storyId', 'theme', 'dir', 'png', 'width', 'height'],
        properties: {
          storyId: {type: 'string'},
          theme: {type: 'string', enum: ['Light', 'Dark']},
          dir: {type: 'string', enum: ['ltr', 'rtl']},
          png: {type: 'string', description: 'repo-root-relative path'},
          width: {type: 'number'},
          height: {type: 'number'},
        },
      },
    },
    captureRecipe: {
      type: 'string',
      description: 'Exactly how the baselines were captured (viewport, how theme and dir were set, what was clicked to open, what element was clipped, wait conditions) so the parity gate reproduces it byte for byte',
    },
    consumers: {
      type: 'array',
      description: `Every file outside ${COMPONENT_DIR} importing the component by package path or relative path, including inside ${LIB_SRC} and tests`,
      items: {
        type: 'object',
        required: ['file', 'kind', 'testFiles', 'imports', 'propsUsed'],
        properties: {
          file: {type: 'string'},
          kind: {type: 'string', enum: ['apps', 'frontend-package', 'frontend-app', 'component-library-internal', 'test']},
          testFiles: {type: 'array', items: {type: 'string'}},
          imports: {type: 'array', items: {type: 'string'}, description: 'Named imports, or "default"'},
          propsUsed: {type: 'array', items: {type: 'string'}, description: 'Props this consumer passes, so the plan can see which mappings matter'},
        },
      },
    },
    uiTestFiles: {
      type: 'array', items: {type: 'string'},
      description: 'Cucumber (dashboard/test/ui) and Playwright (frontend/packages/e2e-tests) files whose selectors depend on this component\'s DOM',
    },
    legacyGlobals: {
      type: 'array', items: {type: 'string'},
      description: 'Global side effects the legacy component owns and how: body scroll lock (which hook), document listeners, z-index constants, portal or in-place rendering',
    },
    legacyDefects: {
      type: 'array', items: {type: 'string'},
      description: 'Defects observed in the legacy rendering or code worth fixing in the MUI version: fixed widths that clip at high zoom, literal alt text, contrast, missing roles. Facts, not decisions.',
    },
    approachHint: {type: 'string', description: 'Recommendation with reasons; the Plan decides'},
    muiCandidates: {type: 'array', items: {type: 'string'}, description: "MUI components that could carry this, e.g. ['Dialog', 'DialogTitle']"},
    risks: {type: 'string'},
  },
}

const discover = await agent(
  `You DISCOVER the DSCO "${component}" component for its migration to MUI. Facts only: you
recommend, the Plan phase decides. You may write only under ${PARITY_DIR} (ignored) and
run Storybook builds; no repo file changes.

${MIGRATION_RULES}

${TREE_RULES}

─── STEP 0 — Preflight ────────────────────────────────────────────────────────
  Record blockers; do not fix them:
    - apps/node_modules, frontend/node_modules, apps/build exist.
    - git status --porcelain shows no tracked modifications (?? lines are fine; list them).
    - ${COMPONENT_DIR} exists.
    - ${publish ? 'gh auth status succeeds and origin is the code-dot-org remote.' : 'publish is off; skip the gh check.'}
  git fetch origin ${base}; record startRef, headOnBase (git merge-base --is-ancestor HEAD
  origin/${base}), branchOwner, and existingBranches (git branch --list '*/mui-${component}/*'
  and git ls-remote --heads origin '*/mui-${component}/*').

─── STEP 1 — The component ────────────────────────────────────────────────────
  Read every file under ${COMPONENT_DIR}. Record exports, whether the default export is
  the legacy component, and the propsSurface: one entry per prop AND per behavioral
  contract (what gets focus, Escape handling, scroll lock, hardcoded ids and roles,
  console.warn contracts). Read the SCSS: note fixed dimensions, literals, RTL handling.
  Record legacyGlobals (which hook or listener owns each) and legacyDefects you can see.
  Check ${STATUS_DOC} and ${OVERRIDES_DIR} for prior work; set alreadyMigrated.

─── STEP 2 — Consumers ────────────────────────────────────────────────────────
  grep BOTH import forms everywhere: '@code-dot-org/component-library/${component}' and
  relative paths into ${COMPONENT_DIR}. Search apps/src, apps/test, frontend/packages,
  frontend/apps, dashboard, AND ${LIB_SRC}; exclude only ${COMPONENT_DIR}. For each
  consumer record named imports (or "default"), the props it passes, and its unit tests
  (apps/test/unit mirror or __tests__ sibling). For uiTestFiles grep
  dashboard/test/ui/features and frontend/packages/e2e-tests/tests for the component's
  class names, data-testids and distinctive DOM.

─── STEP 3 — Baseline screenshots ─────────────────────────────────────────────
  yarn build in ${STORYBOOK}; confirm every story id in dist/component-library-storybook/
  index.json. Serve dist statically on http://localhost:<port>. With Playwright from
  frontend/node_modules (chromium, channel 'chrome' if the bundled browser is absent),
  viewport 1280x900, for each DSCO story x theme (Light, Dark) x dir (ltr, rtl): open
  iframe.html?id=<storyId>&viewMode=story, set document.documentElement.dataset.theme and
  .dir before mount (addInitScript; read ${STORYBOOK}/.storybook/preview.js first in case
  a theme global exists), wait for document.fonts.ready and a settled DOM, perform the
  story's open interaction if the component starts closed (a launcher button), and
  screenshot the rendered component clipped to its bounding box. Write
  ${BASELINE_DIR}/<exportName>-<theme>-<dir>.png. Write the exact procedure into
  captureRecipe: the parity gate must reproduce it for the MUI twins.

─── STEP 4 — Recommend ────────────────────────────────────────────────────────
  approachHint with reasons, muiCandidates, risks (theming under Lab2 Dark, RTL, portal
  vs in-place, focus, UI-test selectors, shared globals).

Return the structured result.`,
  {schema: DISCOVER_SCHEMA, label: 'discover', phase: 'Discover', model: 'sonnet'},
)
if (!discover) throw new Error('discover agent was skipped; nothing to plan')
if (!discover.preflight.ok) throw new Error(`Preflight failed:\n- ${discover.preflight.problems.join('\n- ')}`)
if (discover.alreadyMigrated && !force) {
  log(`${component} is already In Progress or Migrated per ${STATUS_DOC}. Pass force: true to redo.`)
  return {component, status: 'already-migrated'}
}
if (!discover.headOnBase) {
  throw new Error(`HEAD (${discover.startRef}) is not an ancestor of origin/${base}. Check out ${base} (or pass base) before running.`)
}
if (discover.existingBranches.length && !(branchPrefixArg && !discover.existingBranches.some(b => b.includes(branchPrefixArg)))) {
  throw new Error(`Branches from an earlier run exist: ${discover.existingBranches.join(', ')}. Delete them (local and origin) or pass a different branchPrefix.`)
}
const expectedBaselines = discover.dscoStories.length * 4
if (discover.baselines.length < expectedBaselines) {
  throw new Error(`Discover captured ${discover.baselines.length} baseline(s) for ${discover.dscoStories.length} story(ies); ${expectedBaselines} expected`)
}
log(`Discover: ${discover.exports.length} export(s), ${discover.propsSurface.length} prop(s)/contract(s), ${discover.consumers.length} consumer(s), ${discover.dscoStories.length} story(ies) with ${discover.baselines.length} baseline(s), ${discover.uiTestFiles.length} UI-test file(s)`)

// ── Phase 2: Plan ────────────────────────────────────────────────────────────
// Every decision the later phases follow, written to a doc the design-system PR carries.
phase('Plan')

const PLAN_SCHEMA = {
  type: 'object',
  required: [
    'planDoc', 'approach', 'exportPolicy', 'muiComponents', 'propMap', 'codemod', 'twins',
    'parityNotes', 'legacyDefectsToFix', 'sharedGlobals', 'appsParitySample', 'chunkSize',
    'docsPlan', 'risks',
  ],
  properties: {
    planDoc: {type: 'string', description: `Must be ${PLAN_DOC}`},
    approach: {type: 'string', enum: ['overrides', 'wrapper', 'both']},
    approachRationale: {type: 'string'},
    exportPolicy: {
      type: 'object',
      required: ['newExports', 'legacyExports', 'rationale'],
      description: 'What index.ts exports after this migration and which names are legacy',
      properties: {
        newExports: {type: 'array', items: {type: 'string'}, description: 'Names the MUI version ships under (components, prop types, helpers)'},
        legacyExports: {
          type: 'array', items: {type: 'string'},
          description: 'Names that remain legacy DSCO code after this migration; include the literal "default" when the default export stays legacy. The Verify audit greps consumers for these.',
        },
        rationale: {type: 'string', description: 'Why these names (tooltip precedent: LegacyX alongside the MUI name; or MuiX beside the untouched legacy name with an alias swap later)'},
      },
    },
    muiComponents: {type: 'array', items: {type: 'string'}},
    propMap: {
      type: 'array',
      items: {
        type: 'object',
        required: ['dscoProp', 'muiEquivalent', 'kind', 'consumerChange'],
        properties: {
          dscoProp: {type: 'string'},
          muiEquivalent: {type: 'string', description: 'MUI prop, slot, sx path, or wrapper prop; "" if dropped'},
          kind: {
            type: 'string',
            enum: ['direct', 'rename', 'wrapper-logic', 'theme-default', 'drop'],
            description: 'How the MUI side implements it: direct/rename onto an MUI prop, wrapper-logic in wrapper code, theme-default in the override, drop',
          },
          consumerChange: {
            type: 'string',
            enum: ['none', 'rename', 'rewrite', 'drop'],
            description: 'What a consumer call site must change for this prop: none (same name and value; the wrapper absorbs any implementation difference), rename (mechanical prop or value rename), rewrite (per-call-site judgment), drop (the consumer loses it)',
          },
          notes: {type: 'string'},
        },
      },
    },
    codemod: {
      type: 'object',
      required: ['required', 'rationale', 'transforms', 'expectedResidue'],
      properties: {
        required: {type: 'boolean', description: 'MUST be true unless some propMap entry\'s consumerChange is rewrite (per-site judgment). none and rename are mechanical; drop means the transform skips the call sites passing that prop and lists them. The import and JSX name swap is always mechanical.'},
        rationale: {type: 'string'},
        script: {type: 'string', description: `Path under ${CODEMODS_DIR}, e.g. ${CODEMODS_DIR}/${component}-to-mui.ts, or ""`},
        yarnScript: {type: 'string', description: `Script name to add to ${LIB}/package.json, e.g. codemod:${component}, or ""`},
        transforms: {type: 'array', items: {type: 'string'}, description: 'Each rewrite the codemod performs, one line each (import specifier, JSX name, prop rename, prop value mapping)'},
        expectedResidue: {type: 'array', items: {type: 'string'}, description: 'What the codemod knowingly leaves for hand work: SCSS specificity against MUI classes, snapshot updates, dropped props, tests that find() the old component'},
      },
    },
    twins: {
      type: 'array',
      description: 'One MUI story per DSCO story, same state; the gate compares each pair',
      items: {
        type: 'object',
        required: ['dscoStoryId', 'muiTitle', 'muiExportName', 'muiStoryId'],
        properties: {
          dscoStoryId: {type: 'string'},
          muiTitle: {type: 'string', description: "e.g. 'DesignSystem/Dialog/MuiDialog'"},
          muiExportName: {type: 'string'},
          muiStoryId: {type: 'string', description: 'Predicted Storybook id; Execute confirms against index.json'},
        },
      },
    },
    parityNotes: {type: 'string', description: 'What is expected to differ within tolerance and why; what must be pixel-identical'},
    legacyDefectsToFix: {
      type: 'array',
      description: 'Legacy defects the MUI version fixes on purpose. Each is an intended deviation the gate accepts.',
      items: {
        type: 'object',
        required: ['defect', 'fix', 'affectsStories'],
        properties: {
          defect: {type: 'string'},
          fix: {type: 'string'},
          affectsStories: {type: 'array', items: {type: 'string'}, description: 'DSCO story ids whose render changes because of this fix, or []'},
        },
      },
    },
    sharedGlobals: {
      type: 'array',
      description: 'For each legacy global side effect: which manager the MUI version must share',
      items: {
        type: 'object',
        required: ['global', 'rule'],
        properties: {global: {type: 'string'}, rule: {type: 'string'}},
      },
    },
    appsParitySample: {
      type: 'array',
      description: 'Up to 4 consumer pages for a before/after capture against a local studio, chosen for coverage of distinct props or surfaces. [] if none is worth it.',
      items: {
        type: 'object',
        required: ['consumer', 'path', 'recipe'],
        properties: {
          consumer: {type: 'string', description: 'Consumer file'},
          path: {type: 'string', description: 'URL path on the local studio, e.g. /teacher_dashboard/sections/12/manage_students'},
          recipe: {type: 'string', description: 'Sign-in (which seeded local account) and the clicks that open the component; describe by role/name, no selectors'},
        },
      },
    },
    chunkSize: {type: 'number', description: 'Consumer files per PR for this component (25 is the default; smaller for consumers with heavy residue)'},
    docsPlan: {type: 'array', items: {type: 'string'}, description: 'Each doc change with its phase: deprecation JSDoc, README, status row In Progress (Execute); status Migrated, skill list, eslint rule (Migrate, only when fully migrated)'},
    risks: {type: 'string'},
  },
}

const plan = await agent(
  `You PLAN the migration of the DSCO "${component}" component to MUI. You decide; the
Execute and Migrate phases follow your decisions and record any deviation. Your one
repo edit is the plan document at ${PLAN_DOC}.

${MIGRATION_RULES}

${TREE_RULES}

DISCOVERY
  exports:            ${JSON.stringify(discover.exports)} (default export is legacy: ${discover.defaultExportIsLegacy})
  propsSurface:       ${JSON.stringify(discover.propsSurface)}
  consumers:          ${discover.consumers.length}, props used per consumer in the list below
  consumer list:      ${JSON.stringify(discover.consumers.map(c => ({file: c.file, kind: c.kind, imports: c.imports, propsUsed: c.propsUsed})))}
  dscoStories:        ${JSON.stringify(discover.dscoStories)}
  uiTestFiles:        ${JSON.stringify(discover.uiTestFiles)}
  legacyGlobals:      ${JSON.stringify(discover.legacyGlobals)}
  legacyDefects:      ${JSON.stringify(discover.legacyDefects)}
  approachHint:       ${discover.approachHint}
  muiCandidates:      ${JSON.stringify(discover.muiCandidates)}
  risks:              ${discover.risks}
  parity tolerance:   ${parityTolerance} (mismatch ratio; pixel-identical is the goal, this is the allowance)

Decide, in this order, reading the precedents and MUI's own component docs as needed:
1. Approach and export policy. Prefer MUI out of the box over bespoke code: overrides
   only when the props all map; a wrapper only for composition MUI lacks. Name what the
   MUI version exports and what stays legacy (the tooltip precedent renames legacy to
   LegacyX and gives the MUI version the plain name when consumers can move in the same
   stack; otherwise MuiX beside the untouched legacy name with an alias swap later). Say
   which and why.
2. Prop map, one entry per propsSurface item. Set kind for how the MUI side implements
   it and, separately, consumerChange for what a call site must edit: a prop the wrapper
   absorbs with the same name and value is consumerChange none even when kind is
   wrapper-logic.
3. Codemod. If no entry's consumerChange is rewrite, required is true, no exceptions:
   the dialog run hand-edited 38 pure renames because an early heuristic looked at how
   the wrapper worked instead of what call sites changed, and a transform is re-runnable
   when staging grows new consumers while the PRs sit open. A dropped prop does not
   cancel it: the transform leaves a file that passes the dropped prop untouched and
   lists it for hand work. Specify each transform (import specifier, JSX name, prop
   renames, the skip rule) and the residue it leaves.
4. Twins: one MUI story per DSCO story with the same state.
5. Legacy defects to fix while here (from legacyDefects; e.g. a fixed min-width that
   clips at high zoom, literal alt text, missing roles) and which story renders they
   change. Shared globals: for each legacyGlobals entry, the manager the MUI version must
   share (e.g. the legacy useBodyScrollLock hook with MUI's own lock disabled).
6. Apps parity sample: up to 4 consumer pages, distinct surfaces, each with a path on the
   local studio and a recipe (seeded account, clicks by role/name). [] if not worth it.
7. Chunk size for the consumer PRs, and the docs plan.

Then write ${PLAN_DOC} with these sections, in this order, terse and exact (read
${LIB_SRC}/button/BUTTON_MIGRATION_TO_MUI.md for the register): Summary; Approach and
exports; Prop map (table); Codemod (transforms, residue, how to run); Parity (tolerance,
twins, intended deviations); Legacy defects fixed while here; Shared globals; Consumer
chunks; Docs; Risks; Deviations (empty, Execute fills it). Run prettier on it from ${LIB}
(../../node_modules/.bin/prettier --write).

Return the structured plan; planDoc must be ${PLAN_DOC}.`,
  {schema: PLAN_SCHEMA, label: 'plan', phase: 'Plan'},
)
if (!plan) throw new Error('plan agent was skipped; nothing to execute')
if (plan.planDoc !== PLAN_DOC) throw new Error(`plan wrote ${plan.planDoc}; expected ${PLAN_DOC}`)

// The one rule the planner may not reason its way around. It keys on what a call site
// must change, not on how the wrapper implements a prop: dialog's map was full of
// wrapper-logic entries while every consumer changed nothing but the import name.
// A dropped prop does not cancel the codemod either: the transform skips the few call
// sites that pass it and rewrites everyone else (dialog: 2 of 49).
const allMechanical = plan.propMap.every(p => p.consumerChange !== 'rewrite')
if (allMechanical && !plan.codemod.required) {
  throw new Error('plan.codemod.required is false although no consumer call site needs per-site judgment; a codemod is mandatory in that case')
}
const twinGaps = twins => {
  const twinned = twins.map(t => t.dscoStoryId)
  const known = new Set(discover.dscoStories.map(s => s.storyId))
  return {
    missing: discover.dscoStories.filter(s => !twinned.includes(s.storyId)).map(s => s.storyId),
    unknown: twinned.filter(id => !known.has(id)),
    duplicate: twinned.filter((id, i) => twinned.indexOf(id) !== i),
  }
}
const planGaps = twinGaps(plan.twins)
if (planGaps.missing.length || planGaps.unknown.length || planGaps.duplicate.length) {
  throw new Error(`plan.twins does not cover the DSCO stories exactly once: ${JSON.stringify(planGaps)}`)
}
const chunkSize = chunkSizeArg || positiveInt(plan.chunkSize, 25, 'plan.chunkSize')
const dropped = plan.propMap.filter(p => p.kind === 'drop')
log(`Plan: ${plan.approach} via ${plan.muiComponents.join(', ')} · codemod ${plan.codemod.required ? 'required' : 'not required'} · ${plan.twins.length} twin(s) · ${plan.legacyDefectsToFix.length} legacy defect(s) to fix · ${plan.appsParitySample.length} apps page(s) sampled · chunks of ${chunkSize}`)
if (dropped.length) log(`${dropped.length} DSCO prop(s) dropped: ${dropped.map(p => p.dscoProp).join(', ')}`)

if (stopAfterPlan) {
  log(`stopAfterPlan: ${PLAN_DOC} is written and uncommitted. Review it, then rerun with resumeFromRunId to continue.`)
  return {component, status: 'planned', planDoc: PLAN_DOC, approach: plan.approach, codemodRequired: plan.codemod.required}
}

// Chunks are keyed by the consumer's home directory so one PR reads as one area.
const INTERNAL_GROUP = '0-component-library-internal'
const DS_CORE_GROUP = 'ds-core'
const groupOf = file => {
  if (file.startsWith(COMPONENT_DIR) || file.startsWith(OVERRIDES_DIR) || file === AUGMENTATION || file.startsWith(CODEMODS_DIR)) return DS_CORE_GROUP
  if (file.startsWith(LIB_SRC)) return INTERNAL_GROUP
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
    // Inside-out consumers are their own PR even when small: a later source deletion
    // depends on that PR, so it must not share a review with apps code.
    if (items.length > size || g === INTERNAL_GROUP) {
      flush()
      const parts = Math.ceil(items.length / size)
      for (let i = 0; i < parts; i++) {
        const slug = parts > 1 ? `${slugOf(g)}-${i + 1}` : slugOf(g)
        chunks.push({slug, groups: [g], consumers: items.slice(i * size, (i + 1) * size)})
      }
      continue
    }
    if (cur && cur.consumers.length + items.length > size) flush()
    if (!cur) cur = {slug: '', groups: [], consumers: []}
    cur.groups.push(g)
    cur.consumers.push(...items)
  }
  flush()
  // Chunk agents edit concurrently, so a test shared by two consumers belongs to exactly
  // one chunk: the first that claims it.
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
const chunks = chunkConsumers(discover.consumers, chunkSize)
log(`${discover.consumers.length} consumer(s) in ${chunks.length} chunk(s)`)

// ── Phase 3: Execute ─────────────────────────────────────────────────────────
// One agent writes the design-system side per the plan. A separate gate agent judges
// parity against the Discover baselines. The design-system PR opens as soon as it passes.
phase('Execute')

const EXECUTE_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'muiStories', 'codemodCommand', 'deviations', 'checks', 'allChecksPass', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}},
    muiStories: {
      type: 'array',
      items: {
        type: 'object',
        required: ['storyId', 'pairsWithDscoStoryId', 'exportName', 'file'],
        properties: {
          storyId: {type: 'string', description: 'Confirmed against dist/component-library-storybook/index.json'},
          pairsWithDscoStoryId: {type: 'string'},
          exportName: {type: 'string'},
          file: {type: 'string'},
        },
      },
    },
    codemodCommand: {type: 'string', description: `The yarn script consumers run from ${LIB} with a path argument, or "" when the plan required no codemod`},
    deviations: {type: 'array', items: {type: 'string'}, description: 'Every place the code departs from the plan doc, also written into its Deviations section'},
    checks: {
      type: 'object',
      required: ['vitest', 'typecheck', 'lint', 'build', 'storybookBuild', 'codemodDryRun'],
      properties: {
        vitest: {type: 'string', description: 'pass, or the failing test names'},
        typecheck: {type: 'string'},
        lint: {type: 'string'},
        build: {type: 'string'},
        storybookBuild: {type: 'string'},
        codemodDryRun: {type: 'string', description: 'Result of --dry --print on three consumers, or "n/a"'},
      },
    },
    allChecksPass: {type: 'boolean'},
    notes: {type: 'string'},
  },
}

const executeBrief = `THE PLAN (authoritative; read ${PLAN_DOC} in full first)
  approach:            ${plan.approach} (${plan.approachRationale || ''})
  exports:             new ${JSON.stringify(plan.exportPolicy.newExports)}; legacy ${JSON.stringify(plan.exportPolicy.legacyExports)}
  muiComponents:       ${plan.muiComponents.join(', ')}
  propMap:             ${JSON.stringify(plan.propMap)}
  codemod:             ${JSON.stringify(plan.codemod)}
  twins:               ${JSON.stringify(plan.twins)}
  legacyDefectsToFix:  ${JSON.stringify(plan.legacyDefectsToFix)}
  sharedGlobals:       ${JSON.stringify(plan.sharedGlobals)}
  docsPlan:            ${JSON.stringify(plan.docsPlan)}
  componentFiles:      ${JSON.stringify(discover.componentFiles)}
  dscoStories:         ${JSON.stringify(discover.dscoStories)}`

let exec = await agent(
  `You EXECUTE the design-system side of the MUI "${component}" migration, following the
plan. Nothing outside ${LIB}, ${STORYBOOK} and (only if an augmentation needs a mirror)
apps/src is yours. Consumers are NOT yours; the Migrate phase moves them.

${MIGRATION_RULES}

${TREE_RULES}

${executeBrief}

Do, in order:
1. Read ${PLAN_DOC}, the precedents, every componentFile, ${LIB}/README.md and
   ${LIB}/CONTRIBUTING.md.
2. Implement the approach exactly as planned: overrides in ${OVERRIDES_DIR}/${component}.ts(x)
   registered in index.ts, and/or the wrapper in ${COMPONENT_DIR}; exports per the export
   policy; augmentations in ${AUGMENTATION}. Match the DSCO rendering in Light and Dark
   ([data-theme]) and RTL, except for the planned legacy defect fixes. Honor every
   sharedGlobals rule. Panel and layout selectors that must beat MUI's emotion classes
   carry two classes (apps injects emotion after CSS modules); if two of your own sheets
   set the same property on the same element, the winner carries three classes so load
   order cannot decide it. Set box-sizing explicitly where a width rule assumes it:
   Storybook and studio lack Bootstrap's global border-box reset.
3. Stories: one MUI story per twin, same visual state, same launcher pattern as the DSCO
   story. Keep the DSCO stories untouched. Confirm every muiStoryId in
   dist/component-library-storybook/index.json after building Storybook.
4. Tests: vitest coverage for every propMap entry and every sharedGlobals rule (for a
   shared scroll lock: open a legacy and an MUI instance, close them out of order, assert
   the body state), plus the legacy defect fixes; keep the legacy tests running.
5. Codemod, if the plan requires it: ${CODEMODS_DIR}/${component}-to-mui.ts modeled on
   button-to-mui-button.ts implementing exactly the planned transforms; a yarn script in
   ${LIB}/package.json; an entry in ${CODEMODS_DIR}/README.md. Dry-run it with
   jscodeshift --dry --print on three consumers from this list and check the output:
   ${JSON.stringify(discover.consumers.filter(c => c.kind === 'apps').slice(0, 6).map(c => c.file))}
   --dry only: reverting a real run would need git checkout, which is forbidden here.
6. Docs planned for this phase: @deprecated JSDoc on the legacy component naming the
   replacement; ${COMPONENT_DIR}/README.md documenting the MUI version first and the legacy
   path as deprecated, with the prop map; the component's row in ${STATUS_DOC} set to In
   Progress with the override file; the STYLE_OVERRIDES block there if you registered an
   override. Write every departure from the plan into the Deviations section of ${PLAN_DOC}.
7. Checks, from ${LIB} unless noted: yarn test; yarn typecheck; ../../node_modules/.bin/eslint .;
   ../../node_modules/.bin/prettier --check on touched files; yarn stylelint; yarn build.
   Then yarn build in ${STORYBOOK}. Fix what you broke; report each check's result.

Return the structured result.`,
  {schema: EXECUTE_SCHEMA, label: 'execute', phase: 'Execute'},
)
if (!exec) throw new Error('execute agent was skipped; nothing to gate')

const repairPrompt = (why, detail) => `The EXECUTE step of the MUI "${component}" ${why}. Repair it without changing what the
plan decided or what the stories render.

${MIGRATION_RULES}

${TREE_RULES}

${detail}
Files touched so far: ${JSON.stringify(exec.filesTouched)}
Plan doc: ${PLAN_DOC}

Re-run every check (yarn test / typecheck / eslint / prettier --check / stylelint / build
in ${LIB}; yarn build in ${STORYBOOK}) and report. filesTouched = the list above plus your
changes. Copy muiStories, codemodCommand and deviations from the previous result unless
you changed them: ${JSON.stringify({muiStories: exec.muiStories, codemodCommand: exec.codemodCommand, deviations: exec.deviations})}`

const execGaps = () => {
  const twinned = exec.muiStories.map(m => m.pairsWithDscoStoryId)
  const known = new Set(discover.dscoStories.map(s => s.storyId))
  return {
    missing: discover.dscoStories.filter(s => !twinned.includes(s.storyId)).map(s => s.storyId),
    unknown: twinned.filter(id => !known.has(id)),
    duplicate: twinned.filter((id, i) => twinned.indexOf(id) !== i),
  }
}
const hasGaps = g => g.missing.length || g.unknown.length || g.duplicate.length
if (!exec.allChecksPass || hasGaps(execGaps())) {
  const gaps = execGaps()
  log(`Execute left ${!exec.allChecksPass ? 'failing checks' : ''}${!exec.allChecksPass && hasGaps(gaps) ? ' and ' : ''}${hasGaps(gaps) ? 'twin gaps' : ''}; one repair pass`)
  const repaired = await agent(
    repairPrompt(
      'left work incomplete',
      `Failing checks: ${JSON.stringify(exec.checks)}\nTwin gaps (every DSCO story id exactly once): ${JSON.stringify(gaps)}\nPlanned twins: ${JSON.stringify(plan.twins)}`,
    ),
    {schema: EXECUTE_SCHEMA, label: 'execute-repair', phase: 'Execute'},
  )
  if (repaired) exec = repaired
  if (!exec.allChecksPass) throw new Error(`Execute checks still failing: ${JSON.stringify(exec.checks)}`)
  if (hasGaps(execGaps())) throw new Error(`MUI story twins still incomplete: ${JSON.stringify(execGaps())}`)
}
if (plan.codemod.required && !exec.codemodCommand) throw new Error('the plan requires a codemod and Execute reported none')
log(`Execute: ${exec.filesTouched.length} file(s), ${exec.muiStories.length} twin(s)${exec.codemodCommand ? `, codemod ${exec.codemodCommand}` : ''}${exec.deviations.length ? `, ${exec.deviations.length} deviation(s) from the plan` : ''}`)

// ── Parity gate ──────────────────────────────────────────────────────────────
// A separate agent renders the MUI twins with the Discover recipe and diffs them against
// the baselines. It never edits component code; a fix agent in the Execute role does.
const PARITY_SCHEMA = {
  type: 'object',
  required: ['pairs', 'pass', 'summary'],
  properties: {
    pairs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['dscoStoryId', 'muiStoryId', 'theme', 'dir', 'baselinePng', 'muiPng', 'diffPng', 'mismatchRatio', 'verdict', 'notes'],
        properties: {
          dscoStoryId: {type: 'string'},
          muiStoryId: {type: 'string'},
          theme: {type: 'string', enum: ['Light', 'Dark']},
          dir: {type: 'string', enum: ['ltr', 'rtl']},
          baselinePng: {type: 'string'},
          muiPng: {type: 'string'},
          diffPng: {type: 'string'},
          mismatchRatio: {type: 'number', description: 'pixelmatch mismatched pixels / total, 0..1; 1 when sizes differ'},
          verdict: {
            type: 'string',
            enum: ['match', 'acceptable', 'intended', 'mismatch'],
            description: `match: ratio 0; acceptable: within tolerance ${parityTolerance} and nothing structural differs; intended: the difference is a planned legacy defect fix for this story; mismatch: anything else`,
          },
          notes: {type: 'string', description: 'What differs, in words a fix agent can act on'},
        },
      },
    },
    pass: {type: 'boolean'},
    summary: {type: 'string'},
  },
}

const storyPairs = exec.muiStories.map(m => ({
  mui: m.storyId,
  dsco: m.pairsWithDscoStoryId,
  exportName: m.exportName,
  intended: plan.legacyDefectsToFix.filter(d => d.affectsStories.includes(m.pairsWithDscoStoryId)).map(d => d.fix),
}))
const expectedRenders = storyPairs.flatMap(p =>
  ['Light', 'Dark'].flatMap(theme => ['ltr', 'rtl'].map(dir => ({dsco: p.dsco, mui: p.mui, theme, dir}))),
)
const missingRenders = pairs =>
  expectedRenders.filter(
    e => !pairs.some(p => p.dscoStoryId === e.dsco && p.muiStoryId === e.mui && p.theme === e.theme && p.dir === e.dir),
  )

const parityPrompt = attempt => `You are the PARITY GATE for the MUI "${component}" (attempt ${attempt}/${maxParityAttempts}).
Render each MUI twin the way Discover rendered its DSCO baseline and decide whether they
match. Do not edit component code; a fix agent does that from your notes.

${TREE_RULES}

BASELINES (already on disk): ${JSON.stringify(discover.baselines)}
CAPTURE RECIPE (reproduce it exactly for the MUI twins): ${discover.captureRecipe}
STORY PAIRS (dsco -> mui, with the planned intended deviations per story):
${JSON.stringify(storyPairs)}
TOLERANCE: mismatchRatio <= ${parityTolerance} is acceptable when nothing structural differs.
PLAN PARITY NOTES: ${plan.parityNotes}

1. yarn build in ${STORYBOOK} if dist is older than the sources; confirm every muiStoryId
   in dist/component-library-storybook/index.json; serve dist on http://localhost:<port>.
2. For each pair x theme x dir, capture the MUI twin with the recipe (same viewport, same
   theme/dir mechanism, same open interaction, same clip) to ${PARITY_DIR}/mui/
   <exportName>-<theme>-<dir>.png.
3. Diff against the baseline with pixelmatch from apps/node_modules (pngjs is there too):
   write ${PARITY_DIR}/diff/<exportName>-<theme>-<dir>.png and record the ratio. A size
   difference is ratio 1.
4. LOOK at every pair whose ratio exceeds 0.001 or whose sizes differ: open baseline, mui
   and diff PNGs with the Read tool. Grade: match (0), acceptable (within tolerance, no
   structural difference), intended (the difference is exactly a planned legacy defect fix
   listed for that story), mismatch (anything else, including a within-tolerance ratio
   that hides a missing element or a moved control).

Return the structured verdict; pass is true only when no pair is a mismatch.`

let parity = null
let parityAttempt = 0
let missingNote = ''
while (parityAttempt < maxParityAttempts) {
  parityAttempt++
  parity = await agent(parityPrompt(parityAttempt) + missingNote, {schema: PARITY_SCHEMA, label: `parity-${parityAttempt}`, phase: 'Execute'})
  if (!parity) throw new Error('parity agent was skipped')
  const missing = missingRenders(parity.pairs)
  const bad = parity.pairs.filter(p => p.verdict === 'mismatch')
  parity.pass = parity.pass && bad.length === 0 && missing.length === 0
  log(`Parity ${parityAttempt}: ${parity.pairs.length} render(s), ${bad.length} mismatch(es), ${parity.pairs.filter(p => p.verdict === 'intended').length} intended, ${missing.length} missing`)
  if (parity.pass) break
  if (parityAttempt >= maxParityAttempts) break
  if (missing.length && !bad.length) {
    missingNote = `\n\nYOUR PREVIOUS ATTEMPT DID NOT RENDER THESE: ${JSON.stringify(missing)}. Render every listed combination; if a story id does not resolve, say so in that pair's notes and grade it mismatch.`
    continue
  }
  missingNote = missing.length ? `\n\nALSO MISSING LAST TIME (render them): ${JSON.stringify(missing)}` : ''
  const fix = await agent(
    `The PARITY GATE rejected the MUI "${component}". Fix the design-system side so the MUI
twins render like their baselines, within the plan. Same role and rules as Execute.

${MIGRATION_RULES}

${TREE_RULES}

MISMATCHES: ${JSON.stringify(bad)}
PLAN (intended deviations are NOT to be reverted): ${JSON.stringify(plan.legacyDefectsToFix)}
Look at each listed baseline/mui/diff PNG with the Read tool before changing anything. Fix
the override or wrapper, not the story, unless the story fails to reproduce the DSCO
story's state. Record any new departure from the plan in ${PLAN_DOC}'s Deviations section.
Re-run yarn test / typecheck / eslint / prettier --check / stylelint / build in ${LIB} and
yarn build in ${STORYBOOK}. Report every file touched and the checks.`,
    {schema: EXECUTE_SCHEMA, label: `parity-fix-${parityAttempt}`, phase: 'Execute'},
  )
  if (fix) {
    exec.filesTouched = [...new Set([...exec.filesTouched, ...fix.filesTouched])]
    exec.notes += `\nParity fix ${parityAttempt}: ${fix.notes}`
    exec.checks = fix.checks
    exec.allChecksPass = fix.allChecksPass
    exec.deviations = [...new Set([...exec.deviations, ...fix.deviations])]
    if (fix.muiStories.length) exec.muiStories = fix.muiStories
  }
}
const parityStatus = parity.pass ? 'pass' : missingRenders(parity.pairs).length ? 'incomplete' : 'mismatches-remain'
if (!parity.pass) log(`Parity budget exhausted (${parityStatus}); details go into the PR body for human review`)
if (!exec.allChecksPass) {
  log(`Design-system checks red after parity fixes; one repair pass`)
  const repaired = await agent(repairPrompt('left failing checks after parity fixes', `Failing checks: ${JSON.stringify(exec.checks)}`), {
    schema: EXECUTE_SCHEMA, label: 'execute-checks-repair', phase: 'Execute',
  })
  if (repaired) exec = repaired
  if (!exec.allChecksPass) throw new Error(`Design-system checks still failing: ${JSON.stringify(exec.checks)}`)
}

// Showcase for the PR body: Light+LTR first, one per story, then Dark, capped at six.
const showcase = []
for (const pref of [{theme: 'Light', dir: 'ltr'}, {theme: 'Dark', dir: 'ltr'}]) {
  for (const p of parity.pairs) {
    if (showcase.length >= 6) break
    const dup = showcase.some(s => s.dscoStoryId === p.dscoStoryId && s.theme === p.theme)
    if (p.theme === pref.theme && p.dir === pref.dir && !dup) showcase.push(p)
  }
}

// ── Design-system commit and PR, before the sweep ────────────────────────────
const owner = /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(discover.branchOwner || '') ? discover.branchOwner : 'mui'
const branchPrefix = branchPrefixArg || `${owner}/mui-${component}`
const DS_BRANCH = `${branchPrefix}/1-design-system`
const mismatches = parity.pairs.filter(p => p.verdict === 'mismatch')
const intendedPairs = parity.pairs.filter(p => p.verdict === 'intended')

const DS_PUBLISH_SCHEMA = {
  type: 'object',
  required: ['branch', 'sha', 'prUrl', 'screenshotsSha', 'leftovers'],
  properties: {
    branch: {type: 'string'},
    sha: {type: 'string'},
    prUrl: {type: 'string', description: '"" when publish is off'},
    screenshotsSha: {type: 'string', description: 'Commit on the screenshots branch, or ""'},
    leftovers: {type: 'array', items: {type: 'string'}, description: 'Changed paths not committed, excluding preexisting untracked ones'},
  },
}

const dsPublished = await agent(
  `Commit the design-system side of the MUI "${component}" migration${publish ? ' and open its draft PR' : ''}.
This step owns git. Run from the repo root. Stop at the first git error rather than
improvising around it.

NEVER stage: ${JSON.stringify(discover.preexistingUntracked)}, anything under ${STORYBOOK}/dist,
or any *.png outside the screenshots-branch step.

1. git checkout -b ${DS_BRANCH}
2. Stage exactly: every existing path in ${JSON.stringify(exec.filesTouched)}, plus
   ${PLAN_DOC}, plus any other changed path under ${LIB} or ${STORYBOOK} (only design-system
   work exists in the tree at this point).
3. Commit (heredoc keeps newlines):
     [Design System] Add MUI ${componentTitle}

     ${plan.approach === 'overrides' ? 'Theme style overrides' : plan.approach === 'wrapper' ? 'MUI-native wrapper' : 'Theme overrides plus an MUI-native wrapper'} for ${plan.muiComponents.join(', ')} per ${PLAN_DOC}: twinned stories, tests, README${exec.codemodCommand ? ', codemod' : ''}.
     Legacy DSCO ${componentTitle} is deprecated; consumers move in the stacked PRs.

     ${COMMIT_TRAILER}
   The pre-commit hook lints staged files; fix lint errors in the staged files, re-stage,
   commit again. Do not bypass the hook.
${publish ? `
4. Screenshots branch. The PNGs live only in THIS tree (ignored dist/), so resolve them
   before leaving it:
     ROOT=$(git rev-parse --show-toplevel)
     git worktree add --detach ../.mui-shots-${component} HEAD
     cd there; git checkout --orphan ${branchPrefix}/screenshots; git rm -rfq .
     cp "$ROOT/<each path>" . (flat, keeping basenames): ${JSON.stringify(showcase.flatMap(p => [p.baselinePng, p.muiPng]))}
     git add . ; commit "MUI ${componentTitle} parity screenshots (not for merge)"; git push -u origin ${branchPrefix}/screenshots
     SHA=$(git rev-parse HEAD); cd back; git worktree remove --force ../.mui-shots-${component}
   Image URL form: https://raw.githubusercontent.com/code-dot-org/code-dot-org/<SHA>/<basename>
5. git push -u origin ${DS_BRANCH}; then gh pr create --draft --base ${base} --head ${DS_BRANCH}
   --title "[Design System] Add MUI ${componentTitle}" --body-file <file>. Body follows
   .github/pull_request_template.md (read it): Summary, Links, Testing story; delete
   Deployment notes and Privacy; end with "${PR_FOOTER}". Summary includes: the approach
   and export policy in two sentences and a link to ${PLAN_DOC} for the rest; the dropped
   props ${JSON.stringify(dropped.map(p => p.dscoProp))}; the legacy defects fixed on purpose
   ${JSON.stringify(plan.legacyDefectsToFix.map(d => d.defect))}; a Parity section with a table
   Story | Theme | DSCO | MUI (one row per showcase pair, images by the URL form, ratio per
   row), ${mismatches.length ? `an "Open mismatches" list ${JSON.stringify(mismatches.map(m => ({story: m.muiStoryId, theme: m.theme, dir: m.dir, notes: m.notes})))}` : 'a line that every render passed the gate'}${intendedPairs.length ? `, and an "Intended deviations" list ${JSON.stringify(intendedPairs.map(m => ({story: m.muiStoryId, theme: m.theme, notes: m.notes})))}` : ''};
   deviations from the plan ${JSON.stringify(exec.deviations)}; a "Stack" section saying the
   consumer PRs follow and will be linked here. ${jira ? `Links: Jira ${jira}.` : 'Links: no Jira given; leave the bullet.'}` : `
4. publish is off: no push, no gh. prUrl and screenshotsSha are "".`}

Report branch, sha, prUrl, screenshotsSha, and leftovers (git status --porcelain paths other
than the never-stage list).`,
  {schema: DS_PUBLISH_SCHEMA, label: 'commit-design-system', phase: 'Execute'},
)
if (!dsPublished) throw new Error('design-system commit agent was skipped')
if (dsPublished.leftovers.length) log(`WARNING: uncommitted after the design-system commit: ${dsPublished.leftovers.join(', ')}`)
log(`Design system on ${DS_BRANCH} @ ${dsPublished.sha.slice(0, 10)}${dsPublished.prUrl ? ` · ${dsPublished.prUrl}` : ''}`)

// ── Phase 4: Migrate ─────────────────────────────────────────────────────────
// Codemod first over every consumer, then chunk agents on the residue, then the Verify
// gate, then the sampled apps parity, then the carve into stacked PRs.
phase('Migrate')

const TOUCHED_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'notes'],
  properties: {filesTouched: {type: 'array', items: {type: 'string'}}, notes: {type: 'string'}},
}

// Apps-level baseline first: it must see the consumers before the codemod touches them.
const APPS_CAPTURE_SCHEMA = {
  type: 'object',
  required: ['available', 'host', 'captures', 'notes'],
  properties: {
    available: {type: 'boolean', description: 'false when no local studio answered or sign-in failed'},
    host: {type: 'string', description: 'http://localhost:9000 or http://localhost:3000, or ""'},
    captures: {
      type: 'array',
      items: {
        type: 'object',
        required: ['consumer', 'png', 'ok', 'notes'],
        properties: {consumer: {type: 'string'}, png: {type: 'string'}, ok: {type: 'boolean'}, notes: {type: 'string'}},
      },
    },
    notes: {type: 'string'},
  },
}
const appsCapturePrompt = (stage, dir) => `Capture the ${stage} state of ${plan.appsParitySample.length} consumer page(s) for the MUI "${component}"
migration, against a LOCAL studio. Read-only for the repo; write PNGs under ${dir}/.

SAMPLE: ${JSON.stringify(plan.appsParitySample)}

1. Probe http://localhost:9000 then http://localhost:3000 (curl -sI). If neither answers,
   return available=false with a note; do not start servers.${stage === 'after' ? `
   The tree now carries the migrated consumers. :9000 (webpack dev server) picks them up on
   its own; :3000 serves apps/build, so run yarn build in apps/ first (minutes) and say so.` : ''}
2. With Playwright from frontend/node_modules (chromium, channel 'chrome' if needed),
   viewport 1280x900, follow each recipe: sign in with the named local account, navigate to
   the path, perform the clicks by role/name, wait for the component to be open and fonts
   ready, screenshot the open component clipped to its bounding box (fall back to the
   viewport if it cannot be isolated) to ${dir}/<consumer basename>.png. Record ok=false
   with the reason when a recipe fails; keep going.

Return the structured result.`

const runAppsParity = appsParity && plan.appsParitySample.length > 0
const appsBefore = runAppsParity
  ? await agent(appsCapturePrompt('before', `${PARITY_DIR}/apps-before`), {schema: APPS_CAPTURE_SCHEMA, label: 'apps-baseline', phase: 'Migrate'})
  : null
if (runAppsParity) {
  if (!appsBefore || !appsBefore.available) log('Apps parity: no local studio reachable; the sampled page check is skipped')
  else log(`Apps parity: ${appsBefore.captures.filter(c => c.ok).length}/${appsBefore.captures.length} baseline page(s) captured on ${appsBefore.host}`)
}

// The codemod run is mechanical: run it, report, touch nothing by hand.
const CODEMOD_RUN_SCHEMA = {
  type: 'object',
  required: ['filesChanged', 'filesUnchanged', 'errors', 'notes'],
  properties: {
    filesChanged: {type: 'array', items: {type: 'string'}},
    filesUnchanged: {type: 'array', items: {type: 'string'}, description: 'Consumer files the codemod left as they were'},
    errors: {type: 'array', items: {type: 'string'}},
    notes: {type: 'string'},
  },
}
const consumerSourceFiles = discover.consumers.filter(c => c.kind !== 'test').map(c => c.file)
let codemodRun = null
if (exec.codemodCommand) {
  codemodRun = await agent(
    `Run the ${componentTitle} codemod over every consumer of the DSCO "${component}". Mechanical
step: run it, report what changed, edit nothing by hand.

${TREE_RULES}

From ${LIB}, run \`${exec.codemodCommand} <path>\` (see ${CODEMODS_DIR}/README.md for path
conventions; paths are relative to that directory or absolute) over exactly these files,
in batches if the tool accepts several paths:
${JSON.stringify(consumerSourceFiles)}
Then git status --porcelain and git diff --stat to report which of them changed. A consumer
the codemod did not touch goes in filesUnchanged with its import form; the chunk agents
handle it by hand. Do not run tests, typecheck, or prettier.

Return the structured result.`,
    {schema: CODEMOD_RUN_SCHEMA, label: 'codemod-run', phase: 'Migrate', model: 'sonnet'},
  )
  if (!codemodRun) throw new Error('codemod run agent was skipped')
  log(`Codemod: ${codemodRun.filesChanged.length} file(s) rewritten, ${codemodRun.filesUnchanged.length} untouched${codemodRun.errors.length ? `, ${codemodRun.errors.length} error(s)` : ''}`)
}

const CHUNK_SCHEMA = {
  type: 'object',
  required: ['filesTouched', 'filesSkipped', 'tests', 'notes'],
  properties: {
    filesTouched: {type: 'array', items: {type: 'string'}, description: 'Files you edited by hand (codemod rewrites are already in the tree; list them too when you changed them further)'},
    filesSkipped: {
      type: 'array',
      description: 'Assigned consumers left on the legacy component, each with the reason',
      items: {type: 'object', required: ['file', 'reason'], properties: {file: {type: 'string'}, reason: {type: 'string'}}},
    },
    tests: {type: 'string', description: 'Exact test commands run and pass/fail per file'},
    notes: {type: 'string', description: 'Behavior changes a reviewer must know about'},
  },
}

const chunkResults = chunks.length
  ? await pipeline(chunks, (chunk, _item, i) =>
      agent(
        `You finish consumer chunk ${i + 1}/${chunks.length} ("${chunk.slug}") of the DSCO
"${component}" to MUI. Other agents are finishing other chunks in this same working tree
right now: touch only your files and their companions.

${MIGRATION_RULES}

${TREE_RULES}
- Additionally: no yarn build anywhere (the design-system dist is current), no full test
  suites, no apps typecheck (the Verify gate runs it once).

YOUR FILES: ${JSON.stringify(chunk.files)}
PLAN: ${PLAN_DOC} (read the Prop map, Codemod and Shared globals sections)
PROP MAP: ${JSON.stringify(plan.propMap)}
EXPORTS: new ${JSON.stringify(plan.exportPolicy.newExports)}, legacy ${JSON.stringify(plan.exportPolicy.legacyExports)}
${codemodRun ? `CODEMOD ALREADY RAN. Rewritten: ${JSON.stringify(codemodRun.filesChanged.filter(f => chunk.files.includes(f)))}. Untouched (hand-migrate these): ${JSON.stringify(codemodRun.filesUnchanged.filter(f => chunk.files.includes(f)))}. Expected residue per the plan: ${JSON.stringify(plan.codemod.expectedResidue)}. Review each rewritten file's diff (git diff -- <file>) before trusting it.` : 'NO CODEMOD (per the plan). Migrate each consumer by hand per the prop map and the README.'}
EXECUTE NOTES: ${exec.notes}
${chunk.groups[0] === INTERNAL_GROUP ? `This chunk is the inside-out replacement: other design-system components importing the legacy ${componentTitle}. After editing, run yarn test and yarn typecheck in ${LIB}.` : ''}

For each consumer: make sure it uses the MUI version per the plan with behavior kept
(callbacks, ids, data-testids, aria attributes, class hooks tests and UI tests read). Move
styling the legacy props carried into the consumer's .module.scss with semantic tokens;
panel-level selectors that lose to the wrapper's two-class rules or MUI's emotion classes
get the same specificity with a one-line comment naming what they outrank. Delete SCSS
that only styled legacy internals. A consumer that depends on a dropped prop with no MUI
path stays on the legacy component: record it in filesSkipped with the reason. Match the
file's existing language: JS files stay JS.

Tests: run the test files in YOUR FILES. apps: from apps/, yarn test:unit <files>.
frontend packages: from that package, yarn test <file>. Update snapshots only when the
diff is exactly the legacy->MUI DOM change. A test that exercises one of your consumers
but is NOT in YOUR FILES belongs to another chunk: never edit it; note what it will need.
Lint your files: from apps/, npx eslint <files>; frontend: ../../node_modules/.bin/eslint
from the package. Fix what you broke.

Return the structured result.`,
        {schema: CHUNK_SCHEMA, label: `migrate:${chunk.slug}`, phase: 'Migrate'},
      ),
    )
  : []

const migrated = chunkResults.map((r, i) => ({chunk: chunks[i], result: r}))
const skippedChunks = migrated.filter(m => !m.result)
if (skippedChunks.length) log(`WARNING: ${skippedChunks.length} chunk agent(s) returned nothing: ${skippedChunks.map(m => m.chunk.slug).join(', ')}`)
const allSkippedFiles = migrated.flatMap(m => (m.result ? m.result.filesSkipped : []))
const touchedByMigrate = [
  ...new Set([...(codemodRun ? codemodRun.filesChanged : []), ...migrated.flatMap(m => (m.result ? m.result.filesTouched : []))]),
]
log(`Migrate: ${touchedByMigrate.length} file(s) changed, ${allSkippedFiles.length} consumer(s) left on legacy`)

// ── Verify gate ──────────────────────────────────────────────────────────────
const VERIFY_SCHEMA = {
  type: 'object',
  required: ['pass', 'checks', 'failures', 'remainingLegacyImports', 'uiTestEdits', 'filesTouched'],
  properties: {
    pass: {type: 'boolean'},
    remainingLegacyImports: {
      type: 'array', items: {type: 'string'},
      description: `Files outside ${COMPONENT_DIR} still importing a legacy export, from a fresh repo-wide grep`,
    },
    uiTestEdits: {
      type: 'array',
      description: 'Every UI-test file this phase edited, with the consumer whose DOM change forced it',
      items: {
        type: 'object',
        required: ['file', 'forConsumer'],
        properties: {
          file: {type: 'string'},
          forConsumer: {type: 'string', description: `A consumer file from the migration list (an internal one like ${LIB_SRC}/modal/Modal.tsx counts); "" only when the design-system commit alone changes that DOM`},
        },
      },
    },
    checks: {
      type: 'object',
      required: ['appsTypecheck', 'appsUnit', 'appsLint', 'libTests', 'libTypecheck', 'libBuild', 'frontendPackages', 'storybookBuild', 'uiTestSelectors'],
      properties: {
        appsTypecheck: {type: 'string'},
        appsUnit: {type: 'string'},
        appsLint: {type: 'string'},
        libTests: {type: 'string'},
        libTypecheck: {type: 'string'},
        libBuild: {type: 'string'},
        frontendPackages: {type: 'string'},
        storybookBuild: {type: 'string'},
        uiTestSelectors: {type: 'string'},
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
    filesTouched: {type: 'array', items: {type: 'string'}},
  },
}
const allTestFiles = [...new Set(chunks.flatMap(c => c.consumers.flatMap(x => x.testFiles || [])))]
const frontendPkgsTouched = [...new Set(touchedByMigrate.map(f => (f.match(/^frontend\/(packages|apps)\/[^/]+/) || [])[0]).filter(Boolean))]
const legacyExports = plan.exportPolicy.legacyExports

const verifyPrompt = attempt => `You are the VERIFY GATE for the MUI "${component}" migration (attempt ${attempt}/${maxHealAttempts}).
Run the checks below on the current tree and report each result exactly. Fix nothing
except UI-test selectors (step 6), which are yours.

${TREE_RULES}

FILES THE MIGRATION CHANGED: ${JSON.stringify(touchedByMigrate)}
UNIT TESTS TO RUN (apps): ${JSON.stringify(allTestFiles.filter(f => f.startsWith('apps/')))}
FRONTEND PACKAGES TOUCHED: ${JSON.stringify(frontendPkgsTouched)}
UI-TEST FILES TO AUDIT: ${JSON.stringify(discover.uiTestFiles)}
LEGACY EXPORTS: ${JSON.stringify(legacyExports)}

1. ${LIB}: yarn test; yarn typecheck; yarn build (dist must be current before apps checks).
   ${STORYBOOK}: yarn build.
2. apps/: yarn run typecheck.
3. apps/: yarn test:unit <all listed apps test files> in ONE jest invocation, plus any test
   under apps/test whose basename matches a changed source file.
4. Lint like Drone: git add -- <changed files> (the one git write you may do), run
   ./tools/hooks/pre-commit from the repo root, then git reset -q. Never stage
   ${JSON.stringify(discover.preexistingUntracked)}.
5. Each frontend package touched: yarn test, yarn typecheck, ../../node_modules/.bin/eslint .
6. UI-test selectors: read every listed UI-test file. Where a selector depends on DOM this
   migration changed, rewrite it against the MUI DOM (prefer role/name or data-testid; MUI
   *Classes exports are stable). Report each edit in uiTestEdits with the consumer whose
   change forced it, and in filesTouched. Do not run Cucumber.
7. Import audit, independent of the chunk reports: grep the whole repo (apps/src, apps/test,
   frontend, dashboard, ${LIB_SRC}; exclude ${COMPONENT_DIR}) for both import forms of the
   component and list every file whose named imports include a legacy export, or whose
   default import (import X from '...', require().default) hits the path while "default" is
   in the legacy list. That is remainingLegacyImports; it does not affect pass.

pass is true only when every check is clean. Name suspect files for each failure.`

let verify = null
let healAttempt = 0
let healTouched = []
const uiTestOwner = new Map()
while (true) {
  healAttempt++
  verify = await agent(verifyPrompt(healAttempt), {schema: VERIFY_SCHEMA, label: `verify-${healAttempt}`, phase: 'Migrate'})
  if (!verify) throw new Error('verify agent was skipped')
  log(`Verify ${healAttempt}: ${verify.pass ? 'clean' : verify.failures.length + ' failure(s): ' + verify.failures.map(f => f.check).join(', ')}`)
  healTouched = [...new Set([...healTouched, ...verify.filesTouched])]
  for (const e of verify.uiTestEdits) if (!uiTestOwner.has(e.file)) uiTestOwner.set(e.file, e.forConsumer)
  if (verify.pass || healAttempt >= maxHealAttempts) break
  const heal = await agent(
    `You HEAL failing checks in the MUI "${component}" migration (attempt ${healAttempt}/${maxHealAttempts}).

${MIGRATION_RULES}

${TREE_RULES}

FAILURES: ${JSON.stringify(verify.failures)}
FULL CHECK REPORT: ${JSON.stringify(verify.checks)}
FILES CHANGED SO FAR: ${JSON.stringify([...touchedByMigrate, ...exec.filesTouched, ...healTouched])}
PLAN: ${PLAN_DOC}

Fix the root cause, not the assertion. If the design-system side is at fault, fix it under
${LIB}, run yarn build there, and record the departure in ${PLAN_DOC}'s Deviations section.
Re-run only the checks that failed, then return filesTouched and notes.`,
    {schema: TOUCHED_SCHEMA, label: `heal-${healAttempt}`, phase: 'Migrate'},
  )
  if (heal) healTouched = [...new Set([...healTouched, ...heal.filesTouched])]
}
const verifyStatus = verify.pass ? 'green' : 'failing'

// Sampled apps parity, advisory: results go in the PR body, they do not block.
let appsAfter = null
let appsParityResult = 'not-run'
if (appsBefore && appsBefore.available) {
  appsAfter = await agent(
    appsCapturePrompt('after', `${PARITY_DIR}/apps-after`) +
      `\n\nThen diff each successful capture against its baseline in ${PARITY_DIR}/apps-before/
with pixelmatch from apps/node_modules, writing ${PARITY_DIR}/apps-diff/<basename>.png; put
the ratio and what differs (LOOK at the PNGs with the Read tool) in each capture's notes.
Tolerance for "same": ${parityTolerance}; note intended deviations from the plan
${JSON.stringify(plan.legacyDefectsToFix.map(d => d.fix))} as such.`,
    {schema: APPS_CAPTURE_SCHEMA, label: 'apps-parity', phase: 'Migrate'},
  )
  appsParityResult = appsAfter && appsAfter.available ? 'captured' : 'after-capture-failed'
  if (appsAfter) log(`Apps parity: ${appsAfter.captures.filter(c => c.ok).length}/${appsAfter.captures.length} page(s) compared`)
}

// ── Finalize: docs flip, carve, push, PRs ────────────────────────────────────
const fullyMigrated =
  verify.pass && allSkippedFiles.length === 0 && skippedChunks.length === 0 && verify.remainingLegacyImports.length === 0
if (!fullyMigrated && verify.remainingLegacyImports.length) {
  log(`${verify.remainingLegacyImports.length} file(s) still import the legacy ${component}: ${verify.remainingLegacyImports.join(', ')}`)
}

// Heal and Verify edits go to the chunk that owns the file, else to the consumer's chunk
// for a UI-test edit, else to the chunk whose area contains it, else to the design-system
// fixup, else to the last chunk.
const ownerOf = file => {
  for (let i = 0; i < chunks.length; i++) {
    const touched = migrated[i].result && migrated[i].result.filesTouched.includes(file)
    if (chunks[i].files.includes(file) || touched) return i
  }
  if (uiTestOwner.has(file)) {
    const consumer = uiTestOwner.get(file)
    if (consumer) return ownerOf(consumer)
    // A selector for MUI DOM only holds once every consumer has moved: last PR, never PR 1.
    return chunks.length ? chunks.length - 1 : 'ds'
  }
  const g = groupOf(file)
  if (g === DS_CORE_GROUP) return 'ds'
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
const failingSection = verifyStatus === 'failing'
  ? `\n## ⚠ Failing checks\nThe workflow's heal budget ran out with these still failing. Fix before review.\n${verify.failures.map(f => `- **${f.check}**: ${f.detail}`).join('\n')}\n`
  : ''
const appsSection = appsAfter
  ? `\n## Apps parity (sampled, advisory)\nHost ${appsAfter.host}. ${JSON.stringify(appsAfter.captures.map(c => ({consumer: c.consumer, ok: c.ok, notes: c.notes})))}\n`
  : runAppsParity
    ? '\n## Apps parity (sampled)\nSkipped: no local studio was reachable during the run.\n'
    : ''

const FINALIZE_SCHEMA = {
  type: 'object',
  required: ['branches', 'prs', 'leftovers'],
  properties: {
    branches: {type: 'array', items: {type: 'object', required: ['branch', 'sha', 'fileCount'], properties: {branch: {type: 'string'}, sha: {type: 'string'}, fileCount: {type: 'number'}}}},
    prs: {type: 'array', items: {type: 'object', required: ['branch', 'base', 'url'], properties: {branch: {type: 'string'}, base: {type: 'string'}, url: {type: 'string'}}}},
    leftovers: {type: 'array', items: {type: 'string'}},
  },
}

const finalized = await agent(
  `You FINALIZE the MUI "${component}" migration: the docs that depend on the sweep's outcome,
then the consumer branches${publish ? ', pushes and draft PRs' : ' (local only)'}. This step owns git. Run from the repo
root. HEAD is on ${DS_BRANCH}. Stop at the first git error rather than improvising.

NEVER stage: ${JSON.stringify(discover.preexistingUntracked)}, anything under ${STORYBOOK}/dist, or any *.png.

STATE
  fully migrated: ${fullyMigrated} (verify ${verifyStatus}; left on legacy ${JSON.stringify(allSkippedFiles)}; legacy imports still found ${JSON.stringify(verify.remainingLegacyImports)})
  codemod: ${exec.codemodCommand || 'none'}
  legacy exports: ${JSON.stringify(legacyExports)}
  plan doc: ${PLAN_DOC}

─── 1. Docs that depend on the outcome (edit, do not commit yet) ────────────────
  ${STATUS_DOC}: set the ${component} row to ${fullyMigrated ? '**Migrated**' : 'In Progress'} with a note in the style of
  the tooltip row: what moved, what remains and why, the codemod, the behavior changes;
  keep the Internal Dependency Blockers section truthful.
  ${SKILL_DOC}: ${fullyMigrated ? `move ${componentTitle} into the "Use MUI" list with the import to use and out of "Use DSCO".` : `leave ${componentTitle} under "Use DSCO"; consumers remain.`}
  ${fullyMigrated ? `${ESLINT_APPS}: add a no-restricted-imports entry for '@code-dot-org/component-library/${component}' next to the button entry, message naming the replacement${exec.codemodCommand ? ' and the codemod command' : ''}. If any non-legacy export still lives at that path, ban only the legacy names with importNames: ${JSON.stringify(legacyExports)}.` : 'No eslint rule: consumers remain on the legacy component.'}
  ${PLAN_DOC}: append an "Outcome" section: consumers migrated/left, verify result, parity
  result, apps parity result, codemod files rewritten/untouched.
  Run prettier from ${LIB} on the markdown you changed.

─── 2. Design-system fixups (still on ${DS_BRANCH}) ─────────────────────────────
  Exactly these files: ${JSON.stringify(dsFixups)} (plus ${PLAN_DOC} if you changed it). If any:
  git add -- <them>; commit "[Design System] MUI ${componentTitle}: fixups from the consumer sweep"
  with the trailer ${COMMIT_TRAILER}${publish ? `; git push origin ${DS_BRANCH}` : ''}.

─── 3. Consumer commits, one branch each, stacked ───────────────────────────────
  For k over this list in order (each branch from the previous tip):
  ${JSON.stringify(consumerBranches.map(b => ({branch: b.branch, files: b.files})))}
    git checkout -b <branch>; git add -- <those files that exist or were deleted; skip a listed
    path that never changed>; commit:
      [MUI Migration] ${componentTitle} consumers (<k>/${consumerBranches.length}): <slug>

      Move the listed consumers from DSCO ${componentTitle} to MUI${exec.codemodCommand ? ` (${exec.codemodCommand}, plus hand residue)` : ''}. Stacked on the previous PR.

      ${COMMIT_TRAILER}
  The pre-commit hook lints staged files; fix lint errors in the staged files, re-stage, retry.

─── 4. Docs commit on the last branch (${lastBranch}) ───────────────────────────
  Docs files: the ones you edited in step 1 (and ${PLAN_DOC} if not already committed).
  git add -- <the docs files>; commit "[MUI Migration] ${componentTitle}: status, skill${fullyMigrated ? ', eslint rule' : ''}" with the trailer.
  Then git status --porcelain: anything left besides the never-stage list goes into one more
  commit "[MUI Migration] ${componentTitle}: leftovers" and into leftovers in your report.
${publish ? `
─── 5. Push and open draft PRs ──────────────────────────────────────────────────
  git push -u origin <branch> for every consumer branch. Then in stack order:
  gh pr create --draft --base <previous branch, ${DS_BRANCH} for the first> --head <branch>
  --title <commit subject> --body-file <file>. Bodies follow .github/pull_request_template.md;
  delete Deployment notes and Privacy; end with "${PR_FOOTER}". Each body: the areas
  (${consumerBranches.map(b => b.groups.join(', ')).join(' | ')}), consumers left on legacy with reasons,
  the chunk notes and tests, "Stack: PR k of ${totalPrs}, stacked on <previous PR URL>". The last
  one also lists the docs changes${fullyMigrated ? ' and the eslint rule' : ''} and carries this section
  verbatim: ${JSON.stringify(appsSection)}. ${jira ? `Links: Jira ${jira}.` : 'Links: leave the Jira bullet.'}
  ${failingSection ? `Every body carries this section verbatim:\n${failingSection}` : ''}
  Per-branch data: ${JSON.stringify(consumerBranches.map(b => ({branch: b.branch, groups: b.groups, skipped: b.skipped, notes: b.notes, tests: b.tests})))}
  Finally edit the design-system PR ${dsPublished.prUrl} with gh pr edit --body-file: read
  its current body first and replace only the "Stack" section with the consumer PR URLs.` : `
─── 5. No push ──────────────────────────────────────────────────────────────────
  publish is off. Do not push, do not run gh.`}

Finish on ${lastBranch} with a clean tree (except the never-stage list). Report every branch
with its sha and file count, every PR URL, and leftovers.`,
  {schema: FINALIZE_SCHEMA, label: 'finalize', phase: 'Migrate'},
)
if (!finalized) throw new Error('finalize agent was skipped; branches may be half carved')
if (finalized.leftovers.length) log(`WARNING: uncommitted leftovers: ${finalized.leftovers.join(', ')}`)
log(`Done: ${finalized.branches.length + 1} branch(es)${publish ? `, ${finalized.prs.length + (dsPublished.prUrl ? 1 : 0)} draft PR(s)` : ' (local only)'}; parity ${parityStatus}, verify ${verifyStatus}, apps parity ${appsParityResult}`)

return {
  component,
  approach: plan.approach,
  planDoc: PLAN_DOC,
  codemod: exec.codemodCommand || null,
  codemodRewrote: codemodRun ? codemodRun.filesChanged.length : 0,
  consumers: discover.consumers.length,
  leftOnLegacy: allSkippedFiles,
  parity: parityStatus,
  parityAttempts: parityAttempt,
  verify: verifyStatus,
  verifyAttempts: healAttempt,
  appsParity: appsParityResult,
  designSystem: {branch: DS_BRANCH, sha: dsPublished.sha, pr: dsPublished.prUrl},
  branches: finalized.branches,
  prs: finalized.prs,
  leftovers: finalized.leftovers,
}
