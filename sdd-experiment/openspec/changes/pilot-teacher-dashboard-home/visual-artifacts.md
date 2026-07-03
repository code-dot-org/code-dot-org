# Visual Artifacts — pilot-teacher-dashboard-home

Plan section authored now; before/after/diff artifacts appended during Phase 3/4.
A visual check PASSES only when the tool assertion passes under the stated
threshold. Producing an image is NOT a pass.

## Region selector pairs (region-only; never shells/headers/footers)

| Scenario | Legacy selector (test-studio) | Candidate selector |
|---|---|---|
| TD-HOME-EMPTY | empty-state block inside `#teacher-dashboard` (the `EmptyState` container rendered by `EmptyHomepage`; NOT the promotions column, header, or Studio chrome) | the empty-state region root inside `@code-dot-org/teacher-dashboard` (e.g. `#teacher-dashboard-home[data-state="empty"]`) |
| TD-HOME-SECTION-LIST | `#ui-test-section-list` (the `<ol>` of cards) | the candidate list region root (e.g. `ol#teacher-dashboard-home-section-list`) |

The candidate exposes stable region ids (real element ids, not `uitest-*`
test-coupled ids, per the accessibility skill). The legacy `#ui-test-section-list`
is the tightest legacy bound and is used for the advisory capture only.

## Determinism controls

- **Viewport:** fixed `1280×800`, `deviceScaleFactor: 1`, set on the visual
  project.
- **Browser (RULED post-Session-C, Opus interim review 03):** the strict
  self-consistency gate runs on FIREFOX ONLY. Headless Chromium hard-crashes
  loading the `:5173` MSW dev shell in this environment (disconnects right
  after MSW activates; sandbox on/off — Session C observation), while Firefox
  is clean. Playwright baselines are per-browser and self-consistency does not
  require Chromium; a bounded Chromium diagnosis is deliberately NOT spent from
  the pilot budget. Revisit only if CI later mandates Chromium.
- **Locale:** `en-US`; no `ge_region` cookie (Global Edition out of scope).
- **Data:** deterministic — the strict candidate capture is fed MSW `empty` /
  `list` fixtures (fixed names, join codes, counts). The advisory legacy capture
  uses the fixed Playwright fixture recipe (scenario-registry.md), including the
  fixed course `ui-test-single-unit-course-2026`.
- **Animations disabled:** `animations: 'disabled'` on `toHaveScreenshot` (and in
  the consumer config default). On the candidate, no logo transition or tour
  exists to animate.
- **Fonts-ready wait:** the spec MUST add a readiness wait before the check
  (the `settle()` pattern: `document.fonts.ready` + double-rAF) since the region
  uses web fonts (the dev shell loads `@code-dot-org/fonts`).
- **Auth independence:** the gate targets the package dev shell, which renders
  `TeacherDashboardHome` directly — no Studio root auth guard, so the known
  upstream MSW gap (no handler for `GET /api/v1/users/current`, which makes the
  Studio standalone `VITE_API_MODE=msw` render `AuthErrorPage` on every route)
  does NOT affect the visual gate. Upstream note recorded in appendix-02.
- **Volatile elements masked or absent:**
  - Candidate: volatile UI is simply NOT built (no logo animation, promotions,
    drawers, NPS, school-info, AI-diff FAB, onboarding, rebrand banner, demo
    card, coteacher notice, LATAM notice). Nothing to mask on the candidate.
  - Legacy advisory capture: mask/exclude `#ui-test-teacher-promotions`, the
    logo transition (`LogoTransition` — set cookie `hide_codeai_logo_transition`
    or `prefers-reduced-motion`), any drawer/NPS/school-info popup
    (`TeacherHomepagePopups`), the AI-diff FAB, onboarding/tours, and the rebrand
    banner. Wait for `state.teacherSections.asyncLoadComplete` (card spinner
    gone) before capture.
- **Flags:** none set on the candidate (it does not read them). For the legacy
  advisory capture, ensure `demo-section` OFF (so `SectionList`, not
  `DemoSectionCard`, renders) and onboarding/tours OFF.

## Environment decision (recommendation)

The two rendering stacks are fundamentally different: legacy is the `apps/`
webpack bundle (DSCO-heavy, Rails-served) and the candidate is the `frontend/`
Vite/MUI Studio app. Matching the *server environment* (option (a): local-Rails
legacy vs local candidate) does NOT make the two pixel-comparable — different
bundlers, component libraries, and font pipelines still diverge. So the premise
of a "strict matched pair" across legacy and candidate is false, and forcing a
tool-enforced legacy-vs-candidate diff would produce noise, not signal.

**Decision — final acceptance uses option (b) framing:**

- **Strict, tool-enforced gate = candidate self-consistency.** The candidate
  renders deterministically from MSW fixtures in its standalone shell; NATIVE
  Playwright `toHaveScreenshot` (per ceo-decision-01; no shared helper) asserts
  against a prove-stable baseline at `maxDiffPixelRatio ≤ 0.01`. The flake gate
  is `--update-snapshots` then `--repeat-each=5`. This is the pass/fail gate for
  the pilot.
- **Advisory = test-studio legacy vs local candidate side-by-side.** Region
  captures (legacy `#ui-test-section-list` masked; candidate list region) are
  produced at matched viewport/locale/data and reviewed by a human/CEO for
  behavioral+layout equivalence. Not tool-enforced; STRICT cross-stack
  acceptance is DEFERRED (it would require the candidate to reach visual maturity
  and a sanctioned cross-stack comparison method that does not exist today).
  OWNERSHIP: the advisory legacy capture is OPUS-OWNED in Phase 4 (test-studio,
  sanctioned fixtures, masks per this doc) — it is NOT a Sonnet task.

Rationale: this gives a real, reproducible gate now (candidate determinism +
a11y + behavioral assertions) without pretending a cross-stack pixel diff is
meaningful. It also respects the GLOBAL SAFETY RULE — advisory legacy capture is
from test-studio only, never production, with no real user data (fixture teacher/
sections created via sanctioned helpers).

Visual infra ruling (ceo-decision-01, resolves design.md R1): do NOT merge or
cherry-pick `@code-dot-org/playwright-support`; use the native
`toHaveScreenshot` fallback in the package's own `playwright.config.ts`.

## Artifact storage

- Strict candidate baselines: ephemeral under
  `frontend/packages/teacher-dashboard/e2e/tmp/baselines/…` (gitignored; created
  by `--update-snapshots`, deleted after — matching the labs pattern).
- Advisory side-by-side captures (legacy + candidate + diff, per scenario):
  stored under this change dir at
  `sdd-experiment/openspec/changes/pilot-teacher-dashboard-home/artifacts/visual/`
  (`td-home-empty.legacy.png`, `.candidate.png`, `.diff.png`, and same for
  `td-home-section-list`), and their paths appended to this file when produced.

## Artifacts (appended in Phase 3/4)

Task 7.1 (Sonnet, Phase 3): specs added at
`frontend/packages/teacher-dashboard/e2e/td-home-empty.spec.ts` and
`e2e/td-home-section-list.spec.ts`, config at
`frontend/packages/teacher-dashboard/playwright.config.ts` (Firefox-only
project, `expect.toHaveScreenshot` = `{animations: 'disabled',
maxDiffPixelRatio: 0.01}`, viewport `1280×800` @ `deviceScaleFactor: 1`).

Baseline flow run locally against the package's own MSW dev shell
(`yarn dev` via the config's `webServer`, port 5173):

1. First pass (no baseline): 8/10 pass (functional + axe + keyboard); the 2
   `toHaveScreenshot` assertions fail with "snapshot doesn't exist" — expected,
   proves the gate is live.
2. `npx playwright test --project=firefox --update-snapshots`: 10/10 pass,
   baselines written.
3. `npx playwright test --project=firefox --repeat-each=5`: 50/50 pass (10
   tests × 5 repeats) — visual, axe, and keyboard assertions all stable.

Ephemeral ("deleted after") baseline PNGs produced at:

- `frontend/packages/teacher-dashboard/e2e/tmp/baselines/td-home-empty.spec.ts/td-home-empty-firefox.png`
- `frontend/packages/teacher-dashboard/e2e/tmp/baselines/td-home-section-list.spec.ts/td-home-section-list-firefox.png`

(gitignored per this package's `.gitignore`; not committed, regenerable via
`--update-snapshots`.)

Axe: `@axe-core/playwright`, scoped via `.include(REGION_SELECTOR)` to each
scenario's region root — 0 violations for TD-HOME-EMPTY and
TD-HOME-SECTION-LIST, stable across 5 repeats.

Keyboard/focus: both regions have zero focusable elements by design (D5/R4 —
no mutating or navigational control is rendered), asserted explicitly
(`expect(elements).toHaveLength(0)`) rather than skipped; the generic
tab-and-check-visible-focus helper (`e2e/helpers/keyboard.ts`) executes over
whatever the region exposes, so it would catch a regression if a focusable
element were later added without a visible `:focus-visible` style.
TD-HOME-SECTION-LIST additionally asserts `role=list` with 2 `listitem`
children via `page.getByRole('list')`/`getByRole('listitem')`.

Known non-fix: `SectionList.module.scss`'s `.sectionList { list-style: none }`
on the `<ol>` is a documented Safari/WebKit gotcha (list-style: none can strip
list/listitem roles from the accessibility tree in WebKit — Firefox and
Chromium are unaffected). Not observed as a failure here because the gate is
Firefox-only per this doc's Browser ruling; not fixed speculatively (no
failing check to fix against) — flagged as a follow-up for whoever adds a
WebKit lane.
