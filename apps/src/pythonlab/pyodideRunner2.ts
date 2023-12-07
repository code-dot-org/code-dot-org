console.log('creating web worker');
const pyodideWorker = new Worker(
  new URL('./pyodideWebWorker.js', import.meta.url)
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callbacks: {[key: number]: (data: any) => void} = {};

pyodideWorker.onmessage = event => {
  console.log('in this on success callback');
  const {id, ...data} = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncRun: (string: string, context: any) => Promise<any> = (() => {
  console.log('in async run');
  let id = 0; // identify a Promise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (script: string, context: any) => {
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
