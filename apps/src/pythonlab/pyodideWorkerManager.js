import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
  appendErrorMessage,
  appendSystemError,
} from '@codebridge/redux/consoleRedux';

import {setAndSaveProjectSource} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {getStore} from '@cdo/apps/redux';

import {parseErrorMessage} from './pythonHelpers/messageHelpers';
import {MATPLOTLIB_IMG_TAG} from './pythonHelpers/patches';

let callbacks = {};
let interruptBuffer = undefined;

const setUpPyodideWorker = () => {
  // This syntax doesn't work with typescript, so this file is in js.
  const worker = new Worker(new URL('./pyodideWebWorker.js', import.meta.url));

  callbacks = {};
  if (window.crossOriginIsolated) {
    // eslint-disable-next-line no-undef
    interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    worker.postMessage({
      cmd: 'setInterruptBuffer',
      interruptBuffer,
    });
  }

  worker.onmessage = event => {
    const {type, id, message} = event.data;
    if (type === 'sysout' || type === 'syserr') {
      if (message.startsWith(MATPLOTLIB_IMG_TAG)) {
        // This is a matplotlib image, so we need to append it to the output
        const image = message.slice(MATPLOTLIB_IMG_TAG.length + 1);
        getStore().dispatch(appendOutputImage(image));
        return;
      }
      getStore().dispatch(appendSystemOutMessage(message));
      return;
    } else if (type === 'run_complete') {
      getStore().dispatch(appendSystemMessage('Program completed.'));
    } else if (type === 'updated_source') {
      getStore().dispatch(setAndSaveProjectSource({source: message}));
      return;
    } else if (type === 'error') {
      getStore().dispatch(appendErrorMessage(parseErrorMessage(message)));
      return;
    } else if (type === 'internal_error') {
      MetricsReporter.logError({
        type: 'PythonLabInternalError',
        message,
      });
      return;
    } else if (type === 'system_error') {
      getStore().dispatch(appendSystemError(message));
      MetricsReporter.logError({
        type: 'PythonLabSystemCodeError',
        message,
      });
      return;
    } else {
      console.warn(
        `Unknown message type ${type} with message ${message} from pyodideWorker.`
      );
      return;
    }
    const onSuccess = callbacks[id];
    delete callbacks[id];
    onSuccess(event.data);
  };

  return worker;
};

let pyodideWorker = setUpPyodideWorker();

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (script, source) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise(onSuccess => {
      callbacks[id] = onSuccess;
      const messageData = {
        python: script,
        id,
        source,
      };
      pyodideWorker.postMessage({cmd: 'runCode', metadata: messageData});
    });
  };
})();

const stopAndRestartPyodideWorker = () => {
  if (window.crossOriginIsolated && interruptBuffer) {
    interruptBuffer[0] = 2;
  } else {
    pyodideWorker.terminate();
    pyodideWorker = setUpPyodideWorker();
  }
};

export {asyncRun, stopAndRestartPyodideWorker};
