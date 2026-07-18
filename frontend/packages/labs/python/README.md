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

## Scripts

- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
