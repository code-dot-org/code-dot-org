import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
  appendErrorMessage,
  appendSystemError,
} from '@codebridge/redux/consoleRedux';

import {setAndSaveProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {setLoadedCodeEnvironment} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getStore} from '@cdo/apps/redux';

import {parseErrorMessage} from './pythonHelpers/messageHelpers';
import {MATPLOTLIB_IMG_TAG} from './pythonHelpers/patches';
import {PyodideMessage} from './types';

let callbacks: {[key: number]: (event: PyodideMessage) => void} = {};

const setUpPyodideWorker = () => {
  // @ts-expect-error because TypeScript does not like this syntax.
  const worker = new Worker(new URL('./pyodideWebWorker.ts', import.meta.url));

  callbacks = {};

  worker.onmessage = event => {
    const {type, id, message} = event.data as PyodideMessage;
    const onSuccess = callbacks[id];
    switch (type) {
      case 'sysout':
      case 'syserr':
        // We currently treat sysout and syserr the same, but we may want to
        // change this in the future. Test output goes to syserr by default.
        if (message.startsWith(MATPLOTLIB_IMG_TAG)) {
          // This is a matplotlib image, so we need to append it to the output
          const image = message.slice(MATPLOTLIB_IMG_TAG.length + 1);
          getStore().dispatch(appendOutputImage(image));
          break;
        }
        getStore().dispatch(appendSystemOutMessage(message));
        break;
      case 'run_complete':
        getStore().dispatch(appendSystemMessage('Program completed.'));
        delete callbacks[id];
        onSuccess(event.data);
        break;
      case 'updated_source':
        getStore().dispatch(setAndSaveProjectSource({source: message}));
        break;
      case 'error':
        getStore().dispatch(appendErrorMessage(parseErrorMessage(message)));
        break;
      case 'system_error':
        getStore().dispatch(appendSystemError(message));
        MetricsReporter.logError({
          type: 'PythonLabSystemCodeError',
          message,
        });
        break;
      case 'internal_error':
        MetricsReporter.logError({
          type: 'PythonLabInternalError',
          message,
        });
        break;
      case 'loading_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(false));
        break;
      case 'loaded_pyodide':
        getStore().dispatch(setLoadedCodeEnvironment(true));
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
    getStore().dispatch(appendSystemMessage('Program stopped.'));
  }
};

export {asyncRun, restartPyodideIfProgramIsRunning};
