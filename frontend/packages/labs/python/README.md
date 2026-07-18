# @code-dot-org/python-lab

Python Lab, built on the Codebridge shell (`@code-dot-org/codebridge`). This
package supplies the Python-specific pieces — CodeMirror language support, the
file-type config, the default project, and (once ported) the pyodide runtime —
and composes them with the generic shell.

The default export is the studio lab entrypoint: it accepts the host loading
contract (`LabEntrypointProps`) and renders `<CodebridgeLab>` wrapping a
`<CodebridgeRuntimeProvider>` and the `PythonLayout` (file browser + editor +
console).

## Status

Early: the shell composes and renders, but **Run is a stub**. `App.tsx`'s runtime
writes a placeholder to the console instead of executing Python; the pyodide
runtime (worker manager, web worker, stdin service worker, runner) and studio
registration are the next step. See
[../codebridge/docs/port-plan.md](../codebridge/docs/port-plan.md).

## Standalone demo

`yarn dev` serves a standalone harness (`index.html` + `src/main.tsx`) at
http://localhost:5173 — no Rails backend. It mounts the App with the provider
stack the studio host normally supplies (the `CdoTheme` MUI theme, the redux
store) plus a fixture level, so the full shell renders: file browser, CodeMirror
editor (Python highlighting), and xterm console. Clicking **Run** writes the stub
message to the console. The harness omits `<StrictMode>` on purpose — its
double-invoked effects race xterm's async render against the console's
dispose/remount.

## Scripts

- `yarn dev` — standalone demo harness (Vite dev server)
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
