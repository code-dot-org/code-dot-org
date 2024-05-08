import {getStore} from '@cdo/apps/redux';
import {
  applyPatches,
  deleteCachedUserModules,
} from './pythonHelpers/pythonScriptUtils';
import {MATPLOTLIB_IMG_TAG} from './pythonHelpers/patches';
import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
} from './pythonlabRedux';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import MetricsReporter from '../lib/metrics/MetricsReporter';
import {setAndSaveProjectSource} from '../lab2/redux/lab2ProjectRedux';

// This syntax doesn't work with typescript, so this file is in js.
const pyodideWorker = new Worker(
  new URL('./pyodideWebWorker.js', import.meta.url)
);

const callbacks = {};

pyodideWorker.onmessage = event => {
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
    getStore().dispatch(appendSystemMessage(`Error: ${message}`));
    return;
  } else if (type === 'internal_error') {
    MetricsReporter.logError({
      type: 'PythonLabInternalError',
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

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (script, source) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise(onSuccess => {
      callbacks[id] = onSuccess;
      let wrappedScript = applyPatches(script);
      wrappedScript =
        wrappedScript + deleteCachedUserModules(source, MAIN_PYTHON_FILE);
      const messageData = {
        python: wrappedScript,
        id,
        source,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

export {asyncRun};
