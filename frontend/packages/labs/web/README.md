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

The worker holds the project **in memory**, which makes its lifetime load-bearing:
a browser reclaims an idle service worker, and the files go with it. Two things
guard against that, and both are needed. The preview page pings `KEEP_ALIVE`
every 15s so an open lab keeps its worker (as legacy does), and every navigation
re-sends the project and waits for the worker's `RECEIVED_SOURCE` before
pointing the iframe — a ping alone is not enough, since timers in a background
tab are throttled below the idle timeout. Without the re-send, a request the
worker cannot serve falls through to the network, and on the demo's single-origin
setup that means the _lab_ loads inside its own preview.

The worker's _version_ matters for the same reason. It registers with
`updateViaCache: 'none'` and calls `registration.update()` on load, so an edit to
the worker script takes effect on the next reload instead of leaving a stale copy
serving the preview until someone unregisters it by hand. If the worker cannot
start at all, the lab says so (`SERVICE_WORKER_UNAVAILABLE`) rather than showing
whatever else the preview origin serves.

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

Blocking network activity is not level-driven at all: it is a toggle in the debug
panel's network pane, off by default, matching legacy's `networkRequestsBlocked`.
It lives in `DebugContext` because the pane sets it and the preview enforces it,
and it resets on level change so a block does not silently follow the student to
the next level. Enforcement is in the service worker, which refuses the request
and reports it as blocked — CSP is a separate, earlier gate, so a request to a
host the policy already forbids never reaches the toggle at all.

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

The preview chrome (back/forward, address bar, refresh, stop/reload,
desktop-mobile toggle) is ported too. Stopping tears the iframe down, so a
runaway page actually stops running; refreshing clears the debug panel, since
what the last run logged is stale. So is the element inspector described above.

Page history (`src/preview/previewHistory.ts`) records both ways of navigating —
a link click inside the student's page, and a path typed in the address bar — and
back/forward walk it without appending. It is kept as one value rather than
legacy's separate list and index, and the rule that a report of the page already
showing is not a navigation is what keeps back/forward from corrupting it: the
preview reports every page it serves, including the one back just asked for.

The debug panel is complete. The console pane renders each log as an Alert
coloured by level, with repeat-count grouping and auto-scroll to the tail. The
network pane has the activity list, sort order, per-request and per-response
details with copy-to-clipboard, response bodies (JSON pretty-printed), status
icons and the request/response divider, and the block toggle. Failures are
distinguished: a CSP refusal names the host, a blocked request says so, and a
pending request shows as pending rather than as a failure. Clearing acts on the
pane you are looking at, as legacy's does.

One deliberate divergence, in the console pane's keyboard model. Legacy makes the
whole list a single tab stop and requires Enter to enter a roving-tabindex mode
over individual logs (Tab wraps, Escape exits), so a chatty page's hundreds of
logs do not become hundreds of tab stops. That composite carries no ARIA role, so
this workspace's stricter `jsx-a11y` rules reject it. The pane is a readable,
scrollable region rather than a widget, so it is one instead: a labelled
`role="region"`, keyboard-focusable because a scrollable container must be
(WCAG 2.2 SC 2.1.1), with no focusable entries. That keeps legacy's actual goal —
one tab stop regardless of log count — without inventing a role, and a screen
reader still reaches every entry, each carrying the same accessible name legacy
built. Note each Alert is already a live region (`role="alert"`), so the
container deliberately is not one; nesting them risks double announcements.

Editor linting lives in the Codebridge shell (`codebridge/src/editor/linters.ts`),
not here: HTML via htmlhint and JS via eslint-in-the-browser. Legacy's
`weblab2/cssLinter.ts` was not ported — it is an unwired prototype calling a
`stylelint` global nothing provides.

The lab is registered with the studio app in
`frontend/apps/studio/src/modules/labs/config/labs.ts`.

Still to port from legacy:

- Legacy's close button on the debug panel: the panel's open/closed state belongs
  to the layout, which this package models with a resize handle instead.
- Uploaded assets: the frontend `ProjectFile` schema has no `url` field yet.
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
http://localhost:5138/frontend-studio/projects/web/network/edit
http://localhost:5138/frontend-studio/projects/web/pages/edit
```

`predict` is the same project on a predict level, for exercising the script gate:
`script.js` must not run until a prediction is submitted. `network` adds a
`fetch`, for the debug panel's network pane — note the demo allow-lists no hosts,
so that request is refused by CSP and shows the failure path. `pages` is two
linked pages, for preview navigation and the back/forward buttons.

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
