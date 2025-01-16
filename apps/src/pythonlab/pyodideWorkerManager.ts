import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setAndSaveSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getStore} from '@cdo/apps/redux';

import {NeighborhoodSignal} from '../miniApps/neighborhood/types';

import {parseErrorMessage} from './pythonHelpers/messageHelpers';
import {MessageTag} from './pythonHelpers/patches';
import {PyodideMessage} from './types';

let callbacks: {[key: number]: (event: PyodideMessage) => void} = {};
const appName = 'pythonlab';

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
          console.log('message', message);
          const neighborhood =
            CodebridgeRegistry.getInstance().getNeighborhood();
          if (neighborhood) {
            // Parse message string to NeighborhoodSignal.
            const data = parseMessageToNeighborhoodSignal(message);
            console.log('data', data);
            neighborhood.handleSignal(data as NeighborhoodSignal);
          }
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

let pyodideWorker = setUpPyodideWorker();

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (
    script: string,
    source: MultiFileSource,
    validationFile?: ProjectFile
  ) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
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

// This function parses the message string (example: '[PAINTER] PAINT {"color": "Blue"}') to a NeighborhoodSignal.
const parseMessageToNeighborhoodSignal = (
  message: string
): NeighborhoodSignal => {
  const regex = /^\[(\w+)]\s+([^\s]+)(?:\s+(\{.*\}))?$/;

  const match = message.match(regex);
  if (!match) {
    throw new Error('Invalid input format');
  }
  const [, , value, detail] = match;

  const signal = {
    value,
  } as NeighborhoodSignal;

  if (detail) {
    signal.detail = JSON.parse(detail); // Parse the detail as JSON
  }
  return signal;
};

// const findEnumKey(str: string): NeighborhoodSignalType | undefined => {
//   if (str in NeighborhoodSignalType) {
//     return NeighborhoodSignalType[str as keyof typeof NeighborhoodSignalType];
//   }
//   return undefined;
// };

export {asyncRun, restartPyodideIfProgramIsRunning};
