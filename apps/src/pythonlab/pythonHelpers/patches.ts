import {PyBuffer} from 'pyodide/ffi';

import {HOME_FOLDER, SERVICE_WORKER_PATH} from './constants';

export enum MessageTag {
  MATPLOTLIB_IMG = 'MATPLOTLIB_SHOW_IMG',
  NEIGHBORHOOD_SIGNAL = '[NEIGHBORHOOD]',
  INPUT_PROMPT = '[INPUT_PROMPT]',
  INPUT_FAILED = '[INPUT_FAILED]',
}

export const TEARDOWN_CODE = `from pythonlab_setup import teardown_pythonlab
teardown_pythonlab('/${HOME_FOLDER}')
`;

export const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MessageTag.MATPLOTLIB_IMG}')
`;

// The two functions below are used to patch the input function in Python.
// When the user calls input() or readline from stdin in Python, we intercept
// the call and send a get request to our service worker, which in turn sends a
// message to the main thread that we are awaiting input. The main thread then
// sends a message back to the service worker, which becomes the result of the get request.
export const patchInputCode = (id: number) => `
import sys, builtins
import pythonlab_input
def get_input(prompt=""):
    print(f'${MessageTag.INPUT_PROMPT}{prompt}')
    return pythonlab_input.getInput("${id}", prompt)
builtins.input = get_input
sys.stdin.readline = lambda: pythonlab_input.getInput("${id}", "")
`;

export const pythonlabInputModule = {
  getInput: (id: string, prompt: string) => {
    const request = new XMLHttpRequest();
    // Synchronous request to be intercepted by service worker
    request.open(
      'GET',
      `${SERVICE_WORKER_PATH}?id=${id}&prompt=${encodeURIComponent(prompt)}`,
      false
    );
    request.send(null);
    if (request.status !== 200) {
      throw new Error(MessageTag.INPUT_FAILED);
    }
    return request.responseText;
  },
};

// The theater package's only way to reach the page: student code renders a gif
// and an audio track in Python, and this hands the bytes to the theater mini
// app to play, along with how long the gif runs. A silent program publishes no
// audio track, so wav is optional.
export const theaterBridgeModule = {
  publish: (
    gif: PyBuffer,
    wav: PyBuffer | undefined,
    gifDurationMs: number
  ) => {
    // Copy before the suppression check: the proxy has to be released either
    // way, or its WASM memory stays pinned for the life of the worker.
    const gifBytes = copyProxyBytes(gif);
    const wavBytes = wav ? copyProxyBytes(wav) : undefined;
    postMessage({
      type: 'theater_media',
      gif: gifBytes,
      wav: wavBytes,
      gifDurationMs,
      id: 'none', // id is not used here, so none is safe
    });
  },
};

// Copy a Python bytes object out of WASM memory into a standalone Uint8Array.
// postMessage cannot clone the proxy itself, and the buffer it hands us is a view
// into the interpreter's heap, so the copy has to happen before release.
function copyProxyBytes(proxy: PyBuffer) {
  const buffer = proxy.getBuffer('u8');
  try {
    return new Uint8Array(buffer.data as Uint8Array);
  } finally {
    buffer.release();
    proxy.destroy();
  }
}
