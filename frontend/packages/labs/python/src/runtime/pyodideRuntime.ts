import {CodebridgeRegistry, getImageMessage} from '@code-dot-org/codebridge';
import store, {labSystemActions} from '@code-dot-org/lab/redux';

import {MessageTag} from './input/constants';
import type {PyodideMessage, WorkerFile} from './messages';

// Shared by both execution backends — the direct worker (pyodideWorkerManager)
// and the iframe sandbox (sandbox/pyodideSandboxManager). The façade
// (pyodideManager) picks one; the rest of Python Lab talks to this interface.

/** The execution backend Python Lab drives. */
export interface PyodideRuntime {
  /** Start loading pyodide ahead of the first run (e.g. at lab mount). */
  preloadPyodide(): void;
  /** Run a program; resolves when it completes. */
  asyncRun(python: string, files: WorkerFile[]): Promise<void>;
  /** Stop a running program by restarting the worker. No-op if idle. */
  restartWorkerIfRunning(): void;
  /** Supply a line of stdin to a program blocked on `input()`. */
  sendInput(value: string): void;
}

/** Write one line to the Codebridge console, if it is mounted. */
export function writeConsole(message: string) {
  CodebridgeRegistry.getConsoleManager()?.writeConsoleMessage(message);
}

/** Write output that is not newline-terminated (an input prompt). */
function writePartialConsole(message: string) {
  CodebridgeRegistry.getConsoleManager()?.writePartialLine(message);
}

/**
 * Route one message emitted by pyodideWebWorker.ts to the console and the base
 * `labSystem` slice. Both backends share it: the direct manager wires a worker's
 * `onmessage` to it; the sandbox manager feeds it messages relayed up from the
 * iframe. `onRunComplete` is called with the finished run's id so the caller can
 * resolve the matching run promise.
 */
export function routeWorkerMessage(
  data: PyodideMessage,
  onRunComplete: (id: string) => void,
) {
  const {type, id, message} = data;
  switch (type) {
    case 'sysout':
    case 'syserr':
      // A matplotlib figure arrives as `MATPLOTLIB_SHOW_IMG <base64>`; render it
      // as an inline console image rather than printing the base64.
      if (message?.startsWith(MessageTag.MATPLOTLIB_IMG)) {
        const image = message.slice(MessageTag.MATPLOTLIB_IMG.length + 1);
        writeConsole(getImageMessage(image));
      } else if (message?.startsWith(MessageTag.INPUT_PROMPT)) {
        // An input prompt is printed with a tag and no trailing newline, so the
        // user types on the same line; render it as a partial line.
        writePartialConsole(message.slice(MessageTag.INPUT_PROMPT.length));
      } else {
        writeConsole(message ?? '');
      }
      break;
    case 'error':
      store.dispatch(labSystemActions.setHasError(true));
      writeConsole(
        message?.includes(MessageTag.INPUT_FAILED)
          ? 'Input is not supported here.'
          : (message ?? ''),
      );
      break;
    case 'run_complete':
      writeConsole('');
      onRunComplete(id);
      break;
    case 'loading_pyodide':
      store.dispatch(labSystemActions.setLoadedCodeEnvironment(false));
      break;
    case 'loaded_pyodide':
      store.dispatch(labSystemActions.setLoadedCodeEnvironment(true));
      break;
    default:
      break;
  }
}
