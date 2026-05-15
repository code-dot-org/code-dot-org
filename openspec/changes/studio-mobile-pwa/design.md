## Context

`frontend/apps/studio` is a Vite + React + TanStack Router app that hosts "labs" (e.g. `@code-dot-org/oceans-lab`, `@code-dot-org/music-lab`) as lazy-loaded modules. It is currently served by Rails via `vite-plugin-rails`; the production bundle assumes a Rails origin for its base URL and pulls course metadata over the network on every page view.

The hackathon brief asks for the same app to ship as (a) an installable PWA usable offline and (b) a Capacitor-wrapped iOS/Android app, with a mobile-first course catalog and at least one course (AI for Oceans) that runs end-to-end with no network. The target users include students on a single shared iPhone in a remote classroom with no reliable internet, all the way up to desktop users on a school chromebook.

The UX consultant on this change (a former rural CS teacher) emphasized: offline-by-default, thumb-zone-first, one-tap-to-start, no full-screen "you are offline" dead-ends, and absolutely no auth wall on first launch. Those constraints inform the decisions below.

## Goals / Non-Goals

**Goals:**
- One studio codebase, three deployment targets: existing Rails-served web, installable PWA at a stable URL, Capacitor iOS/Android binary.
- Course catalog renders from cache on every cold start; network is a freshness upgrade, never a gate.
- AI for Oceans plays end-to-end with airplane mode on, from app launch through completing at least one training+test round.
- Zero new server endpoints. Read-only consumption of an existing Dashboard catalog endpoint with a bundled JSON fallback.
- Every change confined to `frontend/apps/studio/` plus the minimum surface area in `frontend/packages/oceans-lab` and `frontend/packages/blockly-workspace` needed to make those bundles run without a Rails origin.

**Non-Goals:**
- Authentication, account creation, or student progress sync back to Dashboard.
- Teacher/classroom features, leaderboards, share-to-class.
- App Store / Play Store submission, push notifications, in-app purchases.
- Localizing the catalog or courses beyond what the existing labs already support.
- Making more than one or two sample courses offline-capable. Other catalog tiles render but are tagged "Needs internet".
- Production-grade caching policy. A simple "cache-first, network-update-in-background" strategy is sufficient for a hackathon demo.

## Decisions

### D1. PWA tooling: `vite-plugin-pwa` (Workbox) over hand-rolled service worker

We will use `vite-plugin-pwa` with its Workbox preset. It integrates with the existing Vite build, generates the manifest, hashes precache entries, and gives us runtime caching strategies (cache-first for shell, stale-while-revalidate for catalog) with a few lines of config.

**Alternatives considered:** Hand-rolling a service worker. Rejected — non-trivial cache invalidation against hashed Vite bundles is exactly what Workbox solves. We do not need the flexibility.

### D2. Capacitor wraps the same Vite bundle, with a separate `build:mobile` script

Capacitor's `webDir` will point at `dist/` produced by a new `yarn build:mobile` script that runs `vite build` with `base: './'` and PWA generation disabled (Capacitor ships its own update mechanism; a service worker inside the native shell is redundant and can cause confusing double-caching).

**Alternatives considered:** Two separate apps (one PWA, one Capacitor). Rejected — defeats the "one codebase" goal and doubles maintenance.

### D3. Course catalog data: Dashboard endpoint with bundled JSON fallback

On first launch we ship a `bundled-catalog.json` containing 6–10 curated course offerings (titles, slugs, illustrations, sample-offline flag). When online we fetch the latest from Dashboard's existing course-offerings endpoint and merge into IndexedDB; on subsequent launches we read from IndexedDB first and update in the background.

**Alternatives considered:**
- Live-only catalog: Rejected — fails the first-launch-offline requirement.
- Bundled-only catalog: Rejected — catalog goes stale immediately on every release; even a hackathon demo benefits from showing real Dashboard data.

If the Dashboard endpoint returns a shape we cannot consume directly, we add a single adapter function in `src/modules/catalog/api/courseOfferings.ts`; we do not negotiate API changes with the backend team during the hackathon.

### D4. Persistence: IndexedDB via `idb-keyval`, no Redux

Catalog data, download status per course, and student progress for AI for Oceans all live in IndexedDB. We use `idb-keyval` (≈600 bytes gzipped) rather than pulling Dexie or building schema migrations. A thin `src/modules/storage/` wrapper exposes typed get/set/list functions; consumers do not touch IDB directly.

**Alternatives considered:** localStorage (too small for ML weights and bundled images), `idb` (more flexible but heavier than we need for ≤3 keys).

### D5. Bundle AI for Oceans assets locally; pin TF.js to a workspace version

`@code-dot-org/oceans-lab` already exists as a workspace package and is imported lazily by studio. For offline play we (a) audit its asset loading to ensure every fetch goes through Vite's module graph (so it is precached by `vite-plugin-pwa`), (b) bundle a small fixed dataset of fish/trash images and labels into the package, and (c) pin TensorFlow.js to a single workspace version so the WASM/JS files are part of the precache manifest.

Any external CDN fetch in oceans-lab is replaced with a static import or rewritten to load from the same origin. This is the riskiest piece of the change (see R1).

**Alternatives considered:** Lazy-download the model on first launch when online. Rejected — fails the "rural iPhone with no internet on day one" scenario from the UX brief.

### D6. Routing: catalog at `/`, lab at `/lab/:slug`, no Rails dependency

In Capacitor and PWA modes, `/` is the catalog screen. Tapping a tile pushes `/lab/:slug` which lazy-loads the lab module the same way studio does today. The existing Rails-side studio routes continue to work because the same Vite bundle still mounts under the Rails path when served by `bin/dashboard-server`.

**Alternatives considered:** Reusing existing studio routes verbatim. Rejected — many of them assume a Rails-rendered Haml shell that does not exist in Capacitor.

### D7. UX defaults from the rural-CS UX brief

Implementation must honor these (specs enforce them; design records intent):
- Tiles dim with a cloud-slash icon when online-only and offline; never block with a full-screen error.
- Bottom-anchored "Continue" pill on phone when a last-played course exists.
- Bottom-sheet Blockly toolbox on phone; 44px minimum tap targets.
- No login wall ever in this scope.

## Risks / Trade-offs

- **R1. AI for Oceans bundle size and TF.js cold-start** → A full TF.js + small CNN can be 2–5 MB. Mitigation: lazy-load oceans-lab chunk only when the user taps the tile; show a one-time download progress UI; pre-warm during a brief splash on subsequent launches.
- **R2. Hidden Rails-origin assumptions in legacy code paths** → oceans-lab or blockly-workspace may have hardcoded `/blockly/media/...` URLs that break under `file://`. Mitigation: a build-time audit script that greps for absolute origins; replace with import statements where found. If the audit turns up more than a day of work, descope the second sample course.
- **R3. Catalog endpoint shape unknown until we look** → The Dashboard course-offerings response may not match what the mobile catalog needs. Mitigation: ship the bundled-JSON path first so the screen works regardless; treat live-fetch as an enhancement.
- **R4. iOS Safari service worker quirks** → SW lifetime, IDB storage caps, and "Add to Home Screen" inconsistencies on iOS can bite. Mitigation: test on a real iPhone day-one; if PWA install on iOS is too flaky, lean harder on the Capacitor path for iOS users and keep PWA install primarily for Android/desktop.
- **R5. Capacitor + Vite hot reload friction** → Native dev loop is slower than `vite dev`. Mitigation: keep all UI work in browser-based PWA mode; only sync to Capacitor for occasional native verification, not for inner-loop development.
- **R6. Time pressure from hackathon scope** → Mitigation: tasks.md orders work so we have a shippable PWA before we touch Capacitor, and a shippable Capacitor wrapper before we polish offline AI for Oceans. Each layer can be the final demo if the layer above gets cut.

## Migration Plan

1. **Phase 1 — PWA scaffolding (no behavior change):** add `vite-plugin-pwa`, manifest, icons. Studio remains Rails-served; new behavior is just "installable in browser." Roll back by removing the plugin config.
2. **Phase 2 — Catalog screen behind a route:** add `/` catalog route in studio that reads bundled JSON only. Existing studio routes untouched. Roll back by deleting the route file.
3. **Phase 3 — Live catalog fetch + IDB cache:** wire up Dashboard course-offerings fetch and IDB merge. Falls back to bundled JSON on any error.
4. **Phase 4 — Offline AI for Oceans:** audit and rewire oceans-lab asset loading; bundle dataset; verify airplane-mode play.
5. **Phase 5 — Capacitor wrapper:** `yarn build:mobile`, `npx cap add ios`, `npx cap add android`, verify both run the app locally on simulators.

Each phase is independently revertable; nothing in phases 1–4 changes Rails-served studio behavior, only adds new capabilities under new routes and a new build script.

## Open Questions

- Which Dashboard endpoint best serves the catalog? Candidates: `/dashboardapi/course_offerings`, `/v2/course_offerings`, or a new lightweight `/api/mobile_catalog`. To be confirmed by reading `dashboard/app/controllers/` during Phase 3; until then we ship bundled JSON.
- Do we want the catalog to filter by age or just show everything? Defaulting to "everything" for the hackathon; a single sort toggle ("Ready offline" / "All") is the only filter.
- Music Lab as the second offline course: feasible? Depends on whether `@code-dot-org/music-lab` has any external sample-pack downloads. Decision deferred to Phase 4 audit; if it does, we ship AI for Oceans only.
- Brand/iconography for the PWA install: reuse code.org's existing favicon set or commission new mobile-optimized icons? Hackathon answer: reuse existing.
