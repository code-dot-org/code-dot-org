# Quickstart: K-12 Notebook Lab

How to bootstrap, run, and validate the lab end-to-end.

## Prerequisites

- Node 20+, Yarn 4 via Corepack (`corepack enable`).
- A working `frontend/` Turborepo install (`cd frontend && yarn install`).
- Studio dev server runnable per `frontend/apps/studio/README.md`.
- For native build: Xcode 15+ (iOS) and/or Android Studio Koala+ (Android).

## First-time package bootstrap

```bash
cd frontend
# Scaffold the lab package (per the structure block in plan.md).
mkdir -p packages/labs/notebook-lab/src
# Create package.json, tsconfig.json, turbo.json, vitest.config.ts using
# the patterns in packages/labs/music-lab as a reference (do not copy verbatim —
# audit deps against research.md).

yarn workspace @code-dot-org/notebook-lab add \
  react react-dom @mui/material @emotion/react @emotion/styled \
  @code-dot-org/component-library @code-dot-org/core \
  @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/lang-python \
  marked dompurify idb qrcode pako video.js

yarn workspace @code-dot-org/notebook-lab add --dev \
  vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom \
  @types/dompurify @types/qrcode

# Wire into studio:
yarn workspace @code-dot-org/studio add @code-dot-org/notebook-lab
```

Edit `frontend/apps/studio/src/config/labs.ts` and `frontend/apps/studio/src/router/getLabEntrypoint.ts` per `contracts/lab-registry.md`.

Drop the route file `frontend/apps/studio/src/routes/projects/notebook/$channelId/edit.tsx` per `contracts/lab-registry.md`. TanStack Router regenerates `routeTree.gen.ts` automatically on the next dev or build.

## Pyodide assets

Pyodide binaries are not committed.

```bash
cd frontend/packages/labs/notebook-lab
./scripts/download-pyodide.sh   # committed script; pulls into public/pyodide/
```

`.gitignore` excludes `public/pyodide/*` except the download script and a `version.txt` stamp that lock the version we ship against.

## Run the dev loop

```bash
# In one shell: studio web dev server (uses Rails by default; pass FRONTEND_ONLY for the standalone server)
cd frontend
yarn workspace @code-dot-org/studio dev
# → http://localhost:3036/app

# In another shell: keep the lab in watch mode for fast feedback
yarn workspace @code-dot-org/notebook-lab dev
```

Open `http://localhost:3036/app/projects/notebook/default/edit` to land on the welcome notebook (US1).

## Tests

```bash
# All unit tests for the lab
yarn workspace @code-dot-org/notebook-lab test

# Watch
yarn workspace @code-dot-org/notebook-lab test --watch

# A single file
yarn workspace @code-dot-org/notebook-lab test src/cells/code/parameterParser.test.ts

# Typecheck (CI-mandatory)
yarn workspace @code-dot-org/notebook-lab typecheck

# Lint changed files (run from repo root)
./tools/hooks/pre-commit
```

## Manual end-to-end checks

These are the SC verifications. Run them at least once on a real mid-range device before requesting review.

### 1. First-success in 60 s (SC-001)

1. Fresh install (clear site data / uninstall app).
2. Open the lab cold.
3. Tap the session picker, type a name, tap "Start."
4. Welcome notebook should be focused on its first runnable cell.
5. Tap "Try it." A result should render in under ten seconds.

Expected: from app launch to first result, under sixty seconds, three taps.

### 2. Offline floor (SC-002)

1. Complete one online launch (so the SW caches).
2. Enable airplane mode.
3. Force-quit, relaunch.
4. Open each bundled sample. Edit a cell. Wait three seconds. Force-quit. Relaunch.
5. Confirm the edit persists.

### 3. Per-device cold-cache import (SC-003)

1. Fresh device, cleared cache, on typical school-grade network.
2. Tap "Enter a code" or open a `?github=…` URL.
3. Time from tap to notebook open.

Expected: under thirty seconds.

### 4. Recoverable interruption (SC-004)

1. Open a code cell. Replace its source with `while True: pass`.
2. Tap "Try it."
3. Tap "Stop."

Expected on a device with `SharedArrayBuffer`: lab returns to interactive within one second; cell shows an interrupted-state empathy card. On a device without it: the lab terminates the worker, surfaces a banner, returns to interactive.

### 5. Live localization (SC-005)

1. Open any notebook.
2. Go to Settings → Language. Pick Hindi.
3. Return.

Expected: all chrome text changes within one second. No route reload. RTL chrome flips when Farsi is chosen.

### 6. PWA quality (SC-006)

```bash
# Build studio for the PWA target
yarn workspace @code-dot-org/studio build

# Serve the build (or use Rails preview)
yarn workspace @code-dot-org/studio preview
```

Run Lighthouse against `/app/projects/notebook/default/edit`. PWA score must meet the project's standard threshold.

### 7. Index first paint (SC-007)

Profile cold launch on a mid-range Android. The index FMP must be under two seconds.

### 8. Telemetry hygiene (SC-008)

```bash
# Run the lab with the observability plugin in capture-to-console mode
NBLAB_TELEMETRY_DEBUG=1 yarn workspace @code-dot-org/studio dev
```

Trigger every telemetry path (cell run, error, lesson complete, artifact share, session create). Inspect the captured payloads — they must NOT contain any cell source the learner typed, any session label, any URL the learner supplied, or any API key.

### 9. Accessibility coverage (SC-009)

```bash
# Component a11y sweeps
yarn workspace @code-dot-org/notebook-lab test --grep a11y

# Manual checks
# - Tab through every reachable surface.
# - Verify color contrast in both themes via Chrome DevTools Lighthouse.
# - Enable OS-level reduced motion; confirm the success beat and lesson-complete do not animate.
# - Toggle each FR-038a setting (read-aloud, OpenDyslexic, line spacing, focus mode) and verify visible effect.
```

### 10. Classroom-scale runtime acquisition (SC-010)

Lab/test deployment: deploy to a staging environment served from a network you can throttle.

1. Configure 30 device emulators (or real devices) with cold cache.
2. Open the lab on all 30 simultaneously.
3. Time to "runnable" (first cell can be executed) per device.

Expected (with IT pre-cache applied): under one class period for the slowest device. Without pre-cache, the lab must show a localized progress/queue state, not appear to hang.

### 11. Lesson completion (SC-011)

1. Open a bundled sample with N runnable cells.
2. Run every cell at least once.
3. Confirm the lesson-complete surface appears with the goal echoed and a Next-lesson CTA when one exists in the unit.

### 12. Error recovery (SC-012)

1. In a code cell, type `print(undefined_name)`.
2. Tap "Try it."
3. Confirm: empathy card with plain-English summary, offending line highlighted, "Show details" disclosure with the traceback, single "Try again" action.
4. Edit to `print('hello')`. Tap "Try again." Confirm success.

### 13. Shared-device isolation (SC-013)

1. Create session "Maya." Edit a notebook. Sign out.
2. Create session "Alex." Confirm Alex sees only bundled samples in pristine state.
3. Switch back to "Maya." Confirm edits intact.

### 14. Teacher artifact (SC-014)

1. Open a notebook, work through some cells.
2. Tap "Share with teacher."
3. Confirm PDF print works on web; file save works on native.
4. Generate the QR. Scan with a separate device. Confirm the same artifact renders without a network call.

## Mobile shell

```bash
# Build studio for Capacitor
yarn workspace @code-dot-org/studio build:mobile

# Sync into the native shells
yarn workspace @code-dot-org/mobile sync

# Run on simulator
yarn workspace @code-dot-org/mobile ios       # iOS Simulator
yarn workspace @code-dot-org/mobile android   # Android Emulator
```

If `cap sync` rejects the `@capacitor/browser` plugin: confirm it is in `capacitor.config.ts` `includePlugins` and a workspace dep of `@code-dot-org/mobile`.

## Pre-commit before any PR

```bash
./tools/hooks/pre-commit       # lints only files you changed; the standard quick check
yarn workspace @code-dot-org/notebook-lab typecheck
yarn workspace @code-dot-org/notebook-lab test
```

## Common pitfalls

- **SW intercepts the Capacitor bridge** → confirm the SW registration is gated on `!Capacitor.isNativePlatform()` in `frontend/apps/studio/entrypoints/application.tsx`. Do not add a second SW from inside the lab.
- **Pyodide refuses to start with COOP/COEP errors** → confirm the studio app's Rails response sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` on the `/app/...` routes. The lab cannot set these from the client.
- **Auto-generated `routeTree.gen.ts` looks wrong after adding the route file** → restart the dev server. TanStack regenerates on dev startup; mid-run edits sometimes need a restart.
- **CodeMirror disappears in tests** → JSDOM lacks Range/Selection bits CM6 expects. Use the harness in `src/cells/code/__tests__/setup.ts` (mirrors what music-lab does) before any test that mounts the editor.
