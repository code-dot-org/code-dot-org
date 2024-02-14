import {getStore} from '@cdo/apps/redux';
import {appendOutput} from './pythonlabRedux';

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
      // Add code to flush stdout to the user's script.
      // Proof of concept that we can import a local file (in a multi-file scenario)
      //let wrappedScript = importFileCode('helpers.py', otherFileContents);
      let wrappedScript = 'import sys\nimport os\n' + script;
      //wrappedScript += '\nsys.stdout.flush()';
      //wrappedScript += '\nos.fsync(sys.stdout.fileno())\n';
      const messageData = {
        ...context,
        python: wrappedScript,
        id,
      };
      pyodideWorker.postMessage(messageData);
    });
  };
})();

// Helper function that adds code to import a local file for use in the user's script.
const importFileCode = (fileName, fileContents) => {
  return `
import importlib
from pathlib import Path
Path("${fileName}").write_text("""\
${fileContents}
"""
)
importlib.invalidate_caches()
`;
};

export {asyncRun};
