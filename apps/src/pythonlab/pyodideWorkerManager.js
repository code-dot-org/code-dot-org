import {getStore} from '@cdo/apps/redux';
import {applyPatches} from './patches/pythonScriptUtils';
import {MATPLOTLIB_IMG_TAG} from './patches/patches';
import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
} from './pythonlabRedux';

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
  }
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (script, sources) => {
    console.log({script, sources});
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise(onSuccess => {
      callbacks[id] = onSuccess;
      const wrappedScript = applyPatches(script);
      const messageData = {
        python: wrappedScript,
        id,
        sources,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

export {asyncRun};
