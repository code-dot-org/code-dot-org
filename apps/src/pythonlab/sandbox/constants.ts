import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

// Message types exchanged between pyodideSandboxManager.ts (running on studio.code.org)
// and pyodideWorkerManager.ts (running in a hidden iframe on the isolated
// pyodide-sandbox.preview.codeprojects.org origin). Defined here so the string values
// can't drift between the two webpack bundles that share this contract.
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
  AWAITING_INPUT = 'awaiting_input',
}

export interface PyodideSandboxRunMessage {
  type: ToPyodideSandboxMessage.RUN;
  id: string;
  python: string;
  source: MultiFileSource;
  validationFile?: ProjectFile;
  // studio.code.org's own origin, and the current project's channel id. Together these
  // let the worker patch requests.get() to route through the dashboard's XHR proxy.
  // channelId is omitted for levels with no project (exemplars, start mode).
  host: string;
  channelId?: string;
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
