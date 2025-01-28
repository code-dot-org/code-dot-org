import {HOME_FOLDER, SERVICE_WORKER_PATH} from './constants';

export enum MessageTag {
  MATPLOTLIB_IMG = 'MATPLOTLIB_SHOW_IMG',
  NEIGHBORHOOD_SIGNAL = '[PAINTER]',
}

export const TEARDOWN_CODE = `from pythonlab_setup import teardown_pythonlab
teardown_pythonlab('/${HOME_FOLDER}')
`;

export const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MessageTag.MATPLOTLIB_IMG}')
`;

export const patchInputCode = (id: number) => `
import sys, builtins
import pythonlab_input
__prompt_str__ = ""
def get_input(prompt=""):
    global __prompt_str__
    __prompt_str__ = prompt
    print(prompt)
    s = pythonlab_input.getInput("${id}", prompt)
    print()
    return s
builtins.input = get_input
sys.stdin.readline = lambda: pythonlab_input.getInput("${id}", __prompt_str__)
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
    return request.responseText;
  },
};
