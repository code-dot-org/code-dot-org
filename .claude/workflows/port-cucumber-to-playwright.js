export const meta = {
  name: 'port-cucumber-to-playwright',
  description: 'Port one Cucumber feature file to Playwright (TypeScript) in e2e-tests',
  phases: [
    {title: 'Scout'},
    {title: 'Dry Run'},
    {title: 'Generate'},
    {title: 'Review'},
    {title: 'Heal'},
    {title: 'Commit'},
  ],
}

// args: repo-root-relative path to ONE Cucumber feature file, or an object:
//   Workflow({name: 'port-cucumber-to-playwright',
//             args: 'dashboard/test/ui/features/star_labs/jigsaw.feature'})
//   Workflow({name: 'port-cucumber-to-playwright',
//             args: {featureFile: 'dashboard/test/ui/features/star_labs/jigsaw.feature', force: true}})
// force: true re-ports even if the spec already exists (use after an interrupted port).
const featureFile = typeof args === 'string' ? args.trim() : args?.featureFile
const force = typeof args === 'object' && !!args?.force
if (!featureFile) {
  throw new Error(
    'args must be the repo-root-relative path to one .feature file, e.g. ' +
      '"dashboard/test/ui/features/star_labs/jigsaw.feature"',
  )
}

// Reference branch — consulted for the SHAPE of reusable TypeScript (shared helpers,
// POM classes) only. Never for PoC docs/decisions. Repoint here if it moves.
const POC_BRANCH = 'origin/stephen/playwright'

// Pinned low so the 5x stress gate measures TEST flake, not self-inflicted concurrency
// against the shared live test-studio (tunable 2-4).
const STRESS_WORKERS = 2

// Generalized authority rule, shared by the scope-deciding phases. The agent
// definitions (generator/healer/reviewer) carry their own copy.
const AUTHORITY = `## Authority
- The Cucumber feature file and its step definitions are the SOLE authoritative contract:
  they define WHAT to test and the scope. Scope is exactly this one feature — never
  inherit scenarios from sibling features.
- Reusable CODE informs only HOW to structure: the working-tree shared/ helpers and POM
  classes, with the reference branch's TypeScript source as a shape fallback.
- NOTHING ELSE is authoritative. No doc, status file, README, prose, or prior decision —
  on any branch — may influence what you port or how you scope it. If such a file
  contradicts the Cucumber contract, the Cucumber wins and the other file is ignored.`

// ── Phase 1: Scout ───────────────────────────────────────────────────────────
// Static analysis only. Reads the feature file and ALL referenced step definitions in
// full (they compose, embed assertions, and branch on params), classifies architecture
// + feature group, fixes target paths, and RECOMMENDS how each step maps to the shared
// library. No code, no browser.
phase('Scout')

const SCOUT_SCHEMA = {
  type: 'object',
  required: [
    'architecture', 'featureGroup', 'scenarios', 'targetSpec', 'specAlreadyExists',
    'workingTreeFoundationPresent', 'stepResolution', 'urlScheme', 'authRequirements',
  ],
  properties: {
    architecture: {
      type: 'string',
      enum: ['legacy', 'lab2', 'non-lab'],
      description:
        'Technical framework. legacy = apps/src/{maze,turtle,bounce,flappy,...} Blockly ' +
        'CSF (POM base LegacyBlocklyLab); lab2 = apps/src/lab2 framework (POM base ' +
        'Lab2Lab); non-lab = teacher tools, dashboard Haml pages, account/auth, video, ' +
        'sharing, catalog, lesson plans, etc. (no Blockly base)',
    },
    featureGroup: {
      type: 'string',
      description:
        'Functional domain that names the test directory: activities, teacher-tools, ' +
        'sign-in, user-account, user-menu, video, sharing, catalog, lesson-plan, ' +
        'levelbuilder, ... A distinct lab may be its own group or a {name}/ subdir within ' +
        'one. Never a generic bucket — identify the domain.',
    },
    scenarios: {
      type: 'array',
      description: 'Every scenario and scenario-outline in the feature file',
      items: {
        type: 'object',
        required: ['name', 'tags'],
        properties: {
          name: {type: 'string'},
          tags: {type: 'array', items: {type: 'string'}, description: 'e.g. @no_mobile, @no_ci'},
        },
      },
    },
    targetSpec: {
      type: 'string',
      description:
        'Repo-root-relative spec path: frontend/packages/e2e-tests/tests/' +
        '{featureGroup-kebab}/[{name}/]{name}.spec.ts',
    },
    targetPom: {
      type: 'string',
      description: 'Repo-root-relative path for a NEW POM, or "" if an existing POM is reused',
    },
    targetBlocks: {
      type: 'string',
      description: 'Repo-root-relative path for blocks.ts, or "" if no Blockly blocks',
    },
    existingPomToReuseOrExtend: {
      type: 'string',
      description:
        'An existing CONCRETE POM to reuse for this lab/feature if one exists (working ' +
        'tree or reference branch) — import and extend it, do not duplicate. Otherwise the ' +
        'base class to extend (LegacyBlocklyLab / Lab2Lab), or "" if none.',
    },
    specAlreadyExists: {
      type: 'boolean',
      description: 'true if targetSpec already exists in the working tree',
    },
    workingTreeFoundationPresent: {
      type: 'boolean',
      description:
        'true if frontend/packages/e2e-tests/tests/shared/ exists in the working ' +
        'tree. When false, Generate must materialize needed shared helpers/POM bases from ' +
        'the reference branch, not just import them.',
    },
    stepResolution: {
      type: 'array',
      description:
        'One entry per DISTINCT step the feature uses. RECOMMENDATIONS only — Generate ' +
        'decides finally against the working tree.',
      items: {
        type: 'object',
        required: ['step', 'recommendation', 'target'],
        properties: {
          step: {type: 'string', description: 'Gherkin step text (or its step-def regex)'},
          recommendation: {
            type: 'string',
            enum: ['REUSE', 'NEW', 'POM_METHOD'],
            description:
              'REUSE = an existing shared/ helper or concrete POM covers it by intent; ' +
              'NEW = a new shared/ helper is needed; ' +
              'POM_METHOD = lab-specific interaction, belongs on the POM not shared/',
          },
          target: {
            type: 'string',
            description:
              'REUSE: existing helper/POM (shared/auth.ts:createTeacher). ' +
              'NEW: proposed shared file + helper name. POM_METHOD: the POM method name.',
          },
          notes: {
            type: 'string',
            description: 'Composition chains, inline assertions, param branching to preserve',
          },
        },
      },
    },
    urlScheme: {
      type: 'string',
      description:
        'How the test reaches the page on test-studio.code.org, derived from step defs: ' +
        'labLevelUrl lesson/level, query params, standalone route, or plain path',
    },
    authRequirements: {
      type: 'string',
      description: 'anonymous / teacher / student / levelbuilder, plus age or permission specifics',
    },
    stepDefFiles: {
      type: 'array', items: {type: 'string'},
      description: 'Provenance: every step-definition file read in full',
    },
    notes: {
      type: 'string',
      description:
        'Anything Generate/Dry-Run must know: @instance-variable state, step composition ' +
        'chains, inline expectations, known selector quirks',
    },
  },
}

const plan = await agent(
  `You are the SCOUT for porting ONE Cucumber feature file to Playwright. Pure static
analysis: read sources, recommend structure. Write NO code. Do NOT browse the app — the
Dry Run phase owns all live observation.

${AUTHORITY}

All paths below are relative to the repo root (git rev-parse --show-toplevel). Run git
from anywhere in the repo.

FEATURE FILE (authoritative): ${featureFile}

─── STEP 0 — One-time setup ───────────────────────────────────────────────────
  Materialize the playwright-best-practices skill that the Generate/Review/Heal phases
  read (it is gitignored, pinned in skills-lock.json). From the repo root, run:
    npx skills experimental_install
  Idempotent — a no-op if already installed. Do this before reading any sources.

─── STEP 1 — Read the feature file in full ────────────────────────────────────
  List every scenario / scenario-outline with its tags (@no_mobile, @no_ci, ...).

─── STEP 2 — Read ALL referenced step definitions IN FULL ─────────────────────
  Step defs live under dashboard/test/ui/features/step_definitions/ (helpers under
  dashboard/test/ui/features/support/). For every step the feature uses, grep to locate
  and read the WHOLE definition. They are NOT 1:1: many call other steps, many embed
  expect/assert inline, many branch on optional regex groups (one regex -> several
  behaviours). Capture especially:
    - step->step composition (steps "...", individual_steps <<~GHERKIN)
    - inline assertions a "When" performs (these become test assertions)
    - hidden state in @instance variables (@users, @section_id, @section_url)

─── STEP 3 — Classify architecture and feature group ──────────────────────────
  architecture (technical framework):
    legacy  — apps/src/{maze,turtle,bounce,flappy,...}; #runButton/.congrats; Blockly
    lab2    — apps/src/lab2 framework (music, weblab2, pythonlab, aichat, ...)
    non-lab — teacher tools, dashboard Haml pages, account/auth, video, sharing,
              catalog, lesson plans, etc.
  featureGroup (functional domain): name the set this test belongs to. Do NOT leave
  non-lab tests generic — identify the domain; it drives the directory.
  Confirm by reading apps/src (or dashboard/ for Haml) — do not guess.

─── STEP 4 — Fix target paths ─────────────────────────────────────────────────
  Place all files under frontend/packages/e2e-tests/tests/{featureGroup-kebab}/
  (a {name}/ subdir when the group holds several labs/features). architecture does NOT
  appear in the path — it only selects the POM base. Set specAlreadyExists if the target
  spec already exists in the working tree. Set workingTreeFoundationPresent from whether
  tests/shared/ exists in the working tree.

─── STEP 5 — Step resolution (RECOMMENDATIONS only) ───────────────────────────
  The shared library prevents duplicated auth/nav/UI code across independent ports.
  Discover existing helpers AND concrete POMs from BOTH (reference branch valid even if
  the working tree lacks the foundation):
    - Working tree: grep exports under tests/shared/ and read the POM bases
      (tests/legacy/shared/LegacyBlocklyLab.ts, tests/lab2/shared/Lab2Lab.ts)
    - Reference branch (TypeScript SHAPE only):
      git show ${POC_BRANCH}:frontend/packages/e2e-tests/tests/shared/auth.ts  (etc.)
  Classify each DISTINCT step by SEMANTIC INTENT (not lexical — many aliases exist for
  "click" and "sign in"):
    REUSE      -> existing shared helper OR concrete POM (give shared/file.ts:helperName)
    NEW        -> new shared concern (auth/nav/generic UI); propose shared file+name
    POM_METHOD -> lab-specific interaction; belongs on the POM, not shared/

─── STEP 6 — Derive URL scheme and auth ───────────────────────────────────────
  From the step defs (authoritative): how the test reaches the page on
  test-studio.code.org, and the auth requirement (anonymous/teacher/student/levelbuilder,
  age/permission specifics).

Return the structured plan.`,
  {schema: SCOUT_SCHEMA, label: 'scout', phase: 'Scout', model: 'sonnet'},
)

if (plan.specAlreadyExists && !force) {
  log(`Spec already exists at ${plan.targetSpec} — pass force: true to re-port.`)
  return {featureFile, targetSpec: plan.targetSpec, status: 'already-ported'}
}

log(`Scout: ${plan.architecture}/${plan.featureGroup} · ${plan.scenarios.length} scenario(s) -> ${plan.targetSpec}`)
const newHelpers = plan.stepResolution.filter(s => s.recommendation === 'NEW')
if (newHelpers.length) log(`${newHelpers.length} new shared helper(s) recommended`)

// ── Phase 2: Dry Run ──────────────────────────────────────────────────────────
// Drives a THROWAWAY probe that captures a vanilla Playwright trace AND polls DOM state,
// then analyzes both for SEMANTIC readiness intelligence: when each transition is "done",
// what NOT to wait on, what changes autonomously. Emits no locators/code — must not
// influence how Generate implements the test, only inform its wait strategy.
phase('Dry Run')

const READINESS_SCHEMA = {
  type: 'object',
  required: ['transitions', 'autonomousContent', 'loadNotes'],
  properties: {
    transitions: {
      type: 'array',
      description:
        'One entry per state transition with an async readiness concern. SEMANTIC ONLY — ' +
        'describe the signal by meaning, never as a CSS/role locator or code.',
      items: {
        type: 'object',
        required: ['transition', 'readySignal', 'antiSignals', 'network'],
        properties: {
          transition: {type: 'string', description: 'What just happened, e.g. "initial page load"'},
          readySignal: {
            type: 'string',
            description:
              'What observable state means "done" — what a careful human watches for ' +
              '(overlay clears, workspace interactive, congrats modal appears, save indicator ' +
              'returns to rest). Describe meaning; NO selector. Note if it lives on a DESCENDANT.',
          },
          antiSignals: {
            type: 'string',
            description:
              'What must NOT be waited on here, with reason: networkidle (telemetry beacons ' +
              'never settle); a signal absent in this lab; button-disabled when state lives elsewhere.',
          },
          network: {
            type: 'string',
            description:
              'Whether network gates readiness: the SPECIFIC response(s) that settle it, or ' +
              '"none — client-side" (Web Audio / canvas with no XHR on the action).',
          },
          approxMs: {type: 'number', description: 'Approximate observed duration on wall-clock'},
          notes: {type: 'string', description: 'Caveats: descendant signal; transient only in screencast; uncharacterized'},
        },
      },
    },
    autonomousContent: {
      type: 'array', items: {type: 'string'},
      description:
        'Content that changes on its own (timestamps, "Saving…/Saved", counters, ' +
        'user-specific text) — assertions must avoid its exact text. Semantic descriptions.',
    },
    loadNotes: {
      type: 'string',
      description:
        'Load-time observations: any pre-mount overlay/spinner, and non-determinism (e.g. a ' +
        'modal on a new project but not on reload) the test must handle.',
    },
    traceFindings: {
      type: 'string',
      description: 'Brief: clean capture? gaps (action-less transient only in screencast)? confidence.',
    },
  },
}

const readiness = await agent(
  `You are the DRY RUN for a Cucumber->Playwright port. Your ONLY output is SEMANTIC
readiness intelligence: when each transition is "done", what must NOT be waited on, and
what content changes autonomously. Do NOT emit locators, selectors, or code, and do NOT
prescribe how the test is implemented — a separate Generate phase authors the test
independently and consumes only your wait-strategy guidance.

MECHANISM: drive a THROWAWAY probe that BOTH (a) captures a vanilla Playwright trace and
(b) polls DOM state via page.evaluate at each transition. Combine them: the TRACE gives
the network timeline + screencast pixels + load coverage (tracing starts before
navigation); the PROBE POLLS give DOM ground-truth ("is the workspace interactive", "is
this element present", "is a container reporting not-visible while its inner content is
already there"). Do NOT use the Playwright MCP to watch (round-trip latency, no
continuous record). Do NOT rely on flat-searching the trace's DOM frame-snapshots — they
are diff/reference-encoded and unreliable for agent string search; that is what the probe
polls are for.

INPUTS (from Scout):
  Feature file: ${featureFile}
  Architecture: ${plan.architecture} / ${plan.featureGroup}
  URL scheme:   ${plan.urlScheme}
  Auth:         ${plan.authRequirements}
  Scenarios:    ${plan.scenarios.map(s => s.name).join('; ')}
  Target host:  https://test-studio.code.org  (live; always up)

─── STEP 1 — Write a throwaway probe ──────────────────────────────────────────
  Vanilla Playwright (the 'playwright' library; @playwright/test not required).
  - Start tracing BEFORE navigation: context.tracing.start({screenshots:true, snapshots:true, sources:true}).
  - Navigate to the scenario URL on test-studio.code.org. If Scout says non-anonymous, do
    a rough sign-in (throwaway).
  - Walk the KEY TRANSITIONS (those with async readiness: load, actions that trigger
    UI/data changes, modals/overlays). TRIGGER each transition, don't assert it. Act
    deliberately, one at a time (DOM snapshots are action-driven). At each transition POLL
    the DOM via page.evaluate for the facts that define readiness (workspace interactive?
    element present? container reporting not-visible while inner content is there?) and
    record poll results with timestamps. You may read step defs / the reference POM to
    learn how to drive a complex interaction.
  - Stop tracing to /tmp/dryrun-<slug>/trace.zip.
  Playwright availability: prefer the e2e-tests install; else \`npx playwright\`
  resolves a usable build (\`npx playwright install chromium\` if missing).

─── STEP 2 — Run the probe ────────────────────────────────────────────────────
  Execute; confirm a non-trivial trace.zip. If a driving locator is wrong, fix the PROBE
  (its locators are throwaway, never part of your output) and rerun. If a transition is
  too complex to drive in a rough probe, mark it UNCHARACTERIZED in notes rather than faking it.

─── STEP 3 — Analyze: combine three evidence sources ──────────────────────────
  - PROBE DOM POLLS  -> DOM ground-truth (element presence, workspace interactivity,
    container-vs-descendant). PRIMARY for DOM state.
  - trace.network (JSONL) -> the network timeline. PRIMARY for the network gate. Align on
    wallTime: anchor on the context-options event's wallTime+monotonicTime, cross-check
    against screencast dual stamps (naive monotonic subtraction lies).
  - screencast frames -> pixel fallback for load-time affordances and action-less transients.
  Do NOT flat-search trace.trace DOM frame-snapshots (diff-encoded; unreliable).
  ALWAYS check and report the descendant-vs-container trap: whether the true ready signal
  sits on a descendant, and whether a container's own visibility misleads — a top flake
  cause. networkidle is UNUSABLE (beacons never idle). Scan autonomousContent and load
  non-determinism.

─── STEP 4 — Clean up ─────────────────────────────────────────────────────────
  Delete the probe spec, its trace, and any test-results/ the probe produced (all
  throwaway). Leave the working tree exactly as you found it — the readiness table is the
  only survivor.

Return the structured readiness intelligence. SEMANTIC ONLY — no selectors, no code.`,
  {schema: READINESS_SCHEMA, label: 'dry-run', phase: 'Dry Run', model: 'sonnet'},
)

log(`Dry Run: ${readiness.transitions.length} transition(s) characterized`)

// ── Phase 3: Generate ─────────────────────────────────────────────────────────
// Customized official generator (live-drive + verified locators) authors the structured
// port: spec + POM + blocks + any NEW shared helpers. Consumes Scout's plan and the Dry
// Run readiness table (wait-strategy guidance only). Durable conventions live in the
// agent definition; this is the per-port brief.
phase('Generate')

const generated = await agent(
  `Port "${featureFile}" to Playwright. Follow your agent instructions (the Code.org
conventions) exactly — this message is only the per-port brief.

SCOUT PLAN
  architecture:       ${plan.architecture} / ${plan.featureGroup}
  targetSpec:         ${plan.targetSpec}
  targetPom:          ${plan.targetPom || '(reuse existing)'}
  targetBlocks:       ${plan.targetBlocks || '(none)'}
  reuseOrExtend:      ${plan.existingPomToReuseOrExtend || '(none)'}
  foundationPresent:  ${plan.workingTreeFoundationPresent}
  urlScheme:          ${plan.urlScheme}
  auth:               ${plan.authRequirements}
  scenarios:          ${JSON.stringify(plan.scenarios)}
  stepResolution:     ${JSON.stringify(plan.stepResolution)}

DRY RUN READINESS (wait-strategy guidance only — never implementation)
  ${JSON.stringify(readiness)}

AUTHORITATIVE SOURCE: ${featureFile} and its step definitions. Re-read them — the Scout
plan guides, the Cucumber is the contract. Author the spec, POM, blocks, and any NEW
shared helpers per your instructions. Drive test-studio.code.org live to verify EVERY
locator. Wire waits from the readiness guidance (never networkidle, never waitForTimeout;
respect the descendant-vs-container notes). Reuse shared/ and existing POMs per
stepResolution; add NEW helpers to shared/. If foundationPresent is false, materialize
the shared helpers/POM bases you import from the reference branch first (inside
e2e-tests). Self-typecheck and self-lint before returning, and fix all issues.
Report every file you wrote.`,
  {agentType: 'playwright-test-generator', label: 'generate', phase: 'Generate', model: 'sonnet'},
)
if (!generated) throw new Error('generate agent was skipped — no port to review or stress')

// ── Phase 4: Review ───────────────────────────────────────────────────────────
// Fidelity vs the authoritative Cucumber + DRY-vs-shared, fixing its own findings, before
// the Healer spends cycles stabilizing. Durable rubric lives in the agent definition.
phase('Review')

const reviewed = await agent(
  `Review the freshly generated port and fix your findings. Follow your agent instructions.

AUTHORITATIVE CONTRACT: ${featureFile} (+ its step definitions). Scope is THIS feature only.
GENERATED FILES: under frontend/packages/e2e-tests/tests/${plan.featureGroup} (spec: ${plan.targetSpec}).
SCOUT step-resolution (for the DRY check): ${JSON.stringify(plan.stepResolution)}
POM base / reuse target: ${plan.existingPomToReuseOrExtend || '(none)'}

Run your four dimensions (fidelity, best-practices, DRY-vs-shared, TS smell), fix what you
find inside e2e-tests only, then confirm typecheck passes. Do NOT run the test suite —
the Healer owns runtime stability.`,
  {agentType: 'playwright-port-reviewer', label: 'review', phase: 'Review', model: 'sonnet'},
)
if (!reviewed) throw new Error('review agent was skipped — port not reviewed before the stress gate')

// ── Phase 5: Heal ─────────────────────────────────────────────────────────────
// Zero-flake gate: the spec must pass 5x across all browsers with retries=0. The workflow
// owns the gate and the 3-attempt budget; the (vanilla-fork) Healer owns root-cause
// diagnosis and fixes. On budget exhaustion the Healer marks test.fixme().
phase('Heal')

const STRESS_SCHEMA = {
  type: 'object',
  required: ['passed', 'totalRuns', 'failures', 'infraSuspected'],
  properties: {
    passed: {type: 'boolean', description: 'true ONLY if every run passed (0 failed, 0 flaky)'},
    totalRuns: {type: 'number', description: '5 repeats x project count'},
    failures: {
      type: 'array',
      items: {
        type: 'object',
        required: ['test', 'project', 'error'],
        properties: {
          test: {type: 'string'},
          project: {type: 'string', description: 'chromium/firefox/webkit'},
          error: {type: 'string', description: 'first relevant error line'},
          tracePath: {type: 'string', description: 'trace.zip path for this failure, if produced'},
        },
      },
    },
    infraSuspected: {
      type: 'boolean',
      description:
        'true if failures look like infrastructure (test-studio 5xx, net::ERR, asset-fetch ' +
        'timeouts) rather than test logic (assertion/locator/timing). Infra blips are not flake.',
    },
    output: {type: 'string', description: 'last ~60 lines of runner output'},
  },
}

const specRel = plan.targetSpec.replace('frontend/packages/e2e-tests/', '')
// CI=1 makes the shared playwright.config.ts skip @no_ci tests (grepInvert: /@no_ci/ when
// isCI) — infra this gate can't provide. --reporter=line and --workers=N below are explicit
// CLI overrides of the config's CI defaults (reporter html+junit, workers:'100%'), so the
// gate streams compactly and measures TEST flake, not load.
// Resolve the runner via yarn (not npx): the workspace can hoist a different
// `playwright` than the package's @playwright/test, and npx would pick the wrong
// one ("two different versions"). yarn resolves the package's own bin.
const stressCmd =
  `cd frontend/packages/e2e-tests && CI=1 yarn playwright test ${specRel} ` +
  `--repeat-each=5 --retries=0 --workers=${STRESS_WORKERS} --trace=retain-on-failure ` +
  `--project=chromium --project=firefox --project=webkit --reporter=line`

const stress = tag =>
  agent(
    `Run the zero-flake stress gate and report results. From the repo root:\n  ${stressCmd}\n` +
      `5 repeats x 3 browsers; retries=0, so any single failure is a real signal. Wait for ` +
      `completion. passed=true ONLY if the runner reports 0 failed and 0 flaky. Set ` +
      `infraSuspected if failures are test-studio 5xx / net::ERR / asset-fetch timeouts ` +
      `rather than assertion/locator/timing.`,
    {schema: STRESS_SCHEMA, label: `stress-${tag}`, phase: 'Heal', model: 'sonnet'},
  )

let result = await stress('gate')
if (!result) throw new Error('stress gate agent was skipped — cannot continue without a pass/fail result')
if (!result.passed && result.infraSuspected) {
  log('Gate failure looks like a test-studio infra blip — re-running once before healing')
  const retry = await stress('gate-retry') // does not consume a heal attempt
  if (!retry) throw new Error('stress gate-retry agent was skipped')
  result = retry
}

let attempt = 0
while (!result.passed && attempt < 3) {
  attempt++
  log(`Stress failed (${result.failures.length}/${result.totalRuns}) — heal ${attempt}/3`)
  await agent(
    `Stabilize the spec at ${plan.targetSpec}; it FLAKED under the 5x/all-browser gate ` +
      `(attempt ${attempt} of 3). Failures:\n` +
      result.failures
        .map(f => `  [${f.project}] ${f.test}: ${f.error}${f.tracePath ? ` (trace ${f.tracePath})` : ''}`)
        .join('\n') +
      `\nDiagnose the ROOT CAUSE from the traces and fix it within e2e-tests only, per ` +
      `your instructions. Do NOT loosen assertions to force a pass — fix the real ` +
      `timing/selector/state cause.`,
    {agentType: 'playwright-test-healer', label: `heal-${attempt}`, phase: 'Heal', model: 'sonnet'},
  )
  const reverify = await stress(`reverify-${attempt}`)
  if (!reverify) throw new Error(`stress reverify-${attempt} agent was skipped`)
  result = reverify
}

const healStatus = result.passed ? 'green' : 'fixme'
if (!result.passed) {
  log('Budget exhausted — marking fixme')
  await agent(
    `The 3-attempt budget for ${plan.targetSpec} is exhausted; it still flakes under the ` +
      `5x/all-browser gate. Per your protocol, mark each still-failing test test.fixme() with ` +
      `a full root-cause explanation and the source ${featureFile}. Do NOT delete the tests. ` +
      `Remaining failures:\n` +
      result.failures.map(f => `  [${f.project}] ${f.test}: ${f.error}`).join('\n'),
    {agentType: 'playwright-test-healer', label: 'fixme', phase: 'Heal', model: 'sonnet'},
  )
}

log(`Heal: ${healStatus}${result.passed ? ` (${result.totalRuns} runs clean)` : ''}`)

// ── Phase 6: Commit ───────────────────────────────────────────────────────────
const commitFiles = 'frontend/packages/e2e-tests/'
// Conventional commit. Green gate -> tag the original Cucumber feature @playwright
// so the Cucumber suite skips the now-ported scenarios (the Playwright port owns
// them). Fixme -> leave it untouched for human review. No push, no PR.
phase('Commit')

const featureSlug = featureFile
  .replace(/^dashboard\/test\/ui\/features\//, '')
  .replace(/\.feature$/, '')
const scenarioWord = plan.scenarios.length === 1 ? 'scenario' : 'scenarios'

const subject =
  healStatus === 'green'
    ? `test(e2e): port ${featureSlug} to playwright`
    : `test(e2e): port ${featureSlug} to playwright [fixme]`

const body =
  healStatus === 'green'
    ? `Port ${plan.scenarios.length} ${scenarioWord} from ${featureFile}.\n` +
      `Green under the 5x/all-browser stress gate; original Cucumber feature tagged ` +
      `@playwright so the Cucumber suite skips it.\n\n` +
      `Source: ${featureFile}`
    : `Port ${plan.scenarios.length} ${scenarioWord} from ${featureFile}.\n` +
      `Stress gate exhausted the 3-attempt budget; affected tests marked test.fixme() for ` +
      `human review. Cucumber feature retained.\n\nSource: ${featureFile}`

await agent(
  `Create the conventional commit for this port. Run from the repo root.

1. Remove throwaway seed specs an earlier phase may have left — they are NOT gitignored and
   would otherwise be swept into the commit below (test-results/ IS gitignored, so it needs
   no cleanup):
     rm -f frontend/seed.spec.ts frontend/packages/e2e-tests/seed.spec.ts
   Then stage exactly the files this workflow produced — no broader glob:
     git add ${commitFiles}
2. ${
      healStatus === 'green'
        ? `Green gate — flip the spec's JSDoc "Migration status: PORTING" to "COMPLETED". ` +
          `Then tag the Cucumber feature so the Cucumber suite skips the now-ported ` +
          `scenarios: add a feature-level \`@playwright\` tag to ${featureFile}. If the ` +
          `line directly above the \`Feature:\` keyword is a tag line, append \` @playwright\` ` +
          `to it (only if not already present); otherwise insert a new \`@playwright\` line ` +
          `directly above \`Feature:\`. Do NOT change anything else in the feature. Stage it:` +
          `\n     git add ${featureFile}`
        : `Fixme — the healer marked the still-failing test(s) test.fixme(); flip the spec's ` +
          `JSDoc "Migration status: PORTING" to "FIXME" to match (the generator wrote PORTING; ` +
          `no earlier phase changes it). DO NOT tag or modify the Cucumber feature; it stays ` +
          `untouched for human review and is NOT counted as migrated.`
    }
3. Commit with this EXACT message (heredoc preserves newlines):
     git commit -m "$(cat <<'MSG'
${subject}

${body}
MSG
)"
   The pre-commit hook lints the staged TypeScript. If it reports lint errors, FIX them
   (inside e2e-tests only), re-stage, and commit again — do not bypass the hook.
4. Print the result: git log -1 --oneline --stat

Do NOT push. Do NOT open a pull request. Stay within e2e-tests (plus the @playwright
tag on the Cucumber feature on green).`,
  {label: 'commit', phase: 'Commit', model: 'sonnet'},
)

return {featureFile, targetSpec: plan.targetSpec, status: healStatus}
