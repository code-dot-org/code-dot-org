# Frontend Platform — Adversarial Exploration Report

Date: 2026-07-04. Branch: `stephen/frontend-platform-openspec` (cut from
`origin/staging` at 513932bef33). Planning only: no product code was
implemented, no packages scaffolded, no product behavior modified.

Scope: the repo-root `frontend/` Turborepo workspace (apps, packages,
conventions, generators, core API/mocks/transports, MSW/dev-shell patterns,
e2e-tests, design-system integration, module boundaries, testing/release
workflow), contrasted with the legacy architecture (root `apps/` webpack
bundle, Rails/HAML bootstrap) where the platform plan depends on it.

## Method

Every material input — the PRFAQ, repo docs, generator templates, package
examples, and each subagent report — was treated as a hypothesis and checked
against repo evidence. Six analysis subagents (Opus) performed the repo
archaeology; two measurement subagents (Sonnet) performed builds, timings,
and production wire measurements. Their load-bearing claims were then
re-verified first-hand before inclusion. Two subagent claims were corrected
in that pass:

- A "ghost `frontend/packages/teacher-dashboard`" finding is **not** repo
  evidence: the directory has zero git-tracked files, does not exist on
  `origin/staging`, and is local build detritus in this worktree. It is
  excluded from all findings below.
- The design-system storybook is Storybook 10 (`@storybook/react-vite
  ^10.1.7`), not 8 as one report stated.

Verdict labels used throughout: Implemented, Partial, Aspirational, Stale,
Contradicted, Unverified.

## Evidence inspected

Docs and config, read directly or via verified subagent citation:

- PRFAQ: `~/Downloads/PRFAQ_ Introducing the Next Generation Frontend
  Platform for Code.org's Learning Platform.md`
- `frontend/README.md`, `frontend/AGENTS.md`,
  `frontend/docs/conventions/packages.md` (the only conventions doc that
  exists), `frontend/turbo.json`, `frontend/.yarnrc.yml`,
  `frontend/package.json`
- `frontend/turbo/generators/config.ts` + `templates/{package,lab}/`
- `frontend/apps/studio`: `package.json`, `vite.config.ts`,
  `config/vite.json`, `entrypoints/application.tsx`, `src/routes/*` (all
  three), `src/modules/{router,auth,labs,mocks}/`, `docs/architecture.md`
- `frontend/packages/core`: `package.json`, `docs/architecture.md`,
  `README.md`, `src/api/**` (client, 11 domains, transports, mocks),
  `src/plugins/{localization,observability}`, `src/config/SiteConfig.ts`
- `frontend/packages/e2e-tests`: `playwright.config.ts`, `README.md`,
  `tests/**` (fixtures, POMs, shared libs, axe), `bin/run-playwright-tests-ci.sh`
- Design system: `component-library/{README,CONTRIBUTING,MIGRATION_STATUS}.md`,
  `src/themes/code.org/**`, `component-library-styles/`,
  `apps/design-system-storybook/`
- Representative packages: `labs/music` (reference lab), `labs/oceans`
  (migrated legacy lab), `labs/ailab` (vendored, unregistered), `core`
  (utility), `users` (app-shaped scaffold)
- CI: `.github/workflows/{frontend-ci,studio-ci,component-library-ci,
  component-library-deploy,oceans-ci,e2e-tests-ci,dtt,frontend-docker-images}.yml`,
  `.github/actions/frontend/setup/action.yml`, `docker/ci/scripts/ui_tests.sh`,
  `lib/rake/test.rake`
- Legacy: `apps/webpack.config.js` (855 lines), `apps/webpackEntryPoints.js`,
  `apps/lab2EntryPoints.ts`, `apps/package.json`,
  `dashboard/app/views/{teacher_dashboard/show,levels/show,levels/_blockly,
  levels/_apps_dependencies}.html.haml`, `dashboard/app/helpers/levels_helper.rb`,
  `lib/cdo/asset_helper.rb`, `lib/rake/{package,build}.rake`,
  `dashboard/app/controllers/frontend_studio_controller.rb`,
  `dashboard/config/routes.rb:10`

Empirical measurements (commands recorded in the measurement reports; the
production compression finding re-measured first-hand):

- Studio dev server: Vite self-reports `ready in 523ms`; routes serve the
  699-byte SPA shell in ~3ms. Caveat: first `yarn dev` in this sandbox hit
  `EMFILE` in Vite's config watcher; `CHOKIDAR_USEPOLLING=1` works around
  it (environment artifact, not repo evidence).
- Studio build: cold `turbo build --filter @code-dot-org/studio` 15.3s wall
  (Vite step 11.6s); warm re-run 213ms (`FULL TURBO`). `dist/` = 41 MB,
  733 files, 505 of them per-locale `.woff2` font subsets.
- Studio bundle: main chunk `index-DtMr4ajh.js` 3,384 kB raw / 1,799 kB
  gzip, plus `application-*.js` 723 kB raw / 229 kB gzip; Vite emits its
  ">500 kB after minification" warning.
- Unit tests: `packages/core` 143 tests across 17 files in ~1.0s wall.
- `yarn install --immutable` in `frontend/`: 2.3s, clean.
- Legacy entry points: 237 webpack entries in one compilation (18 app +
  102 code-studio + 80 levelbuilder + 26 PD + 3 shared + 7 other + 1
  localization), counted by requiring `webpackEntryPoints.js` in Node.
- Legacy production page weight (public level
  `/courses/dance-2019/units/1/lessons/1/levels/1`): 21 first-party JS
  assets, 14,063,561 bytes over the wire. `code-studio-common…min.js` is
  10,595,002 bytes with **no content-encoding** (raw S3 passthrough via
  CloudFront, `x-cache: Hit from cloudfront`) — 75% of the page's JS wire
  weight, re-verified first-hand with explicit `Accept-Encoding: gzip, br`
  while sibling assets on the same CDN arrive gzipped.
- Legacy footprint: `apps/node_modules` 2.4 GB; 214 dependencies + 145
  devDependencies; the on-disk `apps/build/package` is a 7.9 GB debug build
  (unminified; not representative of prod sizes — prod numbers above are
  wire measurements).

## Current-state architecture map

### The new platform (`frontend/`)

Turborepo workspace, Yarn 4.12 with `nodeLinker: node-modules` (required by
the legacy `portal:` consumption; PnP would break it) and a version catalog
in `.yarnrc.yml` as single source of truth (React pinned `^18.3.1` for the
`apps/` portal boundary; prettier and playwright exact-pinned).

- **Shell**: `apps/studio` — Vite 7 + TanStack Router v1
  (`autoCodeSplitting: true`) + `vite-plugin-rails`. Rails serves it at
  `GET /frontend-studio(/*path)` (`dashboard/config/routes.rb:10`) through
  `frontend_studio_controller.rb`, which hard-404s in production
  (`return head :not_found if Rails.env.production?`). The basepath
  `/frontend-studio` is hardcoded in lockstep across `config/vite.json`,
  `src/modules/router/index.ts:24`, and the Rails route. Route surface
  today: three files — root layout (auth fetch in `beforeLoad`, theme,
  header/footer), a placeholder index (`Hello "/"!`), and
  `/projects/$labType/$channelId/edit`.
- **Core** (`packages/core`): browser-only (throws under SSR/Node by
  design), three module-load singletons (`CodeStudioConfig`,
  `DashboardApiClient`, `localization`), plugin model via
  `initializeCore({plugins})`. API layer = ky transport behind a
  `Transport` abstraction, hand-written Zod schemata with
  `camelcase-keys`, CSRF via meta tag + `/get_token` refresh, `retry: 0`
  hardcoded, no pagination convention. 10 wired domains + one orphan
  (`lessons`, imported nowhere). MSW mock system lives in core: fixture
  registry + scenario store (sessionStorage write-through), lab fixtures
  registered by the host, scenario chosen by the `:channelId` URL slot in
  `VITE_API_MODE=msw` mode. Runtime config doctrine: Rails
  `<meta name="app-config">` + hostname, never `import.meta.env`.
- **Module contract** (labs): package exports a self-contained React
  component (default export, no props); host provides React/MUI singletons
  via peer-dep externalization + one `initializeCore()` call; host-side
  registration is three files + a workspace dep, automated by
  `yarn turbo gen lab`. Labs ship standalone dev shells (`index.html` +
  `main.tsx`) and a `./mocks` fixtures subpath.
- **Packages**: component-library (DSCO + MUI theme/overrides, 56 export
  subpaths, published alpha to GitHub Packages manually),
  component-library-styles (raw SCSS/CSS, no exports map), core, markdown,
  users (5-file scaffold), e2e-tests, fonts, lint-config, changelogs;
  labs: music (reference, demo-quality UI), oceans (verbatim port of
  ml-activities; best-tested package in the tree), ailab (vendored,
  unregistered in studio).
- **CI**: `frontend-ci.yml` path-filters into per-area reusable workflows
  (studio, component-library, oceans, e2e-tests). Gates are build + lint +
  typecheck + vitest. Applitools Eyes is `continue-on-error` on
  component-library PRs; oceans' visual projects do gate oceans changes.
  The e2e-tests GHA lane runs against `test-studio.code.org` (never PR
  code); the Drone lane that does see PR code is `|| true`
  (`docker/ci/scripts/ui_tests.sh:21`). No browser-level test loads studio
  anywhere in CI.
- **Pre-prod deploy machinery exists**: `lib/rake/build.rake` +
  `lib/rake/package.rake` build studio, upload a package to S3 keyed by
  the turbo hash, and symlink `dashboard/public/frontend-studio` — skipped
  on production and levelbuilder tiers.

### The legacy platform (root `apps/` + Rails/HAML)

One webpack compilation with 237 entry points and a mandatory shared
`runtimeChunk`; `splitChunks` disabled in dev (2x-10x rebuild cost
otherwise); hand-tuned prod cacheGroups maintained by manual bundle
analysis; circular-dependency debt institutionalized in a checked-in
allow-list; ForkTsChecker capped at 2.5 GB. Rails/HAML bootstraps React by
emitting `<script src=webpack_asset_path(...)>` tags carrying JSON in
`data-*` attributes (or `var appOptions = …` globals), parsed client-side
and mounted via `createReactRoot`. No SSR anywhere. Latent dead reference:
`PEGASUS_ENTRIES` is destructured and spread in `webpack.config.js:35,480`
but never exported by `webpackEntryPoints.js`.

### The boundary

Legacy consumes five `frontend/` packages via Yarn `portal:` links
(`apps/package.json:209-216`), resolving to **raw TS source**
(component-library `main: components/index.ts`), recompiled inside the
legacy webpack build. `@code-dot-org/component-library` is imported from
~575 files in `apps/src`; ~299 files use MUI theme augmentations. So the
design system is load-bearing across the boundary in one direction, while
`users`/`markdown`/labs have no legacy consumers. CSRF, observability, and
config each exist twice (legacy implementations + core's), with only the
observability plugin genuinely shared across both bundles.

## Future-state intent (PRFAQ, corrected)

Applying the human corrections — Vite + TanStack Router is the intended
direction; Next.js/SSR language is historical; offline-first is a platform
capability, not a per-module mandate — the future state the repo is
actually building toward:

Feature work happens in self-contained packages under `frontend/` with
per-package build/lint/test (seconds, cached), standalone dev shells that
run against MSW fixtures without Rails, and generator-enforced conventions.
The studio shell (Rails-Vite as primary; standalone mode as a supported
alternative) composes packages as lazy-loaded chunks behind TanStack
routes, with Rails still providing session/CSRF/runtime config through the
`app-config` meta tag. Modules gain first-class mocks, scenario-based dev
personas, per-module observability, and eventually production serving once
the readiness gates clear. Offline/replay is an opt-in capability tier in
core's transport layer.

## Current vs future compare/contrast

| Dimension | Legacy `apps/` today | `frontend/` today | Future intent |
|---|---|---|---|
| Compilation unit | 1 build, 237 entries | per-package, turbo-cached | unchanged (working) |
| Dev server | webpack-dev-server :9000, minutes to start | Vite 523ms (studio) | unchanged (working) |
| Rendering | client-side, HAML bootstrap | client-side SPA behind Rails route | client-side; SSR abandoned (core is browser-only by design) |
| Routing | Rails routes → per-page bundles | TanStack Router, 3 routes, `/frontend-studio` basepath | real route surface incl. app-shaped features |
| Data | `data-*` JSON + ad-hoc fetch | core `DashboardApiClient` (Zod, CSRF) | one client, conventions for retry/pagination still unset |
| Mocks | none | core MSW registry + lab fixtures | fixture/scenario architecture for all domains |
| Testing gate | Drone (unit real; e2e `\|\| true`) | build/lint/typecheck/vitest; no studio browser test | e2e as a real per-module PR gate |
| Publishing | S3 package + symlink | manual alpha `release-it` (2 pkgs); `release:dryrun` is build+lint+test only | truthful validation + automated publish where needed |
| Prod serving | studio.code.org via CloudFront | hard-404 in production | gate list exists implicitly; needs a spec |
| Observability | global | Sentry plugin + per-app DSN meta (studio DSN only) | per-module signals |
| Offline | none | replay transport (partial; blob path broken) | capability tier, opt-in |

## Assumption audit — PRFAQ claims

| PRFAQ claim | Evidence | Verdict |
|---|---|---|
| Pages are server-side rendered with Next.js | Zero Next.js artifacts anywhere under `frontend/`; core is documented browser-only, SSR-incompatible (`packages/core/docs/architecture.md:3`); stack is Vite 7 + TanStack Router | **Contradicted** (historical language; corrected direction confirmed by repo) |
| Monolithic Next.js app containing modules | Same as above; the shell is a Rails-Vite SPA | **Contradicted** |
| Dev server startup < 1s | Vite self-reported `ready in 523ms` for studio | **Implemented** (for today's small shell; not yet load-tested with many modules) |
| Module unit tests < 5 min | core: 143 tests in ~1s; per-package vitest everywhere | **Implemented** |
| Module UI tests < 15 min | oceans CI e2e exists and gates; e2e-tests GHA lane has a 20-min timeout; no studio-route UI tests at all | **Partial** |
| Compile/test "up to 300× faster" | No benchmark in repo; the ratio is plausible directionally (237-entry webpack vs 213ms warm turbo) but unmeasured as stated | **Unverified** |
| Deploys live in < 45 min via GHA per module | Only automated deploy is storybook → GitHub Pages; studio packaging is S3 + symlink through the legacy tier pipeline; no per-module prod deploy exists | **Aspirational** |
| CMS already live on this platform | CMS/marketing-sites is a separate repo (`frontend/README.md:6`); nothing in this repo's `frontend/` serves it | **Unverified in this repo** (conflates the marketing-sites stack with this workspace) |
| Offline-first modules; local storage + sync | core has a replay/record transport over IndexedDB (read replay only; blob path silently broken; `record` never bootstrap-selectable; no write queue/sync) | **Partial machinery, Aspirational as stated** |
| PWA + mobile app access | No manifest, no service worker (only MSW's mock worker), no PWA tooling in studio | **Aspirational** |
| Accessibility strictly enforced by policy | jsx-a11y `strict` config applied to all React packages via shared lint config (real, gating); runtime axe in exactly 3 e2e specs; storybook a11y addon non-gating; Eyes `continue-on-error` on PRs | **Partial** |
| Per-module monitoring/tracing/logging | core observability plugin (deferred Sentry adapter, session-based sampling) + per-app DSN via meta tag; only `frontend_studio_sentry_dsn` exists; no per-module granularity | **Partial** |
| Modules independently disable-able | No kill-switch/flag machinery for modules | **Aspirational** |
| OCI containers from the start; DevContainers | `frontend-docker-images.yml` ships a **CI base image** to ghcr weekly; no app packaging as containers; no `.devcontainer/` in the repo | **Partial (CI image only)** / DevContainers **Aspirational** |
| Backend-free contribution (clone → `yarn dev`) | Real for labs: standalone shells + `VITE_API_MODE=msw` + fixtures (music proves the loop incl. an end-to-end fixture-contract test) | **Implemented for labs; Partial overall** (workflow text says `frontend/python-lab`, which does not exist) |
| Access at learn.code.org | No repo evidence; current serving model is Rails at `/frontend-studio` | **Unverified** |

## Assumption audit — repo docs claims (selected; all re-verified)

| Doc claim | Evidence | Verdict |
|---|---|---|
| Studio is "experimental" (`frontend/README.md:19`) | `frontend/AGENTS.md:10` calls Rails-Vite studio "primary architecture"; `vite-plugin-rails` + S3 packaging wired | **Contradicted** (README stale) |
| `docs/conventions/tech.md` covers Rails config injection (`AGENTS.md:78`) | File does not exist; only `packages.md` is present | **Contradicted** (dangling reference) |
| Labs reachable at `/app/projects/<name>/…` (`packages.md:120`, music README, studio README) | Actual basepath is `/frontend-studio`; route is `/projects/$labType/$channelId/edit`; no `/app` prefix exists | **Stale** (a new author lands on 404) |
| External deps → peerDependencies, never `dependencies` (`AGENTS.md:98`) | Violated by markdown (runtime remark/rehype/unified), component-library (lodash, react-player), oceans (TFJS — deliberate) | **Partial** (rule needs qualification) |
| Never `"type": "module"` — breaks legacy webpack (`packages.md:42`) | markdown and component-library-styles both set it | **Contradicted** (rule over-broad; needs scoping to portal-consumed JS packages) |
| Generator and `packages.md` are tightly coupled and must match (`AGENTS.md:82-93`) | Lab/package templates hardcode `react ^19.2.0` while the catalog pins `^18.3.1` (the exact hazard `.yarnrc.yml:60-70` warns about); real labs use `catalog:` | **Contradicted in practice** |
| core README API example (`README.md:44-47`) | `DashboardApiClient.labs.levels…` / `.users.userPreference.getTheme()` — neither path exists; real client is flat | **Contradicted** |
| `httpTransport`/`fetch` mode (`transports/README.md:21,47,116`) | No such file/export/mode; `ApiMode` is `dashboard\|msw\|replay\|auto`; `src/api/README.md` also names a bogus `rails` mode | **Contradicted** (phantom transport) |
| MUI augmentation source `types.d.ts`, manually synced to `apps/src/types/mui.d.ts` (MIGRATION_STATUS.md:76, design-system skill) | Real source is `src/themes/code.org/muiAugmentation.ts`; both documented paths do not exist; only studio keeps a hand-copy (drift risk) | **Contradicted** (three docs agree with each other, not with the code) |
| component-library tests use "Jest + RTL" (README, CONTRIBUTING) | 0 Jest; vitest everywhere; `setupTests.ts` imports `jest-dom/vitest` | **Stale** |
| users package provides `UsersSettingsPage`, `./mocks`, persona dev shell, studio route (users README) | `src/index.ts` is an empty barrel; no consumer anywhere; studio has no dep on it | **Aspirational** (README reads as shipped) |
| Studio vite config aliases react/react-dom for singleton safety (`apps/studio/docs/architecture.md:70-79`) | `vite.config.ts` has only the `@` alias + MUI/emotion dedupe; React singleton rests on hoisting | **Stale** |
| `release:dryrun` validates release readiness | Turbo task with no backing script in any package; equals build+lint+test; exercises no pack/publish step | **Contradicted by its name** |
| Migration status table complete | `footer` style override ships in `STYLE_OVERRIDES` but is absent from the table | **Partial** |

Additional first-hand findings in core: a second, divergent
`src/api/package.json` (same name, four phantom export subpaths —
`./metrics`, `./audio`, `./textToSpeech`, `./redux` — with no source, plus
aws-sdk/newrelic/statsig/redux deps the real build never uses); orphaned
`lessons` domain; a duplicate raw-ky `getCurrent` path bypassing the
Transport abstraction; exported `ApiClientProvider`/`useApiClient` with
zero consumers; MSW default handlers covering 5 of 10 wired domains while
vitest runs `onUnhandledRequest: 'error'`; mock URLs hand-mirrored from
`*.api.ts` strings with no shared constant; e2e-tests' `requestWithCsrf`
re-implements core's CSRF logic rather than reusing it.

## Friction map — what blocks module authors today

1. **Docs route them into walls.** The advertised lab URL (`/app/projects/…`)
   404s; the AGENTS conventions table points at a nonexistent doc; the core
   README's first example doesn't compile; the transports README documents a
   transport that doesn't exist; the MUI augmentation workflow points at two
   nonexistent files.
2. **The generator regresses the workspace.** A fresh `turbo gen lab` pulls
   React 19 into a catalog-pinned React 18 workspace whose own comments call
   that a hooks-violation hazard; its studio-registration regex silently
   no-ops if package.json dep ordering shifts.
3. **The scaffold-vs-shipped boundary is invisible.** users' README (and
   ailab's presence) read as shipped functionality; authors cannot tell
   Implemented from Aspirational without spelunking.
4. **No app-shaped convention exists.** `packages.md` covers libraries and
   labs; users/teacher-dashboard-class packages (props-in page component,
   host-owned router, auth, `./mocks` persona scenarios) have no documented
   contract and no generator, exactly as the Teacher Dashboard migration
   (16 surfaces) is about to need one.
5. **Per-lab quirks leak into the host.** Oceans required a studio-side
   wrapper component, a manual CSS import, and a TFJS `global` shim in
   *studio's* vite config; each migration erodes "labs are plug-in chunks".
6. **Nothing browser-tests the shell.** Studio CI is dryrun-only; a core or
   router change that blanks every route merges green. Auth is re-fetched
   on every navigation and there is no route-gating primitive to build on.
7. **MSW mode fails closed.** Five domains have no default handler, so any
   test touching users/courses/sections/metrics/auth throws until each
   package hand-registers fixtures.
8. **Validation vocabulary lies.** `release:dryrun` names a release check
   that doesn't exist; Eyes "gates" that are `continue-on-error`; e2e
   "gates" that never see PR code; `@no_mobile`/`@no_ci` tags that filter
   nothing.

## Failure modes if conventions remain unchanged

- A generated lab lands React 19 alongside portal-shared React 18 → runtime
  hooks violations across the `apps/` boundary, hard to bisect.
- Docs drift compounds: each new package copies one of three styling
  regimes and one of two vitest-config idioms; the "tightly coupled"
  generator/docs rule keeps decaying because nothing checks it.
- The studio shell reaches its production decision with zero browser-level
  regression signal and a 3.4 MB main chunk (vendor code not yet split) —
  the new platform re-creates the legacy "one giant bundle" failure at
  birth. For reference, the legacy endpoint of that road, measured in prod
  today: 13.4 MiB of first-party JS on a public level page, 75% of it one
  uncompressed 10.6 MB file.
- The phantom core surfaces (`src/api/package.json`, `lessons`,
  `httpTransport` docs) get resolved by tooling or copied by authors,
  producing builds that differ from review-time expectations.
- Teacher Dashboard migration (planned separately) arrives with no
  app-shaped convention or auth primitive, so it invents both ad hoc and
  the platform inherits the divergence.

## Gap analysis

| Needed for the corrected future state | Exists today | Gap |
|---|---|---|
| Truthful docs/generator baseline | drifted (see audits) | doc sweep + template catalog alignment + a coupling check |
| App-shaped package contract | users scaffold + README aspirations | written convention + generator support + reference impl |
| Studio route gate (browser-level) | none | MSW-mode Playwright smoke wired into studio CI |
| Auth/route-gating primitive | display-only auth fetch per navigation | `beforeLoad` caching + `requireAuth` helper |
| MSW parity across domains | 5/10 default handlers; hand-mirrored URLs | full default coverage + shared URL/schema source |
| Truthful validation pipeline | `release:dryrun` misnomer; manual alpha publish; GHA installs non-immutable | rename/implement; publint-class export checks; immutable installs; pin-lockstep check |
| Production readiness definition | scattered gates (controller 404, rake skips, no DSN, placeholder index) | a single spec enumerating gates + bundle budget |
| Offline/replay capability tier | partial replay transport with known defects | fix or fence; label capability tiers honestly |
| Per-module observability | plugin + one DSN | naming/config convention (investigation first) |

## Improvement buckets (repo-backed) → proposed OpenSpec changes

1. **Docs truth pass** — reconcile every Contradicted/Stale doc claim above
   with code reality; write the missing `tech.md` (Rails-Vite integration
   contract) or repoint; relabel aspirational READMEs.
   → change `frontend-docs-truth-pass`
2. **Generator/catalog alignment** — templates use `catalog:`; peer ranges
   match reality; robust studio-registration edits; a CI check that a
   generated package builds and matches `packages.md`.
   → change `frontend-generator-catalog-alignment`
3. **Core API surface hygiene** — delete the phantom manifest, orphan
   domain, duplicate client path, dead context exports; fix or fence the
   replay transport's blob/record defects.
   → change `frontend-core-api-hygiene`
4. **Core MSW parity** — default handlers for all wired domains; shared
   URL constants between api and handlers; Zod-validate mock responses so
   mocks fail at definition, not consumer parse.
   → change `frontend-core-msw-parity`
5. **Studio e2e gate** — MSW-mode Playwright smoke of the studio shell in
   `studio-ci.yml` (no Rails needed); retire dead tags; document lane
   truthfulness (what gates, what doesn't).
   → change `frontend-e2e-studio-gate`
6. **Release/validation truthfulness** — rename or implement
   `release:dryrun`; package-level export validation (publint-class);
   `--immutable` on GHA; automate the pin-lockstep assertion.
   → change `frontend-release-validation-truth`
7. **App-shaped package conventions** — codify the contract the users
   README sketches and the Teacher Dashboard migration needs; extend the
   generator.
   → change `frontend-app-package-conventions`
8. **Studio production readiness** — one spec enumerating every gate
   between `/frontend-studio` 404-in-prod and served-in-prod, including a
   main-chunk budget/code-splitting requirement backed by today's 3.4 MB
   measurement.
   → change `frontend-studio-production-readiness`

## Recommended sequencing

1. `frontend-docs-truth-pass` + `frontend-generator-catalog-alignment`
   first — cheap, stop active damage to new authors, and every later
   change edits docs these fix.
2. `frontend-core-api-hygiene` then `frontend-core-msw-parity` — hygiene
   deletes surface parity would otherwise have to cover.
3. `frontend-e2e-studio-gate` — establishes the regression signal the
   remaining work relies on.
4. `frontend-release-validation-truth` — independent; any time after the
   docs pass.
5. `frontend-app-package-conventions` — before Teacher Dashboard
   implementation starts consuming the pattern.
6. `frontend-studio-production-readiness` — last; depends on the e2e gate
   and feeds the eventual production decision.

## Risks and non-goals

Risks:

- Concurrent planning: the Teacher Dashboard OpenSpec PR shares this
  planning area; these changes deliberately stay platform-generic and name
  the TD work only as a future consumer.
- Doc fixes can themselves drift; the generator-check in bucket 2 is the
  only structural guard proposed — the rest remains convention.
- The e2e gate proposal adds CI wall time to studio PRs; sized as a smoke
  suite, not a port of the Cucumber corpus.
- Sandbox measurement caveats are labeled in place (EMFILE workaround;
  shared turbo cache made "cold" builds partially warm; dev-start
  wall-clock upper bound is loose).

Non-goals / intentionally not proposed:

- **Fixing the uncompressed 10.6 MB `code-studio-common` production
  asset** — real and severe, but it is legacy asset-pipeline/infra work
  (S3 object metadata / CloudFront compression), not `frontend/` platform
  planning. Flagged for an infra ticket instead.
- Removing Drone's `|| true` on legacy Playwright — legacy CI policy,
  owned outside this workspace; recorded as evidence only.
- Any DSCO→MUI component migration work, product routes, or lab ports —
  product-scoped.
- SSR/Next.js investigation — Contradicted by repo direction; nothing to
  build.
- Offline-first write-queue/sync design — beyond the replay-transport
  fixes in bucket 3, no evidence-backed design exists yet; forcing one now
  would be the speculative wishlist this report is instructed to avoid.
- Per-module observability conventions — needs an investigation (DSN
  provisioning, naming) before it is proposable; listed in the gap table,
  not as a change.

## Remaining ambiguities

- Whether `docs/conventions/tech.md` should be written or the AGENTS row
  repointed (default in the docs change: write it, consolidating the
  Rails-Vite meta-tag/basepath contract) — `BLOCKED-EVIDENCE: owner
  preference`.
- The intended fate of `ailab` (vendored at 0.0.52, MIT, unregistered):
  register, or mark explicitly as parked — `BLOCKED-EVIDENCE: owning-team
  decision`.
- Whether studio's index route ships a real catalog page or redirects at
  production time — product decision, marked in the readiness change.
- Why `getLabFixtures.ts` omits oceans (works via generic fallback, but
  the asymmetry with music is undocumented) — resolved either way by the
  MSW parity change.
