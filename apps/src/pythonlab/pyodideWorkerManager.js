console.log('creating web worker');
// This syntax doesn't work with typescript, so this file is in js.
const pyodideWorker = new Worker(
  new URL('./pyodideWebWorker.js', import.meta.url)
);

const callbacks = {};

pyodideWorker.onmessage = event => {
  console.log('in this on success callback');
  const {id, ...data} = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  console.log('in async run');
  let id = 0; // identify a Promise
  return (script, context) => {
    console.log('in first callback');
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise(onSuccess => {
      console.log('in second callback');
      callbacks[id] = onSuccess;
      const messageData = {
        ...context,
        python: script,
        id,
      };
      console.log({messageData});
      pyodideWorker.postMessage(messageData);
    });
  };
})();

export {asyncRun};
