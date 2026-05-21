# Contract: Pyodide Web Worker Protocol

The renderer (`PyodideProvider`) and the worker (`PyodideWorker.ts`) communicate by structured-cloned messages. This contract is what either side relies on; any breaking change must rev the worker contract version (`nblab.contract.workerVersion` in `package.json`).

## Lifecycle

```
PyodideProvider                                   PyodideWorker
       │                                                  │
       ├─── new Worker(URL, { type: 'module' }) ────────▶ │
       │                                                  │  starts ESM bootstrap
       │                                                  │
       ├─── { type: 'initialize' } ─────────────────────▶ │
       │                                                  │  loadPyodide()
       │                                                  │  install stdout/input bridge
       │                                                  │  run python_init.py
       │ ◀─── { type: 'initialized',                      │
       │         interruptBuffer, hasInterrupt,           │
       │         pyodideVersion } ──────────────────────  │
       │                                                  │
       ├─── { type: 'run', cellId, code } ───────────────▶ │
       │                                                  │  loadPackagesFromImports
       │                                                  │  loadPackage(extras)
       │                                                  │  apply per-package overrides
       │                                                  │  transform code for async input
       │                                                  │  runPythonAsync(code)
       │ ◀─── { type: 'stdout', text } ───────────────── (0..N)
       │ ◀─── { type: 'input_request', message } ─────── (0..N)
       │                                                  │
       ├─── { type: 'input_response', value } ──────────▶ │
       │                                                  │
       │ ◀─── { type: 'execute_result', result } ─────── (0..N)
       │ ◀─── { type: 'execute_completed' } or
       │      { type: 'error', error } ─────────────────  │
       │                                                  │
       ├─── { type: 'reset' } ──────────────────────────▶ │
       │                                                  │  run python_reset_globals.py
       │ ◀─── { type: 'reset_completed' } ───────────────  │
       │                                                  │
       │                                                  │  on uncaught init failure:
       │ ◀─── { type: 'fatal', error } ───────────────────  │
```

## Messages to the worker

```ts
type ToWorker =
  | { type: 'initialize' }
  | { type: 'run'; cellId: string; code: string }
  | { type: 'reset' }
  | { type: 'input_response'; value: string | null };
```

### `initialize`

Sent once after worker construction. Must be the first message. Receiving any other message before `initialized` is a programming error and is logged but ignored.

### `run`

`code` is the cell source after `{{VAR}}` substitution has happened on the main thread. The worker MUST NOT see the templating syntax.

`cellId` is echoed in `execute_result` / `error` / `execute_completed` so the provider can route outputs.

While a `run` is in flight, additional `run` messages are queued in the provider (not in the worker). The worker handles exactly one `run` at a time.

### `reset`

Clears user-defined Python globals while keeping the kernel alive. Issued by the FR-017 "Reset Globals" action.

### `input_response`

Reply to an `input_request`. `value === null` means the learner cancelled the input; the worker MUST inject this as a `KeyboardInterrupt` in the running Python frame.

## Messages from the worker

```ts
type FromWorker =
  | { type: 'initialized'; interruptBuffer: ArrayBuffer | null; hasInterrupt: boolean; pyodideVersion: string }
  | { type: 'stdout'; text: string }
  | { type: 'input_request'; message: string }
  | { type: 'execute_result'; result: Record<string, unknown> }   // MIME-keyed
  | { type: 'execute_completed' }
  | { type: 'error'; error: string }
  | { type: 'reset_completed' }
  | { type: 'fatal'; error: string };
```

### `initialized`

`interruptBuffer` is a `SharedArrayBuffer` (passed as the underlying `ArrayBuffer`) when `SharedArrayBuffer` is available. The provider wraps it as `Int32Array(buffer)` and writes `2` on Stop to raise `KeyboardInterrupt`. When unavailable, `interruptBuffer === null` and `hasInterrupt === false`; the provider must fall back to terminating + re-spawning the worker.

`pyodideVersion` is surfaced in the renderer header.

### `stdout`

Each message carries a partial stream. The provider concatenates into the cell's `stdout` output buffer and updates the live console. The provider applies the FR-021 stdout cap; the worker does not.

### `input_request`

`message` is the prompt passed to Python's `input(prompt)`. The provider shows the `InputDialog`, awaits the learner's response, then posts `input_response`. The cell's `running` state remains true while awaiting.

### `execute_result`

`result` is MIME-keyed. Recognized in v1:

| MIME | Renderer |
|---|---|
| `text/plain` | Monospace text |
| `text/html` | DOMPurify → `<div>` |
| `image/png` | `<img src="data:image/png;base64,…">` |
| `image/svg+xml` | Inline SVG via DOMPurify |

Multiple `execute_result` messages can arrive per `run` (e.g., a matplotlib `imageBase64` callback followed by a final `__repr__`). The provider merges into one entry on the cell.

### `execute_completed`

Terminator for a successful `run`. The provider moves the cell to `ran-ok` and records `ranAt`.

### `error`

Terminator for a `run` that raised an uncaught Python exception. `error` is the formatted traceback (Python-style, multi-line). The provider:
1. Extracts the `<ExceptionClass>: <message>` summary for the empathy card.
2. Best-effort extracts the offending line number from the traceback for the editor highlight (regex against the last `File "<exec>", line N` frame).
3. Stores the full traceback under the cell's `error` output.

### `reset_completed`

Terminator for a `reset`.

### `fatal`

Worker-level catastrophe (Pyodide failed to initialize, structured-clone error, etc.). The renderer surfaces a top-level alert and offers a "Restart" action that terminates the worker and spawns a new one.

## Interrupt semantics

When `hasInterrupt === true`:
- Provider writes `2` to `interruptBuffer[0]` on Stop.
- Worker's Pyodide checks the buffer at safepoints and raises `KeyboardInterrupt`.
- Provider clears the buffer (`interruptBuffer[0] = 0`) on the next `run`.

When `hasInterrupt === false`:
- Provider terminates the worker (`worker.terminate()`).
- Provider spawns a new worker and replays `initialize`.
- Provider surfaces a banner: "Globals were reset because Stop was tapped on this device."

## Async `input()` transform

The worker pre-loads `async_input.py` during `initialize`. This module wraps `builtins.input` so that synchronous `input(prompt)` calls await an internal `_pending_input` future. The transform script `_transform_code(code: str)` rewrites the user's cell code at run time to be `async` and to `await` `input()` calls. The transformed code is what `runPythonAsync` executes.

## Package autoload

The worker:
1. Calls `pyodide.loadPackagesFromImports(code)` — Pyodide's built-in static import scan.
2. Calls `pyodide.loadPackage(additionalPackagesFromCode(code))` for our allow-list of imports that Pyodide does not detect (e.g., `import pygame` triggers loading `pygame-ce`).
3. For each newly-loaded package, applies post-load overrides from `runtime/overrides/<package>.ts` (mirrors jupyter-k12's `overrides/` directory).

`additionalPackagesFromCode` and the override modules are static, lab-owned files; their union defines the lab's Python package surface for v1.

## Versioning

Worker contract is v1.0. Adding a new message type is a MINOR bump; renaming a field or changing semantics is a MAJOR bump. The provider asserts `pyodideVersion` against a known-good range on `initialized` and warns (but does not block) on mismatch.
