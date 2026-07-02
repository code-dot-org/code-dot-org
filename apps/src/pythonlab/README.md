# Python Lab

Python Lab runs student Python code in the browser using
[pyodide](https://pyodide.org/).

## How it works

The pyodide web worker (`pyodideWebWorker.ts`) and the service worker that
makes blocking `input()` calls work (`inputServiceWorker.js`) both run
inside a hidden iframe on a dedicated `pyodide-sandbox.preview.codeprojects.org`
subdomain, not on `studio.code.org`. `codeprojects.org` is a wholly
separate registrable domain from `code.org`, so student Python execution
never has access to studio.code.org's cookies or session -- the same
isolation goal Web Lab 2 already solves for student HTML/JS (see
`apps/src/weblab2/README.md`).

- `pyodideWorkerManager.ts` (runs on `studio.code.org`) creates the hidden
  iframe and exposes `asyncRun`/`restartPyodideIfProgramIsRunning`/
  `sendInput` to the rest of Python Lab. It owns the Redux dispatches,
  console output, and metrics reporting -- nothing in the sandbox has
  access to any of that.
- `sandbox/pyodideSandbox.ts` (runs inside the iframe, on the sandbox
  subdomain) owns the actual `Worker` and the input service worker
  registration. It only relays messages up to `pyodideWorkerManager.ts`
  via `postMessage`; it contains no business logic of its own.
- `sandbox/constants.ts` defines the `postMessage` contract shared by
  both sides (`PyodideSandboxMessageType`), so the message type strings
  can't drift between the two separate webpack bundles.

`pyodideWebWorker.ts` itself is unaware of any of this -- it only talks
to whatever page creates it, same as before.

## How to run locally

Like Web Lab 2, the sandbox iframe needs a service worker, which
requires a secure origin. Local dev is plain HTTP, so add the sandbox's
local hostname to Chrome's insecure-origin allowlist:
`chrome://flags/#unsafely-treat-insecure-origin-as-secure` (search that
in Chrome to load the flag settings). Recommended value, so it works on
either port:

```
http://localhost-studio.code.org:9000,http://localhost-studio.code.org:3000,http://pyodide-sandbox.preview.localhost.codeprojects.org:9000,http://pyodide-sandbox.preview.localhost.codeprojects.org:3000
```

Unlike Web Lab 2's preview (which uses a per-project channel id in its
subdomain, requiring a flag exception per project tested), the pyodide
sandbox always uses the same fixed subdomain -- nothing here is
per-project state, so one flag entry covers every Python Lab level.

`*.preview.localhost.codeprojects.org` already resolves to `127.0.0.1`
and `apps/webpack.config.js`'s devServer `allowedHosts` already covers it
via its existing wildcard entry, so no other local configuration is
needed.
