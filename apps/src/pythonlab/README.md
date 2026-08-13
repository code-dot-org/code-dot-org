# Python Lab

Python Lab runs student Python code in the browser using
[pyodide](https://pyodide.org/).

## How it works

The pyodide web worker (`pyodideWebWorker.ts`) and the service worker that
makes blocking `input()` calls work (`inputServiceWorker.js`) both run
inside a hidden iframe on a dedicated `pyodide-sandbox.preview.<domain>`
subdomain, not on `studio.code.org`. The apex domain comes from
`getPreviewDomain()` -- `codeprojects.org` by default, `codeaiprojects.org`
via the `sandboxed-preview-domain` DCDO flag or the `new-preview-domain`
experiment (see `docs/weblab-preview-domain-migration.md`). Either way it is
a wholly separate domain from `code.org`, so student Python execution
never has access to studio.code.org's cookies or session -- the same
isolation goal Web Lab 2 already solves for student HTML/JS (see
`apps/src/weblab2/README.md`).

- `pyodideSandboxManager.ts` (runs on `studio.code.org`) creates the
  hidden iframe and exposes `asyncRun`/`restartPyodideIfProgramIsRunning`/
  `sendInput` to the rest of Python Lab. It owns the Redux dispatches,
  console output, and metrics reporting -- nothing in the sandbox has
  access to any of that. It manages the sandbox iframe only and never
  touches the `Worker` itself.
- `sandbox/pyodideSandboxWorkerManager.ts` (runs inside the iframe, on
  the sandbox subdomain) manages the actual `Worker` -- creating it,
  restarting it, and dispatching messages from `pyodideSandboxManager.ts`
  to it. It only relays results back up via `postMessage`; it contains no
  business logic of its own.
- `sandbox/pyodideSandboxHelpers.ts` holds the sandbox's supporting
  plumbing -- computing its own origin and registering/using the input
  service worker -- kept separate so `pyodideSandboxWorkerManager.ts`
  reads as the message dispatch loop it actually is.
- `sandbox/constants.ts` defines the `postMessage` contract shared by
  both sides: `ToPyodideSandboxMessage` and `FromPyodideSandboxMessage`,
  two separate enums (rather than one enum with directional prefixes) so
  the compiler -- not just a naming convention -- rejects a message used
  in the wrong direction.

`pyodideWebWorker.ts` itself is unaware of any of this -- it only talks
to whatever page creates it

## How to run locally

The sandbox is off by default. Turn it on for a session with
`?pythonlab-separate-domain=1` on the level URL, or with
`?new-preview-domain=1`, which turns it on *and* points it at
`codeaiprojects.org`. For a whole environment, set the
`use-pythonlab-separate-domain` DCDO flag to `true`; any other value, or
no value, leaves it off. `pyodideSandboxEnabled.ts` holds that decision.
The sandbox domain can also be set via dcdo; use the flag `sandboxed-preview-domain`
to set it. This value is used by both Web Lab 2 and Python Lab. By default it
uses `codeprojects.org`, to use `codeaiprojects.org` you must set the flag.

Like Web Lab 2, the sandbox iframe needs a service worker, which
requires a secure origin. Local dev is plain HTTP, so add the sandbox's
local hostname to Chrome's insecure-origin allowlist:
`chrome://flags/#unsafely-treat-insecure-origin-as-secure` (search that
in Chrome to load the flag settings). Recommended value, so it works on
either port and either preview domain:

```
http://localhost-studio.code.org:9000,http://localhost-studio.code.org:3000,http://pyodide-sandbox.preview.localhost.codeprojects.org:9000,http://pyodide-sandbox.preview.localhost.codeprojects.org:3000,http://pyodide-sandbox.preview.localhost.codeaiprojects.org:9000,http://pyodide-sandbox.preview.localhost.codeaiprojects.org:3000
```

Unlike Web Lab 2's preview (which uses a per-project channel id in its
subdomain, requiring a flag exception per project tested), the pyodide
sandbox always uses the same fixed subdomain -- nothing here is
per-project state, so one flag entry covers every Python Lab level.

`*.preview.localhost.codeprojects.org` and
`*.preview.localhost.codeaiprojects.org` already resolve to `127.0.0.1`
and `apps/webpack.config.js`'s devServer `allowedHosts` already covers
both via its wildcard entries, so no other local configuration is
needed.
