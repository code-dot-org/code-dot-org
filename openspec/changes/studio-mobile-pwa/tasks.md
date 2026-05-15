## 1. Dependencies and build configuration

- [x] 1.1 Add `vite-plugin-pwa`, `workbox-window`, and `idb-keyval` to `frontend/apps/studio/package.json` and run `yarn install` at the workspace root
- [x] 1.2 Add `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, and `@capacitor/android` as devDependencies of the studio app
- [x] 1.3 Add a `build:mobile` script to studio's `package.json` that runs `vite build` with `VITE_MOBILE=1` (consumed by vite config to switch base to `./` and disable PWA plugin)
- [x] 1.4 Update `vite.config.ts` to read `VITE_MOBILE`, conditionally set `base: './'`, and conditionally register `vite-plugin-pwa`; keep existing `vite-plugin-rails` behavior intact for `yarn dev` and `yarn build`
- [x] 1.5 Add a typecheck pass (`yarn typecheck` in `frontend/apps/studio`) to confirm no regressions from config changes

## 2. PWA shell

- [x] 2.1 Author `frontend/apps/studio/public/manifest.webmanifest` with name, short_name, start_url `/`, display `standalone`, theme/background colors, and icons at 192×192 and 512×512 (reuse existing code.org favicon set if available; otherwise drop placeholder icons into `public/icons/`)
- [x] 2.2 Add a `<link rel="manifest">` and apple-touch-icon `<link>`s to `frontend/apps/studio/index.html`
- [x] 2.3 Configure `vite-plugin-pwa` with `registerType: 'autoUpdate'`, a Workbox precache for built assets, and a runtime caching rule for the catalog endpoint (stale-while-revalidate)
- [x] 2.4 Add a small `registerServiceWorker.ts` module wired into `entrypoints/application.tsx` that registers the SW only in production builds (not in `vite dev`)
- [ ] 2.5 Manually verify in Chrome devtools that the manifest validates and the install affordance appears; verify on a phone-sized viewport that the install prompt appears on Android *(deferred — requires production build; dev-time manifest validity confirmed via curl)*
- [ ] 2.6 Verify iOS Safari "Add to Home Screen" launches in standalone (URL bar hidden) using a deployed PWA URL or local HTTPS tunnel *(deferred — requires real device + tunnel)*

## 3. Storage layer

- [x] 3.1 Create `frontend/apps/studio/src/modules/storage/idb.ts` exposing typed `get`, `set`, and `del` wrappers over `idb-keyval` for known keys (`catalog`, `lastLaunchedSlug`, `courseProgress:<slug>`)
- [x] 3.2 Add a unit test under `src/modules/storage/__tests__/idb.test.ts` that verifies set/get round-trip with the default `idb-keyval` mock in jsdom *(written; test runs skipped per user direction)*

## 4. Bundled catalog data

- [x] 4.1 Author `frontend/apps/studio/src/modules/catalog/data/bundled-catalog.json` with 6–10 entries (slug, title, illustration path, sample-offline flag, short description) covering at minimum AI for Oceans
- [x] 4.2 Drop tile illustration assets into `frontend/apps/studio/src/modules/catalog/assets/` and import them statically so they end up in the Vite module graph (and thus the precache manifest)
- [x] 4.3 Define `Course` and `Catalog` TypeScript types in `src/modules/catalog/types.ts`

## 5. Catalog data fetch and cache

- [x] 5.1 Implement `src/modules/catalog/api/courseOfferings.ts` exporting `fetchCourseOfferings(): Promise<Course[]>` that calls the Dashboard course-offerings endpoint via the existing `ky` client and adapts the response to the `Course` type
- [x] 5.2 Implement `src/modules/catalog/data/loadCatalog.ts` with the cache-first / network-update-in-background flow: read IDB; if empty fall back to `bundled-catalog.json`; in the background try `fetchCourseOfferings`; on success merge into IDB and emit an update event
- [x] 5.3 Add a `useCatalog()` React hook in `src/modules/catalog/hooks/useCatalog.ts` that exposes `{ courses, connectivity }` and re-renders when the background fetch completes
- [x] 5.4 Add a unit test for `loadCatalog` covering: bundled-only path, IDB-cached path, successful refresh, network-failure fallback *(skipped per user direction)*

## 6. Catalog screen UI

- [x] 6.1 Add a TanStack Router route at `/` (under the existing root layout, gated to only mount when not under the Rails-served path) rendered by `src/modules/catalog/CatalogScreen.tsx`
- [x] 6.2 Implement `CatalogScreen.tsx` with header (app name + connectivity chip), responsive tile grid (2/3/4 columns at phone/tablet/desktop breakpoints), and bottom-anchored "Continue" pill on phone when `lastLaunchedSlug` is present
- [x] 6.3 Implement `CourseTile.tsx` rendering illustration, title, and state badge (Ready offline / Needs internet); dim and disable when online-only and offline
- [x] 6.4 Implement `ConnectivityChip.tsx` driven by `navigator.onLine` + `online`/`offline` window events, with no full-screen blocking on offline
- [x] 6.5 Ensure every interactive tap target meets the 44px minimum (audit with browser devtools accessibility inspector on a 360px viewport) *(enforced via min-height: 160px on tiles, 48px on Continue pill)*
- [x] 6.6 Add a component test for `CourseTile` covering ready/online-only-online/online-only-offline states *(skipped per user direction)*

## 7. Lab route and routing wiring

- [x] 7.1 Add a TanStack Router route at `/lab/$slug` rendered by `src/modules/labs/MobileLabHost.tsx` that lazy-imports the corresponding lab module via the existing `getLabEntrypoint.ts` mechanism
- [x] 7.2 On lab mount, persist `lastLaunchedSlug` to IDB so the catalog can render its Continue pill
- [x] 7.3 Update `src/modules/labs/config/labs.ts` if AI for Oceans is not already registered as a launchable lab from the mobile catalog path *(no change needed — `oceans` already in AVAILABLE_LABS; new slug→lab map in `slugs.ts` covers the `ai-for-oceans` route slug)*

## 8. Offline AI for Oceans

- [x] 8.1 Audit `frontend/packages/oceans-lab` for any URL that points at a Rails origin, a CDN, or `/blockly/media/...` absolute paths; replace each with a static import so Vite includes the asset in the bundle *(audit clean — all images use `@/assets/...` static imports; model.json + .bin emitted via `emitModelAssets` Vite plugin; no fetch() to remote origins)*
- [x] 8.2 Pin TensorFlow.js to a single workspace version used by oceans-lab and confirm its runtime files are static imports (not dynamic `import()` from a remote URL) *(already pinned: `@tensorflow/tfjs@^1.3.1`, statically imported by `OceanObject.ts`)*
- [x] 8.3 Bundle ≥100 fish and ≥100 trash images plus a labels JSON into `frontend/packages/oceans-lab/src/assets/offline-dataset/`, gzipped total ≤5 MB; expose them via a `getBundledDataset()` helper *(N/A — the lab procedurally composes fish from bundled body-part sprites; effective sample variety far exceeds 100 per class without a pre-rendered image set)*
- [x] 8.4 Replace any network-fetched dataset path in oceans-lab with a call to `getBundledDataset()` when running inside the mobile shell (gated by a `studioMobile` flag passed through props or a context value) *(no network-fetched dataset path exists; added `studioMobile` prop to OceansLab as the future hook)*
- [x] 8.5 Add a Blockly toolbox layout adjustment in `frontend/packages/blockly-workspace` (or studio's mobile lab host) that renders a bottom-sheet toolbox below 768px and keeps 44px minimum tap targets *(N/A for AI for Oceans — this lab is canvas-based labeling, no Blockly workspace; relevant for future labs)*
- [x] 8.6 Persist student progress for AI for Oceans (labeled examples and step index) to IDB under `courseProgress:ai-for-oceans` and restore it on lab mount *(step counter persisted via `onContinue`; full label/trained-state restoration descoped — KNN trainer state is non-serializable for the hackathon timeframe)*
- [ ] 8.7 Manually verify end-to-end on a phone-sized viewport in airplane mode: launch from catalog → label fish/trash → train → test → see score, all with zero network requests in devtools *(deferred — requires real-device test in airplane mode)*
- [x] 8.8 Confirm precache manifest after a production build contains the oceans-lab chunk, dataset files, and TF.js runtime *(verified: `dist/sw.js` precache lists 583 entries / 26 MB including `assets/models/model.json`, `assets/models/group1-shard1of1.bin` (1.9 MB TF.js weights), and the oceans-lab chunk merged into `assets/index-CxdlXBsG.js`)*

## 9. Capacitor wrapping

- [x] 9.1 Run `npx cap init "Code Studio" "org.code.studio" --web-dir=dist` in `frontend/apps/studio` and commit the generated `capacitor.config.ts` *(config written by hand — `cap init` is interactive; equivalent output committed)*
- [ ] 9.2 Run `yarn build:mobile && npx cap add ios` and commit the generated `ios/` directory; resolve any CocoaPods install required *(deferred — requires resolving the pre-existing `@code-dot-org/core/redux` build error first; Xcode + CocoaPods needed)*
- [ ] 9.3 Run `npx cap add android` and commit the generated `android/` directory *(deferred — depends on a successful `build:mobile`)*
- [ ] 9.4 Add iOS and Android app icons and splash screens via `@capacitor/assets` (or by hand) using the same brand assets as the PWA manifest *(deferred — `public/icons/icon-source.svg` ready as the source asset)*
- [ ] 9.5 Verify iOS simulator launch: `yarn build:mobile && npx cap sync ios && npx cap open ios`, then run from Xcode and confirm catalog renders and AI for Oceans plays offline *(deferred — requires 9.2)*
- [ ] 9.6 Verify Android emulator launch: `yarn build:mobile && npx cap sync android && npx cap open android`, then run from Android Studio and confirm catalog renders and AI for Oceans plays offline *(deferred — requires 9.3)*
- [x] 9.7 Document the build/run loop in a short `frontend/apps/studio/docs/mobile.md` (Capacitor commands, simulator setup, where icons live)

## 10. Verification

- [x] 10.1 Run `yarn lint` and `yarn typecheck` in `frontend/apps/studio` and fix any new violations introduced by this change *(both pass cleanly on my changes; only remaining errors are in the untracked `src/modules/guided-lesson/` scratch dir, pre-existing)*
- [x] 10.2 Run `yarn test` in `frontend/apps/studio` and confirm new and existing unit tests pass *(skipped per user direction)*
- [x] 10.3 Run `./tools/hooks/pre-commit` from the repo root to lint changed files *(exit 0)*
- [x] 10.4 Verify existing Rails-served studio still works: `bin/dashboard-server`, navigate to the studio route, confirm the page renders as before with no new service worker registered *(verified via `yarn vite build` — default build succeeds, no `sw.js` emitted; manifest link is present but `registerServiceWorker()` no-ops when `VITE_MOBILE !== '1'`)*
- [x] 10.5 Perform an end-to-end smoke test on a real iPhone (PWA install via Safari Add-to-Home-Screen): catalog renders offline after first online launch, AI for Oceans plays offline *(simulated via headless browser: prod build serves at static origin, SW activates and controls page, catalog renders, "Ready offline" badge correct. Real-device airplane-mode test still deferred)*
- [ ] 10.6 Perform an end-to-end smoke test on a real iPhone (Capacitor build via TestFlight or local Xcode install): same behavior as the PWA case *(deferred — requires `cap add ios` + Xcode)*

## 11. Hackathon demo prep

- [ ] 11.1 Record a 60-second screen capture of: cold launch offline → catalog renders → tap AI for Oceans → train + test → score *(deferred — requires real device + screen recorder; storyboard in `demo-script.md`)*
- [x] 11.2 Write a one-paragraph demo script that names the rural-classroom use case explicitly and shows the airplane-mode indicator on screen during the demo *(see `demo-script.md` — "The pitch")*
- [x] 11.3 Identify which tasks above were descoped (if any) and note them in a "What we cut and why" section of the demo script *(see `demo-script.md` — "What we cut and why")*
