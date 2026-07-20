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

## Preview

The preview renders the student's project — and it never runs on the lab's
origin. Student HTML/JS gets its own origin so it cannot reach the lab's cookies
or session, the same isolation the Python Lab pyodide sandbox uses.

```
lab origin                        preview origin
┌──────────────────┐  postMessage  ┌──────────────────────────────┐
│ HTMLPreview      │◄─────────────►│ previewPage                  │
│  outer iframe ───┼──────────────►│  registers the project SW    │
└──────────────────┘               │  inner iframe → /index.html  │
                                   │       ▲ SW serves it from    │
                                   │       └ the project files    │
                                   └──────────────────────────────┘
```

- `preview.html` + `src/preview/previewPage.ts` run on the preview origin: they
  register `public/webLabProjectServiceWorker.js` and host the inner iframe.
- The worker answers every request the student's page makes from the project
  files, attaching the generated content-security policy, and reports (or blocks)
  requests that leave the project.
- `src/preview/HTMLPreview.tsx` is the lab-side half: it posts the project down
  and keeps it in sync as the student edits. It never runs student code.

The preview origin is host-supplied (`setPreviewBaseUrl`, or `?web-preview=` on
the lab's URL) rather than hard-coded. Legacy gives every project its own
subdomain (`{channelId}.preview.…codeprojects.org`, served by dashboard's
`codeprojects_preview_controller`), which also isolates projects from each other;
**the demo uses a single preview origin** to avoid needing wildcard DNS locally,
which is weaker isolation than production.

### Script and network policy

Scripts are gated by the predict-level rule (`src/preview/scriptPolicy.ts`,
legacy's `allowUserScripts`): on a predict level the student's scripts stay off
until they submit a prediction, so the page cannot show them the outcome they
were asked to predict. The answer drives `script-src` in the CSP the service
worker attaches, so a denial means the script never executes on the preview
origin at all — not merely that it is hidden.

Two consequences worth knowing:

- The preview holds the project back while `isLabLoading` is true. It has to:
  before the level loads, `levelProperties` is undefined, which reads as "not a
  predict level", and the page would run once under a permissive CSP before the
  gate applied. Legacy holds the same way via its `LEVEL_LOADING` message.
- Under `script-src 'none'` our own injected reporting scripts are refused too,
  so a predict level's debug console stays empty until the prediction is in.
  Legacy behaves the same way.

`blockNetwork` is still hardcoded to `true` here. In legacy it is not level-driven
at all but a NetworkPanel toggle (`networkRequestsBlocked`) defaulting to
**false**; porting that toggle is pending, and until then this package is
deliberately the stricter of the two.

### Inspector

The element inspector (`src/preview/inspector.ts`) draws a highlight box and a
`<tag> #id .class` label over whatever element the student hovers or Tabs to. It
runs on the **preview origin**, installed by `previewPage` against the inner
iframe's document — the lab can't reach that document across the origin split, so
it only posts the toggle down (`SET_INSPECTOR_ENABLED`, from the header button).

Two consequences of living in the student's document:

- Styles are set via `element.style`, not a CSS module: that document never loads
  our bundle's CSS, and inline styles are not subject to its CSP.
- The overlay elements belong to a different realm, so the helpers test
  `nodeType` and read attributes rather than using `instanceof Element`.

To make the whole page reachable without a mouse, the inspector puts
`tabindex="0"` on rendered elements that aren't already focusable, and keeps up
with the page via a `MutationObserver`. All of it is reverted on teardown —
which runs on every toggle and on every iframe load, since a load replaces the
document out from under the previous overlay.

## Status

Ported: the shell composition (config, default project, layout, demo harness)
and the preview core above.

The preview chrome (address bar, refresh, stop/reload, desktop-mobile toggle)
and the debug panel (console + network, with repeat grouping and blocked/CSP
reporting) are ported too. Stopping tears the iframe down, so a runaway page
actually stops running. So is the element inspector described above.

Editor linting lives in the Codebridge shell (`codebridge/src/editor/linters.ts`),
not here: HTML via htmlhint and JS via eslint-in-the-browser. Legacy's
`weblab2/cssLinter.ts` was not ported — it is an unwired prototype calling a
`stylelint` global nothing provides.

The lab is registered with the studio app in
`frontend/apps/studio/src/modules/labs/config/labs.ts`.

Still to port from legacy:

- Preview navigation history (legacy's back/forward buttons), the per-request
  details box with response bodies, and the copy button — the data already
  arrives for all three.
- Uploaded assets: the frontend `ProjectFile` schema has no `url` field yet.
- The NetworkPanel's block-network toggle (see the policy note above).
- Share view, AI tutor, and the intro tour.

## Standalone demo

`yarn dev` serves a harness (`index.html` + `src/main.tsx`) at
http://localhost:5138 — no Rails backend. It mounts the App with the provider
stack the studio host normally supplies, plus a fixture level served by MSW, so
the full shell renders.

Fixture scenarios load by channel id:

```
http://localhost:5138/frontend-studio/projects/web/simple/edit
http://localhost:5138/frontend-studio/projects/web/predict/edit
```

`predict` is the same project on a predict level, for exercising the script gate:
`script.js` must not run until a prediction is submitted.

To exercise the preview locally, run the lab and the preview page on two origins
and point the lab at it:

```
yarn dev:isolated   # lab on :5138, preview origin on :5201
# then open:
http://localhost:5138/?web-preview=http://localhost:5201/preview.html
```

Without `?web-preview=`, the preview panel explains that no preview origin is
configured — the lab will not run student code on its own origin.

## Scripts

- `yarn dev` — standalone demo harness on :5138
- `yarn dev:preview` — serve just the preview page on :5201
- `yarn dev:isolated` — run both in parallel (lab + preview origin)
- `yarn build` — library build (ESM + CJS + d.ts)
- `yarn typecheck` — `tsc -b --noEmit`
- `yarn test` — Vitest
- `yarn lint` / `yarn lint:fix`
