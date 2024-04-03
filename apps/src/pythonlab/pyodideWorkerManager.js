import {getStore} from '@cdo/apps/redux';
import {applyPatches, importFileCode} from './patches/pythonScriptUtils';
import {MATPLOTLIB_IMG_TAG} from './patches/patches';
import {
  appendOutputImage,
  appendSystemMessage,
  appendSystemOutMessage,
} from './pythonlabRedux';

// A default file to import into the user's script.
const otherFileContents = "def hello():\n  print('hello')\n";

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
  return (script, context) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise(onSuccess => {
      callbacks[id] = onSuccess;
      // Proof of concept that we can import a local file (in a multi-file scenario)
      let wrappedScript =
        importFileCode('helpers.py', otherFileContents) + script;
      wrappedScript = applyPatches(wrappedScript);
      const messageData = {
        ...context,
        python: wrappedScript,
        id,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

export {asyncRun};
