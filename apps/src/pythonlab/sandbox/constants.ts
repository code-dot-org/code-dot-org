import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

// Message types exchanged between pyodideWorkerManager.ts (running on studio.code.org)
// and pyodideSandbox.ts (running in a hidden iframe on the isolated
// pyodide-sandbox.preview.codeprojects.org origin). Defined here so the string values
// can't drift between the two webpack bundles that share this contract.
// Messages produced directly by pyodideWebWorker.ts (sysout, syserr, run_complete, etc,
// see MessageType in ../types) are relayed through unchanged and are not listed here.
export enum PyodideSandboxMessageType {
  // sandbox -> outer
  SANDBOX_READY = 'sandbox_ready',
  SERVICE_WORKER_UNAVAILABLE = 'sandbox_service_worker_unavailable',
  AWAITING_INPUT = 'sandbox_awaiting_input',
  // outer -> sandbox
  RUN = 'sandbox_run',
  SENDING_INPUT = 'sandbox_sending_input',
  RESTART_WORKER = 'sandbox_restart_worker',
}

export interface PyodideSandboxRunMessage {
  type: PyodideSandboxMessageType.RUN;
  id: string;
  python: string;
  source: MultiFileSource;
  validationFile?: ProjectFile;
}

export interface PyodideSandboxSendingInputMessage {
  type: PyodideSandboxMessageType.SENDING_INPUT;
  value: string;
  id: string;
}

export interface PyodideSandboxAwaitingInputMessage {
  type: PyodideSandboxMessageType.AWAITING_INPUT;
  id: string;
}
