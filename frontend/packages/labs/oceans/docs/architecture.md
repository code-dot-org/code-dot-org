# oceans-lab architecture

## Init sequence

```
initAll(options)
  ├─ set canvas dimensions (1024 × 576)
  ├─ soundLibrary.injectSoundAPIs(options)   ← registers play/register callbacks
  ├─ soundLibrary.loadSounds()               ← registers all MP3 assets
  ├─ I18n.initI18n(options.i18n)             ← compiles MessageFormat messages
  ├─ setInitialState({ currentMode: Loading, ...options })
  ├─ modeHelpers.toMode(Modes.Loading)       ← triggers models/loading.js:init()
  │     └─ loading.js: load fish data, init KNN/SVM trainer, initRenderer()
  │           └─ finishLoading → modeHelpers.toMode(Modes.Training | Words | ...)
  ├─ renderCanvas()                          ← self-perpetuating rAF loop
  └─ setSetStateCallback(renderUI)           ← React re-renders on every setState
```

## Studio registration

Registered as a lazy-loaded lab in `frontend/apps/studio`:

```ts
// src/modules/labs/config/labs.ts
export const AVAILABLE_LABS = ['music', 'oceans'] as const;

// src/modules/labs/router/getLabEntrypoint.ts
['oceans']: lazy(() => import('@code-dot-org/oceans-lab')),
```

Studio loads the default export (`OceansLab` component) and calls it with props
derived from level config (appMode, guides, tts, onContinue).

## Legacy apps/ consumer

`apps/src/fish/Fish.js` uses the named export:

```js
const {initAll} = require('@code-dot-org/oceans-lab');
initAll({ canvas, backgroundCanvas, appMode, ... });
```

The canvas elements and UI container are created by `Fish.js` (not by the component).
`apps/package.json` references the package as `link:../frontend/packages/labs/oceans`.

## Build output shape

```
dist/
  index.mjs          — ESM bundle (default + named exports)
  index.cjs          — CJS bundle (exports.default + exports.initAll)
  index.d.ts         — TypeScript declarations
  oceans-lab.css     — extracted CSS
  assets/
    models/
      model.json           — MobileNet feature extractor (TF SavedModel format)
      group1-shard1of1.bin — MobileNet weights
```

The `emitModelAssets` Rollup plugin in `vite.config.ts` emits the model files
with fixed (non-hashed) filenames so TFJS can resolve `group1-shard1of1.bin`
relative to `model.json` at runtime.

## State flow

```
setState(partial)
  └─ setStateInternal → state = {...state, ...partial}
        └─ setStateCallback()  ← registered by initAll as renderUI()
              └─ uiRoot.render(<UI />)
```

All subsystems read/write through `getState()` / `setState()`. No external store
or pub-sub — the state module is the single source of truth.

## Mode transitions

Each `Modes.*` integer maps to a model initialiser in `src/oceans/models/`:

| Mode                 | Model file   | Notes                                                     |
| -------------------- | ------------ | --------------------------------------------------------- |
| `Modes.Loading`      | `loading.js` | Fetches fish data, inits classifier, calls `initRenderer` |
| `Modes.Words`        | `words.js`   | Sets word-fish slots                                      |
| `Modes.Training`     | `train.js`   | Creates KNN or SVM trainer                                |
| `Modes.Predicting`   | `predict.js` | Calls `trainer.train()`, generates ocean                  |
| `Modes.Pond`         | `pond.js`    | Runs predictions, arranges fish                           |
| `Modes.Instructions` | _(none)_     | Pure UI mode                                              |
