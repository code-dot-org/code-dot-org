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
// `erasableSyntaxOnly` forbids. Stdin `input()` support (a SENDING_INPUT /
// AWAITING_INPUT pair plus an input service worker) is deferred, matching the
// direct-worker runtime.

/** Query param the parent adds to the iframe URL so the sandbox knows which
 * origin to trust for postMessage and to post its results back to. */
export const PARENT_ORIGIN_PARAM = 'parentOrigin';

/** Parent page → sandbox iframe. */
export const ToSandboxMessage = {
  RUN: 'run',
  RESTART_WORKER: 'restart_worker',
} as const;

/** Sandbox iframe → parent page. */
export const FromSandboxMessage = {
  READY: 'ready',
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

export type ToSandbox = SandboxRunMessage | SandboxRestartMessage;

export interface SandboxReadyMessage {
  type: typeof FromSandboxMessage.READY;
}
