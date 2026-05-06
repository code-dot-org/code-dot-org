# AI for Oceans (`@code-dot-org/oceans-lab`)

Code.org's AI for Oceans interactive lab, published as an internal Turborepo
package for use by `apps/` (legacy webpack consumer) and `frontend/apps/studio`
(Vite/TanStack consumer).

Produced for the Hour of Code in 2019. The lab delivers 5 interactive levels in
the **AI for Oceans** script at https://studio.code.org/s/oceans.

---

## API surface

### React component (default export)

```tsx
import OceansLab from '@code-dot-org/oceans-lab';

<OceansLab
  appMode="fishvtrash" // one of the AppMode values
  guides="K5" // optional guide-sequence key
  textToSpeechLocale="en" // optional BCP-47 locale
  onContinue={() => nextLevel()} // called when the user advances
/>;
```

The component mounts two `<canvas>` elements and calls `initAll` imperatively.
Consumers own the layout; the lab renders at a fixed 1024×576 internal resolution
and scales via CSS.

### Imperative API (named export)

```ts
import {initAll} from '@code-dot-org/oceans-lab';

initAll({
  canvas,
  backgroundCanvas,
  appMode,
  guides,
  textToSpeechLocale,
  onContinue,
  playSound,
  registerSound,
});
```

Used by the legacy `apps/src/fish/Fish.js` consumer. The imperative API renders
its own React UI into `#container-react`; callers must provide the canvas
elements.

---

## App modes

| `appMode` value       | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `fishvtrash`          | Train AI to distinguish fish from trash using KNN/MobileNet. |
| `creaturesvtrashdemo` | Demo: pre-trained fish classifier encounters sea creatures.  |
| `creaturesvtrash`     | Train AI on fish, sea creatures, and trash.                  |
| `short`               | Train SVM on 6 adjective categories.                         |
| `long`                | Train SVM on 15 adjective categories.                        |

---

## Development

### Standalone dev server

```bash
cd frontend/
yarn install
yarn dev --filter=@code-dot-org/oceans-lab
```

Opens at `http://localhost:5173` with a mode picker for all 5 app modes. Pass
`?mode=short` to start in a specific mode, `?guides=K5` to select the K5 guide
sequence, `?tts=en` for text-to-speech.

### Build

```bash
yarn turbo run build --filter=@code-dot-org/oceans-lab
```

Outputs `dist/{index.mjs, index.cjs, index.d.ts}` and
`dist/assets/models/{model.json, group1-shard1of1.bin}`.

### Tests

```bash
yarn turbo run test --filter=@code-dot-org/oceans-lab
```

---

## Architecture notes

### Asset pipeline

Image and sound assets live in `src/assets/`. At build time, assets are
referenced via `new URL('./assets/...', import.meta.url).href` so Vite resolves
them correctly in both dev and library modes.

The TFJS MobileNet model (`model.json` + `group1-shard1of1.bin`) is emitted to
`dist/assets/models/` by the custom `emitModelAssets` Rollup plugin in
`vite.config.ts`. TFJS resolves the `.bin` shard relative to `model.json` at
runtime; inlining via `?url` would break this because TFJS cannot resolve a
relative path from a `data:` URI.

### Canvas + React layers

Three visual layers:

1. `#background-canvas` — background images (water, lab)
2. `#activity-canvas` — sprites and animations (canvas 2D API)
3. `#container-react` — React UI (HTML overlay, no canvas)

The React root persists across state updates; `renderUI()` calls `root.render()`
rather than remounting.

### State management

All mutable state lives in `src/oceans/state.ts` as a single flat object
threaded through every subsystem. `setState(partial)` merges and fires a
registered callback (the React re-render). No external state library.

### ML classifiers

- `fishvtrash`, `creaturesvtrash`, `creaturesvtrashdemo`: KNN classifier backed
  by `@tensorflow-models/knn-classifier` with MobileNet feature extraction.
- `short`, `long`: SVM classifier (`@code-dot-org/svm`) operating on hand-crafted
  fish-component feature vectors.

---

## Design notes

See the original design documentation in the commit history for detailed notes on
animation, the Guide system, fish-component adding instructions, and i18n. The
mode and scene descriptions from the original standalone-repo README remain
accurate.
