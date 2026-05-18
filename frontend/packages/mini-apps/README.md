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
  getThumbnailElement?(): Element | null;
  getPreviewScale?(): number | undefined;

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
6. After a successful run, codebridge calls `getThumbnailElement?()` and
   serializes the returned node to a PNG for the project thumbnail.
   The package only names the element — the SVG-to-blob pipeline lives
   in apps because the helpers and cropping scale are apps-side.

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

## Adding a new mini-app

1. **Scaffold the package** under `frontend/packages/mini-apps/<name>/`.
   Copy `demo/` as a starting point — it's the minimal valid mini-app.
   Update `package.json` `name`, `description`, and `repository.directory`.

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
