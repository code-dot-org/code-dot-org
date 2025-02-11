import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setAndSaveSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
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

const setUpPyodideWorker = () => {
  // @ts-expect-error because TypeScript does not like this syntax.
  const worker = new Worker(new URL('./pyodideWebWorker.ts', import.meta.url));

  callbacks = {};

  worker.onmessage = event => {
    const {type, id, message} = event.data as PyodideMessage;
    const onSuccess = callbacks[id];
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    switch (type) {
      case 'sysout':
      case 'syserr':
        // We currently treat sysout and syserr the same, but we may want to
        // change this in the future. Test output goes to syserr by default.
        if (message.startsWith(MessageTag.MATPLOTLIB_IMG)) {
          // This is a matplotlib image, so we need to append it to the output
          const image = message.slice(MessageTag.MATPLOTLIB_IMG.length + 1);
          consoleManager?.writeImage(image);
          break;
        }
        if (message.startsWith(MessageTag.NEIGHBORHOOD_SIGNAL)) {
          const neighborhood =
            CodebridgeRegistry.getInstance().getNeighborhood();
          if (neighborhood) {
            // Parse message string to NeighborhoodSignal.
            const data = parseMessageToNeighborhoodSignal(message);
            neighborhood.handleSignal(data);
          }
          break;
        }
        if (message.includes(MessageTag.INPUT_PROMPT)) {
          const prompt = message.replace(MessageTag.INPUT_PROMPT, '');
          consoleManager?.writePartialLine(prompt);
          break;
        }
        consoleManager?.writeConsoleMessage(message);
        break;
      case 'run_complete':
        consoleManager?.writeSystemMessage('Program completed.', appName);
        delete callbacks[id];
        onSuccess(event.data);
        break;
      case 'updated_source':
        getStore().dispatch(setAndSaveSource(message));
        break;
      case 'error':
        consoleManager?.writeErrorMessage(parseErrorMessage(message));
        break;
      case 'system_error':
        consoleManager?.writeSystemError(message, appName);
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Python Lab System Code Error', undefined, {message});
        break;
      case 'internal_error':
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Python Lab Internal Error', undefined, {message});
        break;
      case 'loading_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(false));
        break;
      case 'loaded_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(true));
        if (message && parseInt(message)) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .reportLoadTime('PythonLab.PyodideLoadTime', parseInt(message));
        }
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
      // a parmaeter to register() directly in order to set up inputServiceWorker as a service worker.
      const registration = await navigator.serviceWorker.register(
        new URL(
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
    validationFile?: ProjectFile
  ) => {
    id = createUuid();

    // Make sure async setup is done
    await initializeServiceWorker();
    return new Promise<PyodideMessage>(onSuccess => {
      callbacks[id] = onSuccess;
      const messageData = {
        python: script,
        id,
        source,
        validationFile,
        canSupportInput: canSupportInput(),
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

const restartPyodideIfProgramIsRunning = () => {
  // Only restart if there are pending callbacks, as that means the worker is currently
  // running a program.
  if (Object.keys(callbacks).length > 0) {
    pyodideWorker.terminate();
    pyodideWorker = setUpPyodideWorker();
    const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
    consoleManager?.writeSystemMessage('Program stopped.', appName);
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
