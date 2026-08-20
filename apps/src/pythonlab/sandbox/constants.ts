import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

import type {ExternalFileContents} from '../pythonHelpers/externalFileContents';

// Message types exchanged between pyodideSandboxManager.ts (running on studio.code.org)
// and pyodideSandboxWorkerManager.ts (running in a hidden iframe on the isolated
// pyodide-sandbox.preview.<domain> origin, see getPreviewDomain()). Defined here so the
// string values can't drift between the two webpack bundles that share this contract.
// Messages produced directly by pyodideWebWorker.ts (sysout, syserr, run_complete, etc,
// see MessageType in ../types) are relayed through unchanged and are not listed here.
export enum ToPyodideSandboxMessage {
  RUN = 'run',
  SENDING_INPUT = 'sending_input',
  RESTART_WEB_WORKER = 'restart_web_worker',
}

export enum FromPyodideSandboxMessage {
  READY = 'ready',
  SERVICE_WORKER_UNAVAILABLE = 'service_worker_unavailable',
  SERVICE_WORKER_REGISTRATION_FAILED = 'service_worker_registration_failed',
  AWAITING_INPUT = 'awaiting_input',
}

export interface PyodideSandboxRunMessage {
  type: ToPyodideSandboxMessage.RUN;
  id: string;
  python: string;
  source: MultiFileSource;
  validationFile?: ProjectFile;
  // Bytes of the project's url-backed files, fetched on studio.code.org because
  // this origin cannot read studio's assets.
  externalFiles?: ExternalFileContents;
}

export interface PyodideSandboxSendingInputMessage {
  type: ToPyodideSandboxMessage.SENDING_INPUT;
  value: string;
  id: string;
}

export interface PyodideSandboxAwaitingInputMessage {
  type: FromPyodideSandboxMessage.AWAITING_INPUT;
  id: string;
}

export interface PyodideSandboxServiceWorkerRegistrationFailedMessage {
  type: FromPyodideSandboxMessage.SERVICE_WORKER_REGISTRATION_FAILED;
  error: string;
}
