import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import ConsoleManager from '@codebridge/Console/ConsoleManager';
import {
  getErrorMessage,
  getImageMessage,
  getSystemError,
  getSystemMessage,
} from '@codebridge/Console/MessageHelpers';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setAndSaveSource} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {
  setCodeEnvironmentError,
  setHasError,
  setLoadedCodeEnvironment,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {ConsoleSignalType} from '@cdo/apps/miniApps/neighborhood/constants';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {getStore} from '@cdo/apps/redux';
import {getInnerEnvironment} from '@cdo/apps/util/codeprojectsPreviewOrigin';
import {getPreviewDomain} from '@cdo/apps/util/sandboxedPreviewDomain';
import {createUuid} from '@cdo/apps/utils';

import {
  parseMessageToNeighborhoodSignal,
  parseErrorMessage,
} from './pythonHelpers/messageHelpers';
import {MessageTag} from './pythonHelpers/patches';
import {
  FromPyodideSandboxMessage,
  ToPyodideSandboxMessage,
} from './sandbox/constants';
import {PyodideMessage} from './types';

let callbacks: {[key: string]: (event: PyodideMessage) => void} = {};
const appName = 'pythonlab';
let lastInputId = '';
let outputToNeighborhood = false;
let directLogsToDevConsole = false;
let loadedMessageHandlers = false;
let sandboxServiceWorkerUnavailable = false;

const getMessageHandlers = (
  consoleManager: ConsoleManager | null,
  neighborhood: Neighborhood | null,
  outputToNeighborhood: boolean
) => {
  if (outputToNeighborhood && neighborhood) {
    loadedMessageHandlers = true;
    return {
      writeConsoleMessage: (line: string) =>
        neighborhood.handleSignal({
          value: ConsoleSignalType.CONSOLE_LOG,
          detail: line,
        }),
      writePartialLine: (partialLine: string) =>
        neighborhood.handleSignal({
          value: ConsoleSignalType.PARTIAL_LOG,
          detail: partialLine,
        }),
    };
  } else if (consoleManager) {
    loadedMessageHandlers = true;
    return {
      writeConsoleMessage:
        consoleManager.writeConsoleMessage.bind(consoleManager),
      writePartialLine: consoleManager.writePartialLine.bind(consoleManager),
    };
  } else {
    loadedMessageHandlers = false;
    return {
      writeConsoleMessage: (message: string) => console.log(message),
      writePartialLine: (message: string) => console.log(message),
    };
  }
};

let {writeConsoleMessage, writePartialLine} = getMessageHandlers(
  CodebridgeRegistry.getInstance().getConsoleManager(),
  CodebridgeRegistry.getInstance().getNeighborhood(),
  false
);

// The pyodide worker runs inside a hidden iframe on our dedicated "preview"
// subdomain, shared with Web Lab. This is a separate base domain to ensure
// the worker never has access to the user's `studio.code.org` cookies/session.
// See "apps/src/pythonlab/sandbox/pyodideSandboxWorkerManager.ts"
// and "apps/src/pythonlab/README.md" for the full architecture.
const getSandboxOrigin = () => {
  const {subdomain, port} = getInnerEnvironment();
  return `${
    location.protocol
  }//pyodide-sandbox.preview.${subdomain}${getPreviewDomain()}${port}`;
};

// Resolved on first use rather than at module load, then pinned so the iframe
// src and the postMessage origin checks can't diverge if the DCDO-driven
// preview domain changes mid-session.
let cachedSandboxOrigin: string | undefined;
const sandboxOrigin = () => (cachedSandboxOrigin ??= getSandboxOrigin());

// How long to wait for the sandbox iframe to report ready before telling the user
// their network is blocking it. A slow but working sandbox will clear the message if
// the sandbox eventually reports ready.
const SANDBOX_READY_TIMEOUT_MS = 15000;

const SANDBOX_UNREACHABLE_MESSAGE =
  'Your browser may be blocking the setup of Python Lab. You may need to ' +
  'adjust your firewall settings. See the technical requirements page ' +
  '(https://code.org/educate/it) for which site(s) you need ' +
  'to unblock. If you need assistance, please reach out to support@code.org.';

const handlePyodideMessage = (data: PyodideMessage) => {
  const {type, id, message} = data;
  const onSuccess = callbacks[id];

  const neighborhood = CodebridgeRegistry.getInstance().getNeighborhood();
  if (!loadedMessageHandlers) {
    const messageHandlers = getMessageHandlers(
      CodebridgeRegistry.getInstance().getConsoleManager(),
      neighborhood,
      false
    );
    writeConsoleMessage = messageHandlers.writeConsoleMessage;
    writePartialLine = messageHandlers.writePartialLine;
  }

  switch (type) {
    case 'sysout':
    case 'syserr':
      // Write messages to the dev console if the flag is set.
      // We set this flag if we are either loading pyodide or loading packages,
      // to avoid showing students confusing loading messages.
      if (directLogsToDevConsole) {
        console.log(message);
        break;
      }
      // We currently treat sysout and syserr the same, but we may want to
      // change this in the future. Test output goes to syserr by default.
      if (message.startsWith(MessageTag.MATPLOTLIB_IMG)) {
        // This is a matplotlib image, so we need to append it to the output
        const image = message.slice(MessageTag.MATPLOTLIB_IMG.length + 1);
        writeConsoleMessage(getImageMessage(image));
        break;
      }
      if (message.startsWith(MessageTag.NEIGHBORHOOD_SIGNAL)) {
        if (neighborhood) {
          // Parse message string to NeighborhoodSignal.
          const data = parseMessageToNeighborhoodSignal(message);
          neighborhood.handleSignal(data);
        }
        break;
      }
      if (message.includes(MessageTag.INPUT_PROMPT)) {
        const prompt = message.replace(MessageTag.INPUT_PROMPT, '');
        writePartialLine(prompt);
        break;
      }
      writeConsoleMessage(message);
      break;
    case 'run_complete': {
      // Write a blank line to the console if we are not on a neighborhood level (which handles
      // this for us).
      if (!outputToNeighborhood) {
        writeConsoleMessage('');
      }
      delete callbacks[id];
      onSuccess(data);
      break;
    }
    case 'updated_source':
      getStore().dispatch(setAndSaveSource(message));
      break;
    case 'error':
      getStore().dispatch(setHasError(true));
      if (message.includes(MessageTag.INPUT_FAILED)) {
        writeConsoleMessage(getErrorMessage(pythonlabI18n.inputFailed()));
        break;
      }
      writeConsoleMessage(getErrorMessage(parseErrorMessage(message, false)));
      break;
    case 'system_error':
      getStore().dispatch(setHasError(true));
      writeConsoleMessage(
        getSystemError(parseErrorMessage(message, true), appName)
      );
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Python Lab System Code Error', undefined, {message});
      break;
    case 'internal_error':
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Python Lab Internal Error', undefined, {message});
      break;
    case 'load_failed':
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Failed to load packages', undefined, {message});
      break;
    case 'loading_pyodide':
      directLogsToDevConsole = true;
      getStore().dispatch(setLoadedCodeEnvironment(false));
      break;
    case 'loaded_pyodide':
      directLogsToDevConsole = false;
      getStore().dispatch(setLoadedCodeEnvironment(true));
      if (message && parseInt(message)) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .reportLoadTime('PythonLab.PyodideLoadTime', parseInt(message));
      }
      break;
    case 'loading_packages':
      directLogsToDevConsole = true;
      break;
    case 'loaded_packages':
      directLogsToDevConsole = false;
      break;
    default:
      console.warn(
        `Unknown message type ${type} with message ${message} from pyodideWorker.`
      );
      break;
  }
};

const setUpPyodideSandbox = () => {
  callbacks = {};

  const unreachableTimeout = setTimeout(() => {
    getStore().dispatch(setCodeEnvironmentError(SANDBOX_UNREACHABLE_MESSAGE));
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logWarning(
        `Pyodide sandbox at ${sandboxOrigin()} did not report ready within ${SANDBOX_READY_TIMEOUT_MS}ms`
      );
  }, SANDBOX_READY_TIMEOUT_MS);

  const readyPromise = new Promise<void>(resolve => {
    window.addEventListener('message', event => {
      // The sandbox iframe is the only origin we should ever trust messages from.
      if (event.origin !== sandboxOrigin()) {
        return;
      }
      switch (event.data?.type) {
        case FromPyodideSandboxMessage.READY:
          clearTimeout(unreachableTimeout);
          getStore().dispatch(setCodeEnvironmentError(null));
          resolve();
          break;
        case FromPyodideSandboxMessage.SERVICE_WORKER_UNAVAILABLE:
          sandboxServiceWorkerUnavailable = true;
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logWarning('Service worker unavailable');
          break;
        case FromPyodideSandboxMessage.SERVICE_WORKER_REGISTRATION_FAILED:
          sandboxServiceWorkerUnavailable = true;
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError('Failed to register input service worker', undefined, {
              error: event.data.error,
            });
          break;
        case FromPyodideSandboxMessage.AWAITING_INPUT:
          lastInputId = event.data.id;
          break;
        default:
          handlePyodideMessage(event.data as PyodideMessage);
          break;
      }
    });
  });

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = sandboxOrigin();
  document.body.appendChild(iframe);

  return {iframe, readyPromise};
};

const {iframe: pyodideSandboxIframe, readyPromise: pyodideSandboxReadyPromise} =
  setUpPyodideSandbox();

const canSupportInput = () => {
  return !sandboxServiceWorkerUnavailable;
};

const asyncRun = (() => {
  let id = ''; // identify a Promise
  return async (
    script: string,
    source: MultiFileSource,
    validationFile?: ProjectFile,
    shouldOutputToNeighborhood?: boolean
  ) => {
    id = createUuid();

    // Make sure the sandbox iframe has loaded and is ready to receive messages.
    await pyodideSandboxReadyPromise;
    // Reset error state
    getStore().dispatch(setHasError(false));
    outputToNeighborhood = !!shouldOutputToNeighborhood;
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    const neighborhood = CodebridgeRegistry.getInstance().getNeighborhood();
    const messageHandlers = getMessageHandlers(
      consoleManager,
      neighborhood,
      outputToNeighborhood
    );
    writeConsoleMessage = messageHandlers.writeConsoleMessage;
    writePartialLine = messageHandlers.writePartialLine;

    return new Promise<PyodideMessage>(onSuccess => {
      callbacks[id] = onSuccess;
      pyodideSandboxIframe.contentWindow?.postMessage(
        {
          type: ToPyodideSandboxMessage.RUN,
          python: script,
          id,
          source,
          validationFile,
        },
        sandboxOrigin()
      );
    });
  };
})();

const restartPyodideIfProgramIsRunning = () => {
  // Only report stopping if the user was shown a running program. That outlasts
  // the run itself for some programs -- the neighborhood keeps animating after
  // its callbacks resolve -- so isRunning decides whether there was anything to stop.
  // We send via the console manager rather than the message handler because the neighborhood
  // stops processing messages on stop, and we want to always show this to the user.
  if (getStore().getState().lab2System.isRunning) {
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    consoleManager?.writeConsoleMessage(
      getSystemMessage(pythonlabI18n.programStopped(), appName)
    );
    consoleManager?.writeConsoleMessage('');
  }

  // Only restart if there are pending callbacks, as that means the sandbox is currently
  // running a program.
  if (Object.keys(callbacks).length > 0) {
    callbacks = {};
    pyodideSandboxIframe.contentWindow?.postMessage(
      {type: ToPyodideSandboxMessage.RESTART_WEB_WORKER},
      sandboxOrigin()
    );
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('PythonLab.PyodideRestarted');
  }
};

const sendInput = (value: string): void => {
  if (!canSupportInput()) {
    return;
  }
  if (lastInputId === '') {
    console.error('Worker not awaiting input');
    return;
  }

  // Send the input value down to the sandbox, which forwards it to its own
  // registered input service worker.
  pyodideSandboxIframe.contentWindow?.postMessage(
    {
      type: ToPyodideSandboxMessage.SENDING_INPUT,
      value,
      id: lastInputId,
    },
    sandboxOrigin()
  );
  lastInputId = '';
};

export {asyncRun, restartPyodideIfProgramIsRunning, sendInput};
