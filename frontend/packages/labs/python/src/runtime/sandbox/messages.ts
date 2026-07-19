import type {WorkerFile} from '../messages';

// The postMessage contract between the parent page (pyodideSandboxManager.ts,
// running on the host origin) and the sandbox iframe
// (pyodideSandboxWorkerManager.ts, running on a separate origin). Kept in one
// side-effect-free module so both bundles share the exact string values.
//
// Messages emitted by pyodideWebWorker.ts itself (sysout, run_complete, ...; see
// PyodideMessage in ../messages) are relayed up through the iframe unchanged and
// are not redefined here.
//
// Two directional maps (rather than one) so the compiler rejects a message sent
// the wrong way. `as const` objects rather than TS enums, which this package's
// `erasableSyntaxOnly` forbids.
//
// Blocking `input()`: the iframe's service worker reports AWAITING_INPUT up
// through the iframe; the parent sends the user's line back down as SENDING_INPUT.

/** Query param the parent adds to the iframe URL so the sandbox knows which
 * origin to trust for postMessage and to post its results back to. */
export const PARENT_ORIGIN_PARAM = 'parentOrigin';

/**
 * Query param the parent adds to the iframe URL naming where the sandbox should
 * load pyodide + wheels from. It is the parent's configured base URL (an
 * origin-relative path like `/pyodide/<version>/`), which resolves against the
 * sandbox's own origin — so that origin must serve the assets at the same path.
 */
export const PYODIDE_BASE_PARAM = 'pyodideBase';

/** Parent page → sandbox iframe. */
export const ToSandboxMessage = {
  RUN: 'run',
  RESTART_WORKER: 'restart_worker',
  SENDING_INPUT: 'sending_input',
} as const;

/** Sandbox iframe → parent page. */
export const FromSandboxMessage = {
  READY: 'ready',
  AWAITING_INPUT: 'awaiting_input',
} as const;

export interface SandboxRunMessage {
  type: typeof ToSandboxMessage.RUN;
  id: string;
  python: string;
  files: WorkerFile[];
}

export interface SandboxRestartMessage {
  type: typeof ToSandboxMessage.RESTART_WORKER;
}

export interface SandboxSendingInputMessage {
  type: typeof ToSandboxMessage.SENDING_INPUT;
  id: string;
  value: string;
}

export type ToSandbox =
  | SandboxRunMessage
  | SandboxRestartMessage
  | SandboxSendingInputMessage;

export interface SandboxReadyMessage {
  type: typeof FromSandboxMessage.READY;
}

export interface SandboxAwaitingInputMessage {
  type: typeof FromSandboxMessage.AWAITING_INPUT;
  id: string;
}
