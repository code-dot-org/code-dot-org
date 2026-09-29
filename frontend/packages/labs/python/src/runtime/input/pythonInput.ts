import {MessageTag, SERVICE_WORKER_PATH} from './constants';

// The worker side of blocking `input()`. Ported from
// apps/src/pythonlab/pythonHelpers/patches.ts.
//
// pyodide's worker is single-threaded, so it cannot both await the running
// program and service the program's input requests. So `input()` is patched to
// make a *synchronous* XHR to the input service worker, which holds the response
// open until the user submits a line — blocking the worker exactly like real
// stdin. See public/inputServiceWorker.js and input/inputServiceWorkerClient.ts.

/** JS module registered into pyodide as `pythonlab_input`. */
export const pythonlabInputModule = {
  getInput: (id: string, prompt: string): string => {
    const request = new XMLHttpRequest();
    // Synchronous (async=false) so the worker blocks here until the service
    // worker responds with the user's input.
    request.open(
      'GET',
      `${SERVICE_WORKER_PATH}?id=${id}&prompt=${encodeURIComponent(prompt)}`,
      false,
    );
    request.send(null);
    if (request.status !== 200) {
      throw new Error(MessageTag.INPUT_FAILED);
    }
    return request.responseText;
  },
};

/**
 * Python that repoints `input()` and `sys.stdin.readline` at the patched module.
 * Run once per program, before the user's code. `id` ties each request to this
 * run so the service worker can match responses. It also prints the prompt with
 * an `INPUT_PROMPT` tag so the manager can render it as a partial console line.
 */
export const patchInputCode = (id: string) => `
import sys, builtins
import pythonlab_input
def get_input(prompt=""):
    print(f'${MessageTag.INPUT_PROMPT}{prompt}')
    return pythonlab_input.getInput("${id}", prompt)
builtins.input = get_input
sys.stdin.readline = lambda: pythonlab_input.getInput("${id}", "")
`;
