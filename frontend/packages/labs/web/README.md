# @code-dot-org/web-lab

Web Lab, built on the Codebridge shell (`@code-dot-org/codebridge`) — the port of
legacy `apps/src/weblab2`. This package supplies the web-specific pieces (HTML /
CSS / JS language support, the default project, and — once ported — the page
preview and debug panel) and composes them with the generic shell.

The default export is the studio lab entrypoint: it accepts the host loading
contract (`LabEntrypointProps`) and renders `<CodebridgeLab>` wrapping
`WebLayout`.

## Layout

`WebLayout` mirrors legacy's `weblab2/layout/VerticalLayout`: the instructions /
resource panel on the far left, the Codebridge `Workspace` (file browser + tabs +
editor) in the middle, and the page preview on the right. Both dividers drag to
resize and restore their default size on double-click.

The shared pieces — `InfoPanel`, `Workspace`, `FileBrowser`, `CodeEditor` — come
from the Codebridge package, exactly as legacy shares `@codebridge/InfoPanel` and
`@codebridge/Workspace` between weblab2 and pythonlab. `ResizeHandle` comes from
base (legacy's `lab2` `ResizeBar`).

## Status

Ported: the shell composition — config (file types + CodeMirror language
support), the default project, the layout, and the standalone demo harness.

**The preview is a placeholder.** Still to port from legacy:

- **HTML preview** (`weblab2/htmlPreview/`) — the project rendered in an iframe
  served by a project service worker, with a generated content-security policy,
  console/base-tag/parameter injection, and the preview inspector. This wants the
  same origin-isolation treatment the Python Lab pyodide sandbox got: the preview
  runs student-authored HTML/JS, so it should not share the host page's origin.
- **Debug panel** (`weblab2/debugPanel/`) — console + network panels fed by the
  preview iframe. Web Lab does not use the Codebridge xterm console.
- **Linters** (`weblab2/htmlLinter.ts`, `cssLinter.ts`) — CodeMirror lint
  integration for HTML and CSS.
- Studio `LAB_REGISTRY` registration, share view, AI tutor, and the intro tour.

## Standalone demo

`yarn dev` serves a harness (`index.html` + `src/main.tsx`) at
http://localhost:5138 — no Rails backend. It mounts the App with the provider
stack the studio host normally supplies, plus a fixture level served by MSW, so
the full shell renders.

Fixture scenarios load by channel id:

```
http://localhost:5138/frontend-studio/projects/web/simple/edit
```

## Scripts

- `yarn dev` — standalone demo harness on :5138
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
