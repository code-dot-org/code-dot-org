# oceans-lab architecture

## Init sequence

```
initAll(options)
  ├─ set canvas dimensions (1024 × 576)
  ├─ soundLibrary.injectSoundAPIs(options)   ← registers play/register callbacks
  ├─ soundLibrary.loadSounds()               ← registers all MP3 assets
  ├─ I18n.initI18n(options.i18n)             ← compiles MessageFormat messages
  ├─ setInitialState({ currentMode: Loading, ...options })
  ├─ modeHelpers.toMode(Modes.Loading)       ← triggers models/loading.ts:init()
  │     └─ loading.ts: load fish data, init KNN/SVM trainer, initRenderer()
  │           └─ finishLoading → modeHelpers.toMode(Modes.Training | Words | ...)
  ├─ renderCanvas()                          ← self-perpetuating rAF loop
  └─ setSetStateCallback(renderUI)           ← React re-renders on every setState
```

## Studio consumer

Registered as a lazy-loaded lab in `frontend/apps/studio`:

```ts
// src/modules/labs/config/labs.ts
export const AVAILABLE_LABS = ['music', 'oceans'] as const;

// src/modules/labs/router/getLabEntrypoint.ts
['oceans']: lazy(() => import('@/modules/labs/oceans')),
```

`src/modules/labs/oceans/index.tsx` is a thin Box wrapper that applies the
two CSS classes shipped from this package via `dist/oceans-lab.css`:

```tsx
<Box className="oceans-lab-shell">
  <Box className="oceans-lab-frame">
    <OceansLab />
  </Box>
</Box>
```

`.oceans-lab-shell` is the flex parent that paints the ocean-blue frame and
centres the lab. `.oceans-lab-frame` clamps width to a 16:9 box between
320 px and 1280 px using `min(100cqi, 100cqb*16/9, 1280px)`, with a
proportional `font-size` so Radium's %-relative inline styles render
identically to the curriculum path. `cqi`/`cqb` fall back to small
viewport units (`svw`/`svb`) when no ancestor sets `container-type`, so
no plumbing is required upstream.

The CSS is auto-imported by `src/index.ts` and bundled into
`dist/oceans-lab.css` by Vite's library mode.

## Legacy apps/ consumer

`apps/src/fish/Fish.js` still depends on the published npm package
`@code-dot-org/ml-activities` (`apps/package.json`). Migration to consume
this workspace via `"@code-dot-org/oceans-lab": "workspace:*"` is a
follow-up. When that lands, the consumer will use the named export:

```js
import {initAll} from '@code-dot-org/oceans-lab';
initAll({canvas, backgroundCanvas, appMode, ...});
```

The canvas elements and UI container are created by `Fish.js`; the
imperative API mounts a React UI into `#container-react`.

## Build output shape

```
dist/
  index.mjs          — ESM bundle (default + named exports)
  index.cjs          — CJS bundle (exports.default + exports.initAll)
  index.d.ts         — TypeScript declarations
  oceans-lab.css     — extracted CSS (sizing shell + frame, fade keyframes,
                       interaction styles)
  assets/
    models/
      model.json           — MobileNet feature extractor (TFJS LayersModel JSON)
      group1-shard1of1.bin — MobileNet weights
```

The `emitModelAssets` Rollup plugin in `vite.config.ts` emits the model
files with fixed (non-hashed) filenames so TFJS can resolve
`group1-shard1of1.bin` relative to `model.json` at runtime. The dev-mode
counterpart `devModelAssets` rewrites
`/src/oceans/assets/models/<file>` requests to `/src/oceans/<file>` so
the model loads without a build step.

## State flow

```
setState(partial)
  └─ setStateInternal → state = {...state, ...partial}
        └─ setStateCallback()  ← registered by initAll as renderUI()
              └─ uiRoot.render(<UI />)
```

All subsystems read/write through `getState()` / `setState()`. No external
store or pub-sub — `src/oceans/state.ts` is the single source of truth.
`setState(partial, {skipCallback: true})` mutates without a re-render
(used for transient timer / animation bookkeeping).

## Mode transitions

Each `Modes.*` integer maps to a model initialiser in `src/oceans/models/`:

| Mode                        | Model file   | Notes                                                      |
| --------------------------- | ------------ | ---------------------------------------------------------- |
| `Modes.Loading`             | `loading.ts` | Fetches fish data, inits classifier, calls `initRenderer`. |
| `Modes.IntermediateLoading` | `loading.ts` | Re-uses the loading scene during mid-flow transitions.     |
| `Modes.Words`               | `words.ts`   | Sets word-fish slots.                                      |
| `Modes.Training`            | `train.ts`   | Creates KNN or SVM trainer.                                |
| `Modes.Predicting`          | `predict.ts` | Calls `trainer.train()`, generates ocean.                  |
| `Modes.Pond`                | `pond.ts`    | Runs predictions, arranges fish.                           |
| `Modes.Instructions`        | _(none)_     | Pure UI mode; no model init.                               |

## Sound layer (legacy)

`src/oceans/Sound.ts` and `src/oceans/Sounds.ts` are the original 2019
SoundJS-shim modules retained verbatim from ml-activities, both flagged
with `// @ts-nocheck` and `/* eslint-disable */`. The `Sounds` class
wraps a Web-Audio playback path and is consumed by `App.tsx` (standalone
dev) and `apps/src/fish/Fish.js` (legacy consumer).

`src/oceans/models/soundLibrary.ts` is the lab's higher-level registry —
it imports each MP3 explicitly via `@/assets/sounds/<category>/<file>.mp3`
and delegates `register` / `play` to whatever `injectSoundAPIs` was
handed. Modernization of `Sound.ts` / `Sounds.ts` to a clean
`AudioContext` API is deferred to a follow-up PR.
