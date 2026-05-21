# Phase 0 Research: K-12 Notebook Lab

The spec arrived without `NEEDS CLARIFICATION` markers — the panel review and the open-question resolution closed them. Phase 0 research therefore focuses on **technology choices, integration patterns, and best practices** for each load-bearing decision the spec implies.

Each section follows the Decision / Rationale / Alternatives format.

---

## R-001 — Python runtime: Pyodide 0.27+

**Decision**: Pyodide 0.27 (or later, matching jupyter-k12's pinned version at port time) running in a dedicated Web Worker created with `type: 'module'`.

**Rationale**:
- Matches the jupyter-k12 implementation, so we inherit jupyter-k12's package-load patterns, `async_input` transform, and `python_reset_globals` script with minimal porting risk.
- Studio's existing pythonlab (`apps/src/pythonlab/pyodideWebWorker.ts`) is the only other in-repo Pyodide consumer; both packages can target the same Pyodide release line so QA tools (canary notebooks, package-load timing) carry across.
- Supports `setInterruptBuffer` for the FR-016 Stop control on devices with `SharedArrayBuffer`.
- Active upstream development; large package set (numpy, pandas, matplotlib, scikit-learn, sympy) covers the bundled-sample surface.

**Alternatives considered**:
- **CPython via WASI / pyodide-lite**: smaller bundle but excludes numpy/pandas which the samples depend on. Rejected.
- **Brython / Skulpt**: faster startup, but missing scientific-stack support and not what jupyter-k12 uses. Rejected.
- **A server-side kernel** (Jupyter server, in-house Python runner): violates SC-002 offline floor and FR-014 ("MUST run Python entirely on the learner's device"). Rejected.

---

## R-002 — Code editor: CodeMirror 6

**Decision**: CodeMirror 6 with `@codemirror/lang-python`, `@codemirror/view`, `@codemirror/state`, `@codemirror/commands`, and an autocomplete extension fed by parsed identifiers from the cell source plus the active Pyodide globals.

**Rationale**:
- Matches jupyter-k12; minimal porting risk for the editor surface.
- CM6 is the only editor in the modern React/TS world that handles RTL text correctly out of the box (Monaco's RTL story is notoriously broken).
- Modular package layout fits Vite tree-shaking and keeps the lab chunk below the FR-006-adjacent size target.
- Native touch support is acceptable for the phone-keyboard-friendly mode FR-007 requires; we layer a minimal "primary action bar" above the editor on touch input.

**Alternatives considered**:
- **Monaco**: heavier (~1.5 MB gzipped), poor RTL, geared toward IDE use; overkill for K-12 cells. Rejected.
- **Ace**: aging, fewer maintainers, no first-class TS types. Rejected.
- **A stripped textarea with manual syntax highlight**: dodges the bundle cost but loses bracket matching, autocomplete, and a usable selection model on mobile. Rejected — FR-007 mandates autocomplete.

---

## R-003 — Markdown renderer: marked + DOMPurify

**Decision**: `marked` 16+ configured with `breaks: true` and `gfm: true`, output passed through `DOMPurify` before insertion.

**Rationale**:
- Matches jupyter-k12 (`marked`); `DOMPurify` adds the FR-006 sanitization the spec calls for.
- Small footprint; well-maintained; no streaming requirement (notebook markdown is bounded).
- Both libraries are already common in the broader monorepo and unlikely to surprise reviewers.

**Alternatives considered**:
- **`react-markdown`**: idiomatic React API, but ~3× the bundle and introduces a tree-build step we don't need.
- **`micromark`**: more correct, more complex API, no clear pedagogical win.
- **`marked` without `DOMPurify`**: rejected outright — the spec sanitization requirement is non-negotiable.

---

## R-004 — IndexedDB wrapper: `idb`

**Decision**: Jake Archibald's `idb` library; one database `NotebookLabDB`, one object store `notebooks` keyed by a composite string `<sessionId>::<notebookId>`. Indexes on `sessionId` (for listing) and on `(sessionId, lastModified)` (for sort).

**Rationale**:
- Tiny (~1 KB gzipped), Promise-based, zero learning curve over raw IDB.
- The composite-key approach gives us FR-022 session scoping without storing a `sessionId` column we have to remember to filter on at every query — see Complexity Tracking in plan.md.
- Two-index design supports the Continue (recent) and Library (all) sections of US5 without scanning.

**Alternatives considered**:
- **Dexie**: full-featured ORM but ~10× the bundle and pulls in a query DSL we don't need.
- **localForage**: KV-only; loses the per-session listing efficiency.
- **Raw IDB**: workable but verbose; the cost of `idb` is negligible.

---

## R-005 — Service worker: `vite-plugin-pwa` with `generateSW`

**Decision**: Use the existing studio `vite-plugin-pwa` configuration with no architectural change. Register the SW through `virtual:pwa-register` in studio's existing `entrypoints/application.tsx` — that registration is already gated on `!Capacitor.isNativePlatform()`. Add the lab chunk and the Pyodide bootstrap (`pyodide.mjs`, the wasm/data files) to the precache glob.

**Rationale**:
- Studio's PWA story is already shipped; the lab does not need its own SW, manifest, or registration code.
- Precaching only the shell + Pyodide bootstrap (≤ ~10 MB total compressed) keeps install size predictable. Runtime caching (NetworkFirst with a 7-day fallback) covers `?github=` and "Import from URL" payloads per FR-026.
- `generateSW` (Workbox-generated) is appropriate; no custom SW logic is required for v1.

**Alternatives considered**:
- **A dedicated lab SW with `injectManifest`**: more flexible but introduces two SWs on the page, which the spec correctly forbids by inheriting studio's gate.
- **No SW; rely on HTTP cache**: fails SC-002 offline floor.

---

## R-006 — Routing: TanStack Router + lab registry

**Decision**: Add `notebook` to `frontend/apps/studio/src/config/labs.ts` `AVAILABLE_LABS`; extend `frontend/apps/studio/src/router/getLabEntrypoint.ts` to lazy-load `@code-dot-org/notebook-lab`; create one route file `frontend/apps/studio/src/routes/projects/notebook/$channelId/edit.tsx` that mounts the lab's root component. The lab owns its own internal navigation (index / open-notebook / settings) via React state, not via additional studio routes.

**Rationale**:
- Mirrors the existing music-lab and oceans-lab integration pattern; reviewers find what they expect.
- Avoids generating new top-level routes for index/settings (FR-040) — the bottom-nav is internal to the lab and so are the views it switches between.
- Keeps the auto-generated `routeTree.gen.ts` change minimal (one new route file).
- The `channelId` segment carries either `default` (welcome/index) or a notebook UUID, so the same URL shape supports both the cold-open (US1) and the deep link.

**Alternatives considered**:
- **Three studio routes (`/notebook/index`, `/notebook/:id/edit`, `/notebook/settings`)**: bloats studio's route tree for a lab-internal concern.
- **Use HashRouter inside the lab**: jupyter-k12 used hash routing because it ships as a Vue SPA at the repo root; we have TanStack Router available and should not introduce a second routing system.

---

## R-007 — Session model and shared-device isolation

**Decision**: A lightweight "session" entity stored in Capacitor Preferences (native) or `localStorage` (web), behind a single `prefsStore` abstraction. Active session id (a UUID, never the human-readable label) namespaces every IndexedDB key. Session catalog (label, created-at, last-active-at, session-id) is a JSON blob in the prefs store. Idle timeout default 20 minutes (configurable per FR-022a). On timeout, the session id is cleared from memory but the catalog persists so the learner can re-enter.

**Rationale**:
- Solves the highest-impact silent-failure mode the EdTech panel identified.
- Capacitor's WKWebView evicts `localStorage` aggressively; the native preference store is durable. This split is already established in the studio mobile guidance.
- A UUID under the human label keeps the label out of every storage key and out of any URL.
- Treating labels as PII in telemetry (FR-043, FR-045) requires no special handling in the prefs store since the prefs store doesn't speak to telemetry.

**Alternatives considered**:
- **No session model, accept the silent-overwrite risk**: rejected after the panel review.
- **Persist sessions in IndexedDB itself**: works but couples the catalog to the same store the notebooks live in; the catalog should survive `clear notebooks` (rare, but a developer reset path).
- **Account-bound sessions**: out of scope; v1 is explicitly accountless.

---

## R-008 — i18n and RTL

**Decision**: Reuse the `StringsProvider` / `useString(key)` pattern from `frontend/apps/studio/src/modules/ai-decisions-mobile/i18n/StringsProvider.tsx`. JSON bundles per locale at `frontend/packages/labs/notebook-lab/src/i18n/labels/<group>.<locale>.json`. Active locale and `<html dir>` flip live in a top-of-lab effect. Bundle metadata (native + English name, direction) lives in `localeMeta.ts`.

**Rationale**:
- Matches an existing modern studio pattern reviewers already understand; no new i18n library introduced (Constitution XII simplicity).
- JSON bundles load eagerly only for the active locale, fall back to `en-US`, then to the default value (FR-035 chain).
- RTL is a styling concern handled by CdoTheme + MUI's RTL helpers, gated on `localeMeta[locale].direction === 'rtl'`.

**Alternatives considered**:
- **react-intl**: heavier, ICU-message-aware (which we do not need for v1), and not what studio's existing modern surfaces use.
- **i18next**: same objection plus a runtime config layer we have no use for.

---

## R-009 — Video cell embedding strategy

**Decision**: YouTube and Vimeo via iframe embed; direct media (`.mp4`/`.webm`) via `video.js`. On Capacitor or where the iframe fails to load within 2 s, swap to a "Watch on YouTube" / "Watch on Vimeo" button that opens via `@capacitor/browser` on native and `window.open` on web.

**Rationale**:
- Matches jupyter-k12's `VideoCell.vue` behavior verbatim, including the 2 s timeout heuristic.
- `@capacitor/browser` opens the system browser without leaving the app, which mitigates the student panel's "once I leave the app I'm on TikTok in 90 seconds" concern.
- `video.js` handles the playback-rate UI (0.5–2.0×) FR-011 requires; rolling our own would be unnecessary complexity.

**Alternatives considered**:
- **Native HTML5 `<video>` only**: loses playback-rate UI on iOS and is ugly on Android.
- **No iframe embeds, link out always**: loses the in-flow learning experience.

---

## R-010 — Completion-artifact QR encoding

**Decision**: Encode the artifact as a same-origin URL fragment (`#artifact=<base64url(zlib(json))>`) and render it as a QR code via the `qrcode` library. The teacher scans the QR, opens the URL on their device, the lab boots into a read-only "Artifact view" route that decodes the fragment and renders the same printable summary.

**Rationale**:
- FR-047 mandates no network round-trip; URL fragments never reach a server.
- Same origin means the lab's existing service worker can serve the artifact-view route offline on the teacher's device too (if they have the app installed).
- Base64url + zlib keeps the QR scannable at v1 sizes (artifact payload is small; cell counts and one-line outputs).
- Truncate outputs in the artifact to a hard cap (e.g., 400 chars per cell) to keep QR density manageable.

**Alternatives considered**:
- **Encode the artifact as JSON in the QR directly (no compression)**: QR density quickly overflows scannable sizes.
- **Upload to a code.org-hosted artifact URL**: violates "no server round-trip" and introduces retention/deletion policy questions we do not want to answer in v1.
- **Encode as a download URL the teacher pulls**: requires the teacher's device to fetch from our origin while connected to school wifi; the spec's offline ethic does not demand a server round-trip here.

---

## R-011 — Join-code resolution

**Decision**: Reuse the project's existing short-link / redirector service via `@code-dot-org/core` API client. The lab does not own the resolver — it consumes it. Codes resolve to a public URL (typically raw.githubusercontent.com after we apply the FR-029 rewrite). If no redirector exists at v1 ship time, the lab falls back to a `code.org/go/<code>` URL pattern that 302s to the GitHub raw URL.

**Rationale**:
- Constitution XI requires API calls through `@code-dot-org/core`; this is the one external touchpoint in v1.
- Keeping resolver ownership outside the lab means we do not block on a back-end deliverable to ship v1 — falling back to a documented URL pattern is acceptable, and platform can swap in the redirector later without lab changes.

**Alternatives considered**:
- **Lab-owned resolver running on the device** (codes baked into the lab bundle): would force a lab redeploy for every new teacher code. Rejected.
- **Skip join codes; mandate full URL paste**: rejected by the EdTech panel.

---

## R-012 — Sample seeding and the seed version stamp

**Decision**: Ship the 18 sample `.ipynb` files as static assets in the lab package's `samples/` directory. A `samples/index.json` manifest enumerates filename, target unit (`metadata.folder`), author, and seed-version stamp. On first lab launch under a new session, the seeder reads the manifest, loads each `.ipynb`, assigns a UUID, applies the manifest's unit assignment, and writes to IndexedDB. The per-session seed-version key (`seedVersion:<sessionId>`) records which build last seeded; later builds with a higher version re-seed but only for samples whose own per-sample version stamp incremented (so learner-modified samples never get clobbered — the writer compares a content hash and skips if the learner's record differs from the original).

**Rationale**:
- Idempotency + non-destructive updates are FR-024's hard contracts.
- Manifest-driven seeding lets curriculum content evolve without code changes.

**Alternatives considered**:
- **Single per-session "seeded yes/no" boolean**: simpler but blocks future content updates from reaching existing sessions.
- **Re-seed on every launch**: would destroy learner edits.

---

## R-013 — Telemetry hygiene

**Decision**: Telemetry events emitted by the lab (cell-run-started, cell-run-completed, error-encountered, lesson-completed, sample-seeded) carry only structural metadata (cell type, notebook id hash, error class, lesson id, sample id, duration ms). Free-text fields (session label, cell source, output text, learner-supplied URLs) MUST be filtered at the emit boundary by a thin telemetry wrapper that whitelists keys. The wrapper lives inside the lab package and uses `@code-dot-org/core/plugins/observability` for transport.

**Rationale**:
- Constitution II + FR-043/044 require this stance; a whitelist filter is the only safe pattern (denylists are bug magnets).
- A thin lab-local wrapper keeps the rule auditable in one file.

**Alternatives considered**:
- **Inline telemetry calls scattered through the lab**: rejected — any developer adding a new field would have to remember the rule.

---

## R-014 — Native vs. web build modes

**Decision**: Honor studio's existing `CAPACITOR_BUILD=1 vite build --base=./` path documented in `frontend/apps/studio/AGENTS.md`. The lab does not introduce a third build mode; native vs. web differences (service worker gate, asset path strategy, system-browser fallback) are runtime detected via `Capacitor.isNativePlatform()` not build-flag-detected.

**Rationale**:
- One build artifact, two runtime modes — the existing studio model. Reduces test-matrix complexity.

**Alternatives considered**:
- **A lab-specific build flag for "pre-bundled Pyodide" mode**: tempting (FR-014 wants this), but doable via runtime asset path probing — the Pyodide loader tries the bundled path first, falls back to a CDN-style fetch with SW caching. Rejected adding a new build flag.

---

## R-015 — Accessibility specifics (FR-038a)

**Decision**:
- **Read-aloud**: `window.speechSynthesis` on web; on iOS the Capacitor `@capacitor-community/text-to-speech` plugin is already wired into the mobile shell — use it. On Android use the same plugin (it shims both).
- **OpenDyslexic**: bundle the font (~110 KB woff2) inside the lab; activate via a `data-font="opendyslexic"` attribute toggled at the lab root.
- **Line spacing**: a CSS variable `--cdo-nblab-line-spacing` set on the lab root; applied to markdown cells and the editor (CM6 `line-height` decoration).
- **Focus mode**: a state flag on the renderer that dims (opacity 0.35) all non-active cells; activated via a settings toggle and via a keyboard shortcut.

**Rationale**:
- All four are device-local, free, no telemetry, no network.
- Bundling OpenDyslexic costs us 110 KB but is the right call — a learner on a school network should not need to fetch a font.

**Alternatives considered**:
- **Tie read-aloud to a third-party TTS service**: introduces a network dependency and an off-device data flow we have explicitly forbidden.
- **Skip OpenDyslexic; rely on system font controls**: would not actually help — system fonts don't include OpenDyslexic.

---

## R-016 — Cell-level testing strategy

**Decision**: Vitest + RTL for cells, hooks, and stores. The Pyodide worker is mocked by default via a `mockRuntime` that fulfills the worker contract synchronously; a separate integration suite spins up the real worker in a Node worker thread and runs a small canary notebook. CodeMirror is rendered into a JSDOM container; we test rendered HTML and editor-doc state, not pixel positioning. Accessibility is checked with `@testing-library/jest-dom` and axe-style assertions for color-contrast on a sampled set of components.

**Rationale**:
- Mirrors studio's testing posture. No new framework.
- The mock-runtime pattern is what jupyter-k12 lacks (it has no tests); we add it because the worker contract is the most leak-prone surface in the design.

**Alternatives considered**:
- **Full Playwright e2e**: too heavy for v1; studio currently has no Playwright harness and bringing one up is out of scope for this spec.
- **Skip integration test of the real worker**: would let worker-contract regressions slip through silently.

---

## Summary table

| ID | Decision | Bundle impact (rough, gzipped) |
|---|---|---|
| R-001 | Pyodide 0.27 in Web Worker | ~4-8 MB (boot only; cached by SW after first online use) |
| R-002 | CodeMirror 6 + lang-python | ~120 KB (in the lab chunk) |
| R-003 | marked + DOMPurify | ~25 KB |
| R-004 | `idb` | ~1 KB |
| R-005 | Existing studio `vite-plugin-pwa` (no new SW) | 0 |
| R-006 | TanStack Router + AVAILABLE_LABS | 0 (existing infra) |
| R-007 | Session model | ~3 KB (the prefs/catalog code) |
| R-008 | StringsProvider pattern | 0 (existing infra) |
| R-009 | video.js + iframe | ~85 KB (lazy; only loaded when a video cell renders) |
| R-010 | `qrcode` + zlib for artifact | ~30 KB (lazy) |
| R-011 | Join-code resolver via core API client | 0 (existing infra) |
| R-012 | Sample manifest seeding | ~5 KB (seeder code) + .ipynb static assets (TBD) |
| R-013 | Telemetry whitelist wrapper | ~1 KB |
| R-014 | Single build, runtime gate | 0 |
| R-015 | A11y settings (incl. OpenDyslexic font) | ~110 KB (font) + ~3 KB (logic) |
| R-016 | Vitest + RTL + mock runtime | 0 (dev-only) |

Lab chunk budget (excl. Pyodide, video.js, QR, OpenDyslexic font) lands around 200-250 KB gzipped, comfortably under the 350 KB target in plan.md.
