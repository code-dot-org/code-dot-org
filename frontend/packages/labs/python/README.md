# @code-dot-org/python-lab

Python Lab, built on the Codebridge shell (`@code-dot-org/codebridge`). This
package supplies the Python-specific pieces — CodeMirror language support, the
file-type config, the default project, and the pyodide runtime — and composes
them with the generic shell.

The default export is the studio lab entrypoint: it accepts the host loading
contract (`LabEntrypointProps`) and renders `<CodebridgeLab>` wrapping a
`<PythonRuntimeProvider>` (which supplies the pyodide Run/Stop callbacks) and the
`PythonLayout` (file browser + editor + console).

## Runtime

`src/runtime/` runs the student's `main.py` in [pyodide](https://pyodide.org/)
and streams output to the console. It has two backends behind one façade:

- `pyodideManager.ts` — the façade. Picks a backend once and exposes
  `preloadPyodide` / `asyncRun` / `restartWorkerIfRunning` to `pythonRunner.ts`.
  Only the selected backend's module is imported.
- `pyodideWorkerManager.ts` — the **direct** backend. Runs the pyodide web worker
  on this page. It is the fallback when no sandbox is configured — a local-dev and
  demo convenience. **Every real deployment configures the sandbox** (below); the
  direct path is not a student-facing path.
- `pyodideRuntime.ts` — the shared `PyodideRuntime` interface and the worker
  message router (console + `labSystem` slice), used by both backends.
- `pyodideWebWorker.ts` — loads pyodide (from the jsDelivr CDN for now), writes
  project files to its virtual FS, runs the program, streams stdout/stderr.

pyodide preloads at lab mount (`App.tsx` calls `preloadPython()`), so the first
Run is fast. Deferred: package pre-loading (numpy/matplotlib + wheels), matplotlib
images, source write-back, the neighborhood mini-app, and validation.

### Input

Blocking `input()` works via a service worker (`public/inputServiceWorker.js`,
ported from `apps/src/pythonlab/inputServiceWorker.js`). The pyodide worker is
single-threaded, so `input()` is patched (`runtime/input/pythonInput.ts`) to make
a **synchronous** XHR to `/pythonlab-input-sw/`; the service worker holds that
response open, asks the window for a line, and resolves it when the user submits —
unblocking the worker exactly like real stdin.

The service worker must control the origin at scope `/` (so it intercepts the
worker's fetch), and the pyodide worker must be created _after_ it takes control.
Input is wired **only on the sandbox path** — the only path real deployments use —
where the worker runs on its own origin. On the direct path `sendInput` is a
no-op, so `input()` reports "Input is not supported here." This is deliberate, not
a gap: the direct path is dev/demo-only, and its demo origin already has MSW at
scope `/`, which a second service worker can't share. (Studio's legacy direct
path registers the service worker itself; this package does not, since no
deployment runs the direct path.)

## Domain sandbox

For isolation, the pyodide worker can instead run inside a hidden iframe on a
**separate origin**, so student Python never touches this page's cookies or
session — the goal studio's `PYTHONLAB_SEPARATE_DOMAIN` experiment meets with a
fixed `codeprojects.org` subdomain (dashboard PR #73741). This package instead
lets the host name the origin via a query param:

```
?pyodide-sandbox=http://localhost:5200/sandbox.html
```

When present, the façade selects the sandbox backend:

- `sandbox/pyodideSandboxManager.ts` (parent, host origin) — creates the hidden
  iframe, owns console output and Redux, relays run/stop down and worker output
  up. It passes its own origin to the iframe via `?parentOrigin=`; both sides
  origin-check every message.
- `sandbox/pyodideSandboxWorkerManager.ts` + `sandbox.html` (iframe, separate
  origin) — owns the actual worker and does nothing but relay.
- `sandbox/messages.ts` — the `postMessage` contract shared by both sides.

Only the parent side ships in the library build (it is reachable from the lab
entry as a lazy chunk). The sandbox page itself is a host artifact; a real host
serves it from its isolated origin (studio already has the Rails controller from
#73741). Absent the query param, nothing here loads and the worker runs directly.

## Standalone demo

`yarn dev` serves a standalone harness (`index.html` + `src/main.tsx`) at
http://localhost:5137 — no Rails backend. It mounts the App with the provider
stack the studio host normally supplies (the `CdoTheme` MUI theme, the redux
store) plus a fixture level, so the full shell renders and **Run executes Python**
via pyodide. The harness omits `<StrictMode>` on purpose — its double-invoked
effects race xterm's async render against the console's dispose/remount.

To exercise the domain sandbox locally, run the demo and the sandbox page on two
origins (mirroring the caturra project's `dev:isolated`) and point the app at the
sandbox:

```
yarn dev:isolated   # app on :5137, sandbox page on :5200
# then open:
http://localhost:5137/?pyodide-sandbox=http://localhost:5200/sandbox.html
```

The `input` fixture scenario runs a program that calls `input()`; load it on the
sandbox path to exercise the input service worker:

```
http://localhost:5137/app/projects/python/input/edit?pyodide-sandbox=http://localhost:5200/sandbox.html
```

## Scripts

- `yarn dev` — standalone demo harness on :5137 (direct-worker Run)
- `yarn dev:sandbox` — serve just the sandbox page on :5200
- `yarn dev:isolated` — run both in parallel (app + sandbox origin)
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
