# Browser harness for PR 77222

Reproduces APPS-48G without a running Rails app, and checks that the text compression widget does not throw (APPS-4QW).
Headless Chromium (Playwright) loads small pages bundled with esbuild from code-dot-org `apps/`.

Stubbed in the harness: `@cdo/locale` (icon-search) and a few UI wrappers (text-compression: markdown preview, react root, inline-attach, and `Dialog`).
`DataLibraryPane` is not covered here; it is covered by `apps/test/unit/storage/dataBrowser/DataLibraryPaneTest.jsx`.

## Prerequisites

- A checkout of code-dot-org with `yarn install` run in `apps/` (provides `esbuild`, `react`, `@mui/material`, CodeMirror).
- Playwright with Chromium installed (`npm i -g playwright && npx playwright install chromium`).
- Node 20 or newer.

```sh
export APPS_DIR=/path/to/code-dot-org/apps
export NODE_PATH=$(npm root -g)   # so `require('playwright')` resolves
```

## icon-search (APPS-48G)

`src-staging/` holds copies of `searchAssets.js`, `IconList.jsx` and friends as they are on `staging`; `src-pr/` holds the files from this PR.

```sh
cd icon-search
node build.js    # writes dist/staging.js and dist/pr.js
node run.js      # types each input into the search box of both builds; writes screenshots/
```

Expected output (`pageErrors`, `searchAssets` per build and input):

| input | staging | pr |
|---|---|---|
| `hand` | no error, `ok:2` | no error, `ok:2` |
| `hand*` | no error, `ok:2` (valid regexp) | no error, `ok:0` |
| `hand***` | `Invalid regular expression: /(^|-)hand***/: Nothing to repeat`, `searchAssets` THROWS | no error, `ok:0` |
| `(` | `/(^|-)(/: Unterminated group`, THROWS | no error, `ok:0` |
| `[` | `/(^|-)[/: Unterminated character class`, THROWS | no error, `ok:0` |
| `\` | `/(^|-)\/: \ at end of pattern`, THROWS | no error, `ok:0` |

On staging the page also shows the uncaught error and the React tree is unmounted (blank); on the PR build it shows "No icons found".

## text-compression (APPS-4QW)

Loads a copy of `dashboard/public/text-compression/text-compression.js` with CodeMirror 6, types special characters into the dictionary, the CodeMirror search panel (regexp on and off) and the "Write your own" text dialog, and records every `RegExp` constructor failure.

```sh
cd text-compression
node build.js    # writes tc-harness.js
node run.js      # writes screenshots/
```

Expected: `pageerrors: []`, `consoleErrors: []`. `regexpThrowsTotal` is non-zero, but every throw comes from CodeMirror's own `validRegExp` (flags `gmu`), which catches it. The widget's own `RegExp` calls do not throw.
