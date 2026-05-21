# Mini-apps

A **mini-app** is a small, self-contained visualization that can be
driven by some of our labs. Specifically, for new labs, codebridge
contains a registry that can be used to install any of these mini-apps
into a level and have them be controlled by, at least, PythonLab.

These are used to provide more vibrant and specialized demonstrations of
concepts to students. They are just a simple protocol and a space for a
visualization that can be more or less whatever the demonstration requires.

Codebridge owns the editor, console, and run lifecycle; the mini-app owns
whatever appears in the preview panel.

This directory hosts:

| Package                              | Purpose                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `@code-dot-org/mini-app-base`        | Interface, factory type, and the `[TAG] KEY {json}` envelope parser.     |
| `@code-dot-org/demo-mini-app`        | Stub. Validates the abstraction stays generic; not curriculum content.   |
| `@code-dot-org/neighborhood-mini-app`| Real mini-app. Reads serialized maze + skin, drives `MazeController`.    |

Codebridge (`apps/src/codebridge/`) ties them together via a single
registry — see "Registering" below.

## Contract

A mini-app implements `MiniApp` from `@code-dot-org/mini-app-base`:

```ts
interface MiniApp<Signal = unknown> {
  readonly name: string;          // matches labConfig.miniApp.name
  readonly signalTag: string;     // e.g. "[NEIGHBORHOOD]"

  parseSignal(line: string): Signal | null;
  handleSignal(signal: Signal): void;

  onRun(): void;                  // bracket a run
  onStop(): void;                 // user stopped or program crashed
  onClose(): void;                // EOF; drain the queue
  reset(): void;                  // back to initial state

  waitUntilDone(): Promise<void>;

  parseException?(traceback: string): string | null;
  captureThumbnail?(): Promise<HTMLCanvasElement | null>;

  PreviewComponent: ComponentType<MiniAppPreviewProps>;
}
```

### Lifecycle

Codebridge and PythonLab drives the mini-app through `pyodideRunner` and
`pyodideWorkerManager`:

1. `onRun()` before student code starts.
2. Each stdout line that begins with `signalTag` is fed to
   `parseSignal()`; non-null results are passed to `handleSignal()`.
   Lines that don't start with the tag are routed to the console.
   A `signalTag` might be `[NEIGHBORHOOD]`
3. `onStop()` if the user stops, or the program throws.
4. `onClose()` once stdout is fully drained.
5. `await waitUntilDone()` before codebridge considers the run finished.
6. After a successful run, codebridge calls `captureThumbnail?()`. The
   mini-app rasterizes its visualization into a canvas (SVG-based
   mini-apps can use the `svgToCanvas` helper from
   `@code-dot-org/mini-app-base/svg`); codebridge then downsizes it to
   thumbnail width, encodes a PNG, and saves it.

`reset()` is independent of run lifecycle; codebridge calls it when the
student edits the project (e.g. resets the maze).

### Wire protocol

Mini-apps communicate with student Python code over stdout. The runner
splits stdout by line; lines starting with the mini-app's `signalTag`
are signals, everything else is console output.

The envelope format is:

```
[TAG] KEY {json}
```

`parseSignalEnvelope` (exported from `@code-dot-org/mini-app-base`) is
the canonical parser. `KEY` is a free-form identifier the mini-app
defines; the JSON payload is optional. Example from Neighborhood:

```
[NEIGHBORHOOD] MOVE_FORWARD {"id":7,"direction":"north"}
```

## Adding a new mini-app (manually)

1. **Scaffold the package** under `frontend/packages/mini-apps/<name>/`.
   Copy `demo/` as a starting point — it's the minimal valid mini-app
   and comes pre-wired with the build setup the package boundary
   requires (see ["Why demo declares these deps"](#why-demo-declares-these-deps)
   below). Update `package.json` `name`, `description`, and
   `repository.directory`.

2. **Implement `MiniApp`.** Export a `<NAME>` constant for the
   registry key and `<NAME>_SIGNAL_TAG` for the stdout protocol. Keep
   the implementation in a `.ts` file; keep the React preview in a
   sibling `.tsx`.

3. **Re-export the public surface** from `src/index.ts`. At minimum:
   the class, the name constant, and the preview component.

4. **Wire the package into `apps/`.** Add it to `apps/package.json`
   under `dependencies` using the `portal:` protocol — that's how every
   `frontend/packages/*` package is consumed from apps (yarn classic in
   `apps/` doesn't accept the `workspace:*` protocol):

   ```json
   "@code-dot-org/foo-mini-app": "portal:../frontend/packages/mini-apps/foo/",
   ```

5. **Register with codebridge** at
   `apps/src/codebridge/miniAppRegistry.ts`:

   ```ts
   import {FOO_NAME, FooMiniApp} from '@code-dot-org/foo-mini-app';

   const MINI_APPS: Record<string, MiniAppRegistryEntry> = {
     // ...
     [FOO_NAME]: {factory: deps => new FooMiniApp(deps)},
   };
   ```

   This is the **only** place in `apps/` that names mini-apps
   concretely. Everything else dispatches by `labConfig.miniApp.name`.

That's it. The mini-app boots when a level's `labConfig.miniApp.name`
matches the registered name.

## Codebridge-side inputs (the adapter slot)

Mini-apps that need data only codebridge can resolve — redux state,
`levelProperties`, apps-only loaders like the maze skin loader — declare
a React context in their own package, and provide a codebridge-side
**adapter** that fills it.

The adapter is a wrapper component registered alongside the factory:

```ts
[FOO_NAME]: {
  factory: deps => new FooMiniApp(deps),
  Adapter: FooAdapter,
},
```

`MiniAppPreview` calls `getMiniAppAdapter(name)` and wraps the rendered
`PreviewComponent` with it when present. Neighborhood, for example:

- `frontend/packages/mini-apps/neighborhood/src/NeighborhoodInputsContext.ts`
  declares the context shape.
- `NeighborhoodPreview` (inside the package) consumes the context and
  boots `MazeController` once all inputs are present.
- `apps/src/codebridge/miniAppAdapters/NeighborhoodAdapter.tsx` reads
  the codebridge context + redux + skin loader and provides the
  context value.

The split keeps the package free of `apps/` imports: the package
declares *what* it needs (the context interface), codebridge supplies
*how* to obtain it (the adapter).

Demo has no adapter — `MiniAppPreview` renders its `PreviewComponent`
directly. If a new mini-app's inputs all fit inside `MiniAppDeps`,
skip the adapter.

### Typing the inputs

Declare the inputs interface with concrete types.

For level data, import `LevelProperties` from `@code-dot-org/core/api`:

```ts
import type {LevelProperties} from '@code-dot-org/core/api';

export interface FooInputs {
  miniApp: FooMiniApp | null;
  levelProperties: LevelProperties | null;
  // ...mini-app-specific fields
}
```

apps and `@code-dot-org/core/api` currently expose **two different**
`LevelProperties` types — they describe the same backend response but
have divergent `appName` enums until apps migrates onto core/api's
types. Every adapter that consumes `levelProperties` from
`useCodebridgeContext()` pays a one-line cast:

```tsx
levelProperties: levelProperties as unknown as LevelProperties,
```

See `NeighborhoodAdapter.tsx` for the worked example, including the
comment explaining why the cast is there. This will disappear when we
are using the `api` definitions in both places.

### Type surface inside the package

Per-mini-app type aliases (signal shapes, data extensions, callback
types) live in a `types.ts` next to the implementation. Keep them
exported through `src/index.ts` so the adapter and the package itself
agree on shape.

## Why demo declares these deps

`demo/package.json` lists `@code-dot-org/component-library`,
`@mui/material`, `@emotion/react`, and `@emotion/styled` under
`dependencies`. `DemoPreview` uses MUI `Typography` and `Button`
directly to exercise the build setup end-to-end; component-library
and emotion are declared because future mini-apps will reach for
them and the pattern needs to be in place. Two reasons the deps
have to be `dependencies` rather than `devDependencies`:

**1. Externalization, not bundling.** A mini-app package built with
`vite-plugin-externalize-deps` leaves anything in `dependencies` and
`peerDependencies` as `import 'pkg'` statements in the dist; anything
in `devDependencies` (and any direct import that isn't in either) gets
**bundled** into the dist. If a mini-app uses a component-library
component without declaring it as a dependency, the package will
ship its own copy of component-library, MUI, and emotion. Apps then
ends up with two MUI instances at runtime — apps's own copy plus the
one bundled into the mini-app's dist. MUI's `ThemeProvider` context
travels through only one of them, so theme-aware components (button
colors, slider variants, etc.) silently render with MUI defaults.
The duplication also bloats the bundle by ~200 kB and breaks CSS
hash matching when two emotion instances generate different
class names. Declaring the deps upfront forestalls all of that.

**2. The plugin needs them present.** `externalize-deps` reads
`dependencies` to decide what to externalize. A mini-app that imports
`@code-dot-org/component-library` but doesn't list it in `dependencies`
won't see it externalized — yarn install succeeds via hoisting, the
import resolves, vite bundles the whole tree into the dist.

The pre-wired vite config in `demo/` also uses `vite-plugin-lib-inject-css`
(injects `import './index.css'` at the top of the JS entry so consumers
pull in the bundled CSS as a side effect — without it, the CSS file is
emitted but never loaded) and sets `interop: 'auto'` on the rollup CJS
output (unwraps `.default` when requiring externalized ESM-default
exports — without it, default imports from packages like
component-library come back as namespace objects in the CJS dist and
React renders them with "type is invalid -- got: object").

When copying `demo/` as the starting point for a new mini-app, leave
these deps and the plugin/rollup settings in place. The failure modes
of forgetting are invisible until something looks wrong in the browser.

## Where things live

```
frontend/packages/mini-apps/
  base/              the MiniApp interface, factory type, envelope parser
  neighborhood/      maze-driving mini-app for the Neighborhood curriculum
  demo/              stub mini-app; abstraction canary

apps/src/codebridge/
  miniAppRegistry.ts          the only place that names mini-apps
  miniAppAdapters/            per-mini-app codebridge-side wrappers
  MiniAppPreview/             generic preview shell; talks to MiniApp only
```

## See also

- `frontend/AGENTS.md` — workspace conventions, Turborepo commands.
- `apps/src/pythonlab/pyodideRunner.ts` — where the lifecycle methods
  are actually called.
- `apps/src/pythonlab/pyodideWorkerManager.ts` — stdout dispatch into
  `parseSignal` / `handleSignal`.
