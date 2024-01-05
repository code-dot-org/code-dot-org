import {getStore} from '@cdo/apps/redux';
import {appendOutput} from './pythonlabRedux';

console.log('creating web worker');
// This syntax doesn't work with typescript, so this file is in js.
const pyodideWorker = new Worker(
  new URL('./pyodideWebWorker.js', import.meta.url)
);

const callbacks = {};

pyodideWorker.onmessage = event => {
  const {type, id, ...data} = event.data;
  if (type === 'sysout') {
    getStore().dispatch(appendOutput(data.message));
    return;
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
      script = 'import sys\nimport os\n' + script;
      script += '\nsys.stdout.flush()';
      script += '\nos.fsync(sys.stdout.fileno())\n';
      const messageData = {
        ...context,
        python: script,
        id,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

export {asyncRun};
