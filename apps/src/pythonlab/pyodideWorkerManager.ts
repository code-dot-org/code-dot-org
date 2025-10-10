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
  setHasError,
  setLoadedCodeEnvironment,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {ConsoleSignalType} from '@cdo/apps/miniApps/neighborhood/constants';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {getStore} from '@cdo/apps/redux';
import {createUuid} from '@cdo/apps/utils';

import {AWAITING_INPUT, SENDING_INPUT} from './pythonHelpers/constants';
import {
  parseMessageToNeighborhoodSignal,
  parseErrorMessage,
} from './pythonHelpers/messageHelpers';
import {MessageTag} from './pythonHelpers/patches';
import {PyodideMessage} from './types';

let callbacks: {[key: string]: (event: PyodideMessage) => void} = {};
const appName = 'pythonlab';
let inputServiceWorker: ServiceWorker | undefined;
let lastInputId = '';
let setupPromise: Promise<void> | undefined;
let outputToNeighborhood = false;
let directLogsToDevConsole = false;

const getMessageHandlers = (
  consoleManager: ConsoleManager | null,
  neighborhood: Neighborhood | null,
  outputToNeighborhood: boolean
) => {
  if (outputToNeighborhood && neighborhood) {
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
    return {
      writeConsoleMessage:
        consoleManager.writeConsoleMessage.bind(consoleManager),
      writePartialLine: consoleManager.writePartialLine.bind(consoleManager),
    };
  } else {
    return {
      writeConsoleMessage: (message: string) => console.log(message),
      writePartialLine: (message: string) => console.log(message),
    };
  }
};

let {writeConsoleMessage, writePartialLine} = getMessageHandlers(
  null,
  null,
  false
);

const setUpPyodideWorker = () => {
  // The web worker is versioned to ensure the correct version is loaded.
  // Update the version if you update the web worker.
  const worker = new Worker(
    /* webpackChunkName: "pyodide-web-worker-1.0.0" */ new URL(
      './pyodideWebWorker.ts',
      // @ts-expect-error because TypeScript does not like this syntax.
      import.meta.url
    )
  );

  callbacks = {};

  worker.onmessage = event => {
    const {type, id, message} = event.data as PyodideMessage;
    const onSuccess = callbacks[id];

    const neighborhood = CodebridgeRegistry.getInstance().getNeighborhood();

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
        onSuccess(event.data);
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
        writeConsoleMessage(getErrorMessage(parseErrorMessage(message)));
        break;
      case 'system_error':
        getStore().dispatch(setHasError(true));
        writeConsoleMessage(getSystemError(message, appName));
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
        writeConsoleMessage(getErrorMessage(pythonlabI18n.loadFailed()));
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

  return worker;
};

const canSupportInput = () => {
  // We can support input if service workers are supported by the current browser.
  return 'serviceWorker' in navigator;
};

const registerServiceWorker = async () => {
  // No-op if service workers are not supported.
  if (canSupportInput()) {
    try {
      // Do not move the url into a variable, because webpack needs it to be passed as
      // a parameter to register() directly in order to set up inputServiceWorker as a service worker.
      // The service worker is versioned to ensure the correct version is loaded.
      // Update the version if you update the service worker.
      const registration = await navigator.serviceWorker.register(
        new URL(
          /* webpackChunkName: "input-service-worker-1.0.0" */
          './inputServiceWorker.js',
          // @ts-expect-error because TypeScript does not like this syntax.
          import.meta.url
        )
      );

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              inputServiceWorker = installingWorker;
            }
          });
        }
      });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
      // Log that we failed to register the service worker.
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Failed to register input service worker', undefined, {
          error,
        });
    }

    navigator.serviceWorker.onmessage = event => {
      if (event.data.type === AWAITING_INPUT) {
        if (event.source instanceof ServiceWorker) {
          // Update the service worker reference, in case the service worker is different to the one we registered
          inputServiceWorker = event.source;
        }
        lastInputId = event.data.id;
      }
    };
  } else if (!('serviceWorker' in navigator)) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logWarning('Service worker unavailable');
  }
};

const initializeServiceWorker = async () => {
  if (!setupPromise) {
    setupPromise = registerServiceWorker();
  }
  await setupPromise;
};

initializeServiceWorker();

let pyodideWorker = setUpPyodideWorker();

const asyncRun = (() => {
  let id = ''; // identify a Promise
  return async (
    script: string,
    source: MultiFileSource,
    validationFile?: ProjectFile,
    shouldOutputToNeighborhood?: boolean
  ) => {
    id = createUuid();

    // Make sure async setup is done
    await initializeServiceWorker();
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
      const messageData = {
        python: script,
        id,
        source,
        validationFile,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

const restartPyodideIfProgramIsRunning = () => {
  // Always send a stop message, as some programs will still
  // look like they are "running" to the user even if they aren't truly running
  // (for example, the neighborhood). We send via the console manager rather than
  // the message handler because the neighborhood stops processing messages on stop,
  // and we want to always show this to the user.
  const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
  consoleManager?.writeConsoleMessage(
    getSystemMessage(pythonlabI18n.programStopped(), appName)
  );
  consoleManager?.writeConsoleMessage('');

  // Only restart if there are pending callbacks, as that means the worker is currently
  // running a program.
  if (Object.keys(callbacks).length > 0) {
    pyodideWorker.terminate();
    pyodideWorker = setUpPyodideWorker();
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

  if (!inputServiceWorker) {
    console.error('No service worker registered');
    return;
  }

  // Send a message to the service worker with the input value.
  inputServiceWorker.postMessage({
    type: SENDING_INPUT,
    value,
    id: lastInputId,
  });
  lastInputId = '';
};

export {asyncRun, restartPyodideIfProgramIsRunning, sendInput};
