import {getStore} from '@cdo/apps/redux';
import {
  applyPatches,
  deleteCachedUserModules,
} from './patches/pythonScriptUtils';
import {MATPLOTLIB_IMG_TAG} from './patches/patches';
import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
} from './pythonlabRedux';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';

// This syntax doesn't work with typescript, so this file is in js.
const pyodideWorker = new Worker(
  new URL('./pyodideWebWorker.js', import.meta.url)
);

const callbacks = {};

pyodideWorker.onmessage = event => {
  const {type, id, ...data} = event.data;
  if (type === 'sysout') {
    if (data.message.startsWith(MATPLOTLIB_IMG_TAG)) {
      // This is a matplotlib image, so we need to append it to the output
      const image = data.message.slice(MATPLOTLIB_IMG_TAG.length + 1);
      getStore().dispatch(appendOutputImage(image));
      return;
    }
    getStore().dispatch(appendSystemOutMessage(data.message));
    return;
  } else if (type === 'run_complete') {
    getStore().dispatch(appendSystemMessage('Program completed.'));
  } else if (type === 'error') {
    getStore().dispatch(appendSystemMessage(`Error: ${data.error}`));
  } else {
    console.warn(`Unknown message type ${type} from pyodideWorker.`);
    console.warn({data});
  }
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
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
