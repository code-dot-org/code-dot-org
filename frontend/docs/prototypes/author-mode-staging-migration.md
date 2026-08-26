# Author Mode: migrating `ngfp/author-mode-prototype` onto `staging`

Plan only. Nothing here has been executed.

Merge-base with `origin/staging`: `467377958d2e`. `origin/staging` is 1226
commits ahead of it; this branch is 154 ahead. The prototype itself is 3 commits:
`69a1b75b411`, `e445d83724b`, `e08c98d1507`. Everything else on this branch is
the `ngfp/music-lab-updated` labs stream.

## 1. Summary and go/no-go

**The stated reason for migrating does not hold. The oceans premise is refuted.**

- The dual-tfjs hazard is **branch-only and already mitigated here**.
  `@magenta/music@1.23.1` (this branch's music lab) pulls `@tensorflow/tfjs@^2.7.0`,
  hoisting `tfjs-core@2.8.6` beside oceans' `1.7.4` (`frontend/yarn.lock:5448,7477,7491`).
  `origin/staging`'s lockfile has **zero** `@magenta/*` and exactly one
  `tfjs-core` (`1.7.4`). This branch pins the hazard out with resolve aliases in
  `frontend/packages/labs/oceans/vite.config.ts:72-87`; with
  `externalizeDeps({deps: false})` (line 68) tfjs is bundled into `oceans/dist`,
  and studio consumes dist (no workspace source alias —
  `frontend/apps/studio/vite.config.ts:36-42`), so the alias does reach studio.
- `staging`'s oceans is the **older standalone** lab: no `OceansActivity`, no
  `schema.ts`/`OceansLevelPropertiesSchema`, no `./mocks` subpath, no
  `@code-dot-org/lab` dep. `origin/staging:.../oceans/src/index.ts` is 4 lines;
  this branch's is 17. Diff 24 files, +629/-259.
- `staging` floats mobilenet `^2.0.4` → **2.1.1**, peers `tfjs-core@^4.9.0`,
  resolved against `1.7.4`. This branch hard-pins `2.0.4` (peers `~1.2.1`), which
  matches tfjs 1.x. On this axis the branch is the correct side.
- Oceans **rendered in studio here** 12 h before the failure report:
  `frontend/.authoring/polish-oceans-{1280,1728,final}-*.png` (Aug 25 18:03-18:13),
  `verify-lesson-built.png`; `oceans/dist` rebuilt 18:43.
- The failure artifact is a **browser crash, not a JS error**: 390 MB Chromium
  coredump `core.2974163` at repo root (Aug 26 05:59, `execfn`
  `~/.cache/ms-playwright/chromium-1237/chrome-linux64/chrome`). A headless
  GPU/memory abort inside tfjs fits; no dependency-graph change touches it.

**NO-GO as an oceans fix. CONDITIONAL GO as a rebase off a dead branch**, which
is the real justification:

- 1226 commits of drift. This branch is *behind* staging on `core` (missing
  `api/dashboard/{activities,schools}`, `plugins/consent`, `constants/countries`),
  `markdown` (-619 lines), `component-library`, `turbo.json`, `.yarnrc.yml`,
  `enableMocks.ts`.
- Staging's host contract is **simpler and lets the prototype shrink**:
  `<Lab levelId levelPropertiesMap>` takes properties as a prop and does no fetch
  (`origin/staging:frontend/packages/labs/base/src/components/Lab.tsx:19-22`,
  `contexts/LevelPropertiesContext.tsx`). That deletes `LabHost`, `mswBridge.ts`,
  `LabProviders.tsx`, and `SYNTHETIC_LEVEL_ID_FLOOR`, and makes `/author` work
  without `VITE_API_MODE=msw`.
- Cost: **music lab is lost.** `origin/staging:frontend/packages/labs/music` is a
  10-file placeholder whose only dep is `@code-dot-org/core` — no blockly, no
  audio, no sequencer. The prototype's music level falls to `UnsupportedLevel`.

Sequencing: **Phase 0 before Phase 1.** Reproduce the crash on this branch in a
headed browser and settle the root cause first. The migration is worth doing on
its own merits; doing it blind risks landing on a substrate where oceans is
equally broken for a different reason, with music gone as well.

## 2. Port inventory

Carry verbatim: `frontend/packages/authoring/`, `frontend/packages/widget-runtime/`,
`frontend/apps/authoring-service/`, `frontend/apps/studio/src/modules/authoring/`
(minus `mswBridge.ts`), `frontend/apps/studio/src/routes/author/`, and
`frontend/docs/prototypes/author-mode.md` (with its LabHost section rewritten).

Surgical edits to staging files:

- `frontend/apps/studio/package.json`: add **three** deps only —
  `@code-dot-org/{authoring,markdown,widget-runtime}`. The staging↔HEAD diff also
  shows `lesson-deep-dive` and `users` being removed; that is staleness, not
  intent (`git diff --stat 467377958d2e HEAD -- <that file>` is insertions only).
  Keep staging's. Also add `"sass": "catalog:"` to devDeps —
  `authoring.module.scss` needs it and staging's studio declares no sass (it
  hoists from `fonts`/`lesson-deep-dive`; declare it rather than rely on that).
- `frontend/apps/studio/vite.config.ts`: the `/authoring-api` proxy block only
  (HEAD lines 27-34).
- `frontend/.gitignore`: the `.authoring/` stanza only. Keep staging's
  `playwright-report-eyes/`, `test-results-eyes/`, `all-blob-reports/`.

Leave behind:

- `frontend/packages/{audio,blockly,progress,teacher-dashboard}` — reachable only
  through this branch's fat `@code-dot-org/lab`
  (`frontend/packages/labs/base/package.json:107-115`; `labs/base/src/redux/store.ts:7,9`,
  `components/Lab.tsx:4,8`, `types.ts:14`). Staging's `@code-dot-org/lab` depends
  on `@code-dot-org/core` alone.
- All of `frontend/packages/labs/**`. +15,635 lines in `base`, +18,532 in `music`.
  That is the labs stream, a different project.
- `frontend/apps/studio/src/modules/labs/{LabProviders.tsx,config/labs.ts,router/*}`
  — `LAB_REGISTRY`, `getLabFixtures`, `activateFixtureScenario` are labs-stream
  files; nothing in `modules/authoring` imports them except `getLabEntrypoint`,
  which is replaced (§4.6). Same for `routes/levels/$levelId.tsx`.
- `frontend/yarn.lock`, `turbo.json`, `.yarnrc.yml`, `packages/core/**`,
  `packages/markdown/**`, `studio/src/modules/mocks/enableMocks.ts` — take
  staging's; regenerate the lockfile.
- `frontend/apps/studio/src/routeTree.gen.ts` — generated; let the router plugin
  rewrite it.
- `core.2974163` — stray 390 MB coredump. Delete; do not commit.

## 3. Divergence findings

**(a) studio.** Staging dispatches labs by Levelbuilder `appName`
(`getLabEntrypointByAppName`: `fish`, `standalone_video`), not by a `$labType`
registry; wraps them in `<Lab levelId levelPropertiesMap>` rather than a fetching
`LabHost`; supplies `QueryClientProvider` at root (`routes/__root.tsx:118`) with
no redux and no api-client context; registers per-kind zod schemas eagerly
(`modules/labs/oceans/levelKinds.ts`); and gates every route behind
`beforeLoad` → `fetchAuthOutcome` + `primeCsrfToken` (`routes/__root.tsx:161-168`).

*Store wiring needs no adaptation.* `git diff origin/staging HEAD --
frontend/packages/core/src/redux/` is **empty** — staging already has the
singleton `injectSlices` store. Commit `678bfc8325a` touches only
`labs/{base,music}/src/redux/store.ts` and `labs/oceans/src/fixtures/simple.ts`,
none of which exist on staging. The prototype contains zero redux references.

*MSW needs no host change.* The prototype never touched `enableMocks.ts`
(`git diff 467377958d2e HEAD -- <that file>` is empty). Staging's
`registerMockFixture` already supports the array argument, an async responder
returning `undefined` to decline, and unscoped global registration
(`origin/staging:frontend/packages/core/src/api/mocks/fixtures.ts`), so
`mswBridge.ts` would port unchanged. §4.6 argues for deleting it anyway.

*Vite.* The entire staging↔HEAD diff for `studio/vite.config.ts` is the
`/authoring-api` → `/api` rewrite to `:3737`. Same-origin is load-bearing:
`mswBridge.ts:38` needs `bypass()` because a fetch inside an MSW resolver is
itself intercepted.

**(b) labs API vs what the prototype consumes.** Every `@code-dot-org/*` import in
`modules/authoring/**` + `routes/author/**`:

| Specifier | On staging |
| --- | --- |
| `@code-dot-org/authoring` (10 sites), `@code-dot-org/widget-runtime` (1) | ported |
| `@code-dot-org/markdown` → `{Markdown}` (4) | yes (`markdown/src/index.ts:2`) |
| `@code-dot-org/component-library/{tags,fontAwesomeV6Icon}` | yes (`package.json:348`, `:210`) |
| `@code-dot-org/core/api/mocks` → `registerMockFixture` | yes |
| `@code-dot-org/oceans-lab/styles.css` | yes, same subpath (`package.json:22`) |
| `@code-dot-org/lab` → `{Loading}` (4) | **root barrel empty on staging**; `Loading` is at `@code-dot-org/lab/host` and takes no `isLoading` prop |
| `@code-dot-org/lab` → `{LabHost}` (`ExperienceStage.tsx:9`) | **absent.** `git grep -l LabHost origin/staging -- frontend/` → nothing |
| `@code-dot-org/oceans-lab/mocks` | **absent** (used only by `LAB_REGISTRY`, which stays behind) |

`authoring-service`'s only `@code-dot-org/*` import is
`@code-dot-org/widget-runtime/chrome` (`server.ts:9`, `publish/buildChangeSet.ts:1`).
Its declared `@code-dot-org/authoring` dep is **unused at runtime** —
`src/authoring/model.ts` is a deliberate hand-maintained mirror.

**(c) branch-only packages actually needed:** `authoring`, `widget-runtime`,
`authoring-service`. Nothing else. Grep for
`@code-dot-org/(audio|blockly|progress|teacher-dashboard)` across `studio/src` and
the three package `src/` trees → zero hits. Only reachability is transitive
through this branch's `@code-dot-org/lab`, which is not being ported.

**(d) workspace mechanics.** `frontend/package.json` is **byte-identical**; the
globs `apps/*`, `packages/*`, `packages/labs/*` already cover all three ported
dirs. The catalog lives in `frontend/.yarnrc.yml`, and HEAD's is a strict
**subset** of staging's (staging adds `sass`, `vite-plugin-lib-inject-css`,
`@mui/utils`) — **no catalog additions needed**; every `catalog:` specifier the
ported packages use already resolves. Four **new explicit** deps enter:
`@anthropic-ai/claude-agent-sdk@^0.3.246`, `hono@^4.7.0`,
`@hono/node-server@^1.14.0`, `@modelcontextprotocol/sdk@^1.30.0`; all
single-consumer, keep explicit. Every referenced `lint-config` preset
(`eslint/{node,react,vitest}.mjs`, `prettier/index.mjs`,
`typescript/tsconfig.{vite.app,node22}.json`) exists on staging byte-identical.
`turbo.json`: keep staging's; no new task entries (turbo skips missing scripts;
`authoring-service`'s `start` is invoked directly). Nit: `widget-runtime`'s
`peerDependencies` uses `workspace:*`, against `.yarnrc.yml` guidance — normalize.

**(e) curriculum data.** Read paths: `authoring-service/src/boot/paths.ts:22`
(`resolveRepoRoot` asserts `dashboard/config` exists),
`packages/authoring/src/node/loadCourse.ts:51-53`, `boot/levelCatalog.ts:22-26`.
One course, `IMPORTED_COURSE_NAME = 'k5-ai-data-2024'` (`boot/importCourse.ts:4`),
overridable via `AUTHORING_IMPORT_COURSES`. **`coursef-2024` appears nowhere** —
zero grep hits; that course in the brief is not a code path. Diffed individually:
`courses/k5-ai-data-2024.course` and `scripts_json/k5-ai-data-2024.script_json`
identical; all 21 `level_keys` plus the 13 recursed out of the two
`.bubble_choice` and two `.level_group` containers identical. Two files differ:

- `course_offerings/k5-ai-data.json` — **3 field values**, staging authoritative:
  `curriculum_type` `Module`→`Standalone Unit`, `header` `csc`→`favorites`,
  `facilitator_course_permissions` `null`→`[]`. Read at `loadCourse.ts:66-69`,
  passed to `buildCourse` as `offeringJson`. If that projection enum-narrows
  `curriculum_type` or reads `header`, it needs a fix.
- `videos.csv` — staging appended 4 `pl-aif2-*` rows; read optionally
  (`loadCourse.ts:80`) and none are k5-ai-data keys. Inert.

`levels/custom/{fish,music,standalone_video}` differ by 53 unrelated 2026-course
files, so `LevelCatalog.size` and `searchLevels` grow; count assertions in
`boot/__tests__/levelCatalog.test.ts` may drift.

**(f) oceans.** See §1. The migration removes the dual-engine *hazard* by
removing `@magenta/music` from the tree, but this branch already neutralizes it in
its own build, oceans demonstrably rendered here, and the failure artifact is a
Chromium coredump — outside the reach of any dependency-graph change.

## 4. Procedure

1. **Commit the working tree here first.** 11 files, +194/-127, all portable: DSCO
   `Tags`/`FontAwesomeV6Icon` polish plus `role="log"` a11y (`AuthorSidebar`,
   `LessonPlayer`, `OutlineRail`, `TutorDock`, `MatchLevel`, `MultiLevel`,
   `authoring.module.scss`, both `author` routes); `AUTHORING_IMPORT_COURSES`
   multi-course seeding (`server.ts:66-77`); and the `appShim.ts` size-polling fix
   (self-rescheduling `setTimeout` chain, because rAF — and therefore
   `ResizeObserver` — never fires in a `sandbox="allow-scripts"` srcdoc iframe).
   Do not commit `core.2974163`.
2. **Phase 0 — diagnose oceans here, before migrating.** Headed browser, console
   and network capture, `chrome://gpu`; rebuild `oceans/dist` and confirm the
   alias landed in the emitted bundle. Gate the rest on the answer.
3. **New worktree off staging**, not this one — ported `.authoring/` sessions are
   relative to `frontend/`, and two trees let you A/B behaviour.
   `git worktree add ../author-mode-staging -b ngfp/author-mode-staging origin/staging`.
4. **Copy the three workspaces verbatim**, `yarn install` at `frontend/` to
   regenerate the lockfile. Gate: `typecheck` on each, plus their vitest suites
   (`authoring`: importer/apply/loadCourse; `widget-runtime`: WidgetFrame,
   hostRuntime, widgetServer, widgetChrome). These have no staging coupling and
   should pass unmodified.
5. **Copy `studio/src/modules/authoring/` and `studio/src/routes/author/`**; add
   the three studio deps plus `sass`; add the vite proxy block and the
   `.gitignore` stanza; let the router plugin regenerate `routeTree.gen.ts`.
6. **Adaptation edits — 7 files.**
   - `ExperienceStage.tsx:9`: drop `{LabHost, Loading}`. Rewrite the `labhost`
     branch to staging's contract —
     `<Lab levelId={n} levelPropertiesMap={{[String(n)]: properties}}><LabEntrypoint onContinue={onNext}/></Lab>`
     with `Lab`/`Loading` from `@code-dot-org/lab/host` and `LabEntrypoint` from
     `getLabEntrypointByAppName(properties.appName)`. The service already emits
     `appName: 'fish'` (`boot/levelCatalog.ts:193`, `importer/buildCourse.ts:347`),
     so key on `appName` and drop `labKey` entirely.
   - `WidgetExperienceView.tsx:5`, `routes/author/index.tsx:5`,
     `routes/author/$courseId/index.tsx:6`, `.../$lessonId.tsx:4`: `Loading` from
     `@code-dot-org/lab/host`, drop the `isLoading` prop.
   - **Delete `mswBridge.ts`** and the three `loader: () =>
     registerAuthoringMswBridge()` calls. Fetch level properties from
     `/authoring-api/levels/:id/level_properties` through the existing
     `modules/authoring/{api,hooks}.ts` react-query layer and pass them into
     `<Lab>`. `LevelPropertiesProvider` does no zod parsing, so per-level
     `mode`/`guides` survive without `registerLevelKindSchema` — register a kind
     schema only if you route through `DashboardApiClient` instead.
   - **Do not port `LabProviders.tsx`.** Staging's root already gives
     `QueryClientProvider`; `<Lab>` needs neither redux nor an api-client context.
   - `VideoLevel.tsx`: staging has a native `standalone_video` entrypoint
     (`modules/labs/standaloneVideo/`) — consider deleting the hand-rolled one.
   - Music: register nothing. `appName: 'music'` falls to `UnsupportedLevel`.
     Record it in `author-mode.md`.
7. **Session data.** `frontend/.authoring/` is gitignored and lives at
   `<frontendRoot>/.authoring/sessions/<sessionId>/` (`store/SessionStore.ts:61`):
   plain `curriculum.json`, `changes.jsonl`, `chat.jsonl`, `widgets/`,
   `publish-*.json`, with an explicit `version` defaulting to 0
   (`SessionStore.ts:32,39,100`). **Old sessions stay readable** — `cp -r` the
   `sessions/` tree into the new worktree. No re-import unless the domain model
   changes. `agent-session.json` holds a claude-agent-sdk session id whose
   transcript lives in `~/.claude`, machine-local, so it survives the move.

## 5. Verification gates, in order

1. `typecheck` green on `authoring`, `widget-runtime`, `authoring-service`, then
   `studio`.
2. `authoring-service` boots on :3737, imports `k5-ai-data-2024`, `GET /api/state`
   returns the course with its 21 top-level levels; repeat with
   `AUTHORING_IMPORT_COURSES` naming a second course. Confirms the changed
   `course_offerings` fields (§3e) parse.
3. `/author` and `/author/$courseId` render course list and outline against the
   live service.
4. **HEADLINE GATE — an oceans level mounts *and runs*.** Not "a canvas
   appears": fish render, training accepts clicks, the KNN classifier predicts,
   no console error, no renderer crash. Compare against this branch's
   `frontend/.authoring/polish-oceans-final-viewport.png`. If this fails the
   migration bought nothing — return to Phase 0.
5. A music level mounts. Expected: `UnsupportedLevel`. Record as a known
   regression, not a bug.
6. A widget mounts in the sandboxed iframe and **reports size** — the `appShim`
   poll must drive frame height as tool-driven content grows. Compare against
   `polish-widget-trained-viewport.png`.
7. `POST /api/publish` yields a `publish-*.json` change set matching one produced
   on this branch for the same edits.
8. Manual-authoring smoke: add an experience, reorder the outline, run the tutor
   dock, confirm the activity feed's `role="log"` announces.
9. `./tools/hooks/pre-commit` clean on every changed file.

## 6. Risks, ranked

1. **Oceans still broken afterwards** (high — §1). Mitigate with Phase 0 and by
   keeping this worktree for A/B.
2. **Music lab gone** (certain). Accept and document, or scope a separate port of
   `labs/{base,music}` + `{audio,blockly,progress,teacher-dashboard}` — +34k
   lines, a different project that must not be smuggled into this one.
3. **`LabHost` has no staging equivalent** (certain, bounded). The replacement is
   ~30 lines, but it drops `useLoadLab`/app-options/project loading. Fine for
   oceans (no project); a blocker for any future project-backed lab under
   `/author`.
4. **`course_offerings/k5-ai-data.json` drift** (medium). If `buildCourse` narrows
   `curriculum_type`, import fails at boot. Cheap to test in gate 2.
5. **`LevelCatalog` count assertions drift** (low). 53 new `.level` files.
6. **New staging packages colliding** (low). `lesson-deep-dive` and
   `playwright-support` share neither a name nor a route prefix. The one real
   hazard is dropping them from `studio/package.json` by pasting HEAD's version
   wholesale (§2).
7. **Lockfile churn** (low). Regenerate `frontend/yarn.lock`, never cherry-pick;
   a drifted lockfile fast-fails all CI.
8. **Store/redux drift, catalog conflicts, MSW host changes** — all three
   verified as non-risks above. Four new explicit deps, no catalog edits.

## 7. Effort

Steps 1/3/7 (commit, worktree, session copy): 25 min total. Step 2 (Phase 0
oceans diagnosis): 1-3 h. Step 4 (port 3 workspaces, install, package gates):
1 h. Step 5 (studio module, routes, config): 45 min. Step 6 (adaptation edits):
3-5 h. Gates 1-9: 2-4 h. **Total, excluding a music-lab port: 9-15 h.**
