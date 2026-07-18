# @code-dot-org/codebridge

The Codebridge multi-file IDE lab shell: file browser, file tabs, code editor,
console, and backpack. Runtime-agnostic — consuming labs supply the language
runtime and layouts. Python Lab (`@code-dot-org/python-lab`) is the first
consumer; Web Lab 2 is expected to be the second.

Codebridge builds on the base `@code-dot-org/lab` framework. `CodebridgeLab`
specializes `LabWithSources` to a `MultiFileSource`, the same way `BlocklyLab`
specializes it to a Blockly serialization. The multi-file source itself and its
save path live in the base `labProjectSlice`; this package owns the file/folder
_semantics_ (the edit helpers and the thunks that dispatch base `setAndSaveSource`)
and the IDE UI.

See [docs/port-plan.md](./docs/port-plan.md) for the port from the legacy
`apps/src/codebridge` implementation, the framework seams, and the vertical
slice that derisks the write path.

## Status

Early scaffold. Present today:

- `src/redux/` — the `codebridgeWorkspace` UI-chrome slice and the store that
  layers it onto the base lab store via `injectSlices`.

Next: `CodebridgeLab`, the multi-file edit helpers and file thunks, then the
file browser / tabs / editor / console.

## Scripts

- `yarn dev` — Vite dev server
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
