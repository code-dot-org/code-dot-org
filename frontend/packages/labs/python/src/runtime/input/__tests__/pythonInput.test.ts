import {describe, expect, it} from 'vitest';

import {MessageTag} from '../constants';
import {patchInputCode} from '../pythonInput';

describe('patchInputCode', () => {
  it('binds input() and stdin.readline to the run id', () => {
    const code = patchInputCode('run-42');
    expect(code).toContain('builtins.input = get_input');
    expect(code).toContain('sys.stdin.readline = lambda');
    // The run id is threaded into every getInput call so the service worker can
    // match responses to this run.
    expect(code).toContain('pythonlab_input.getInput("run-42", prompt)');
    expect(code).toContain('pythonlab_input.getInput("run-42", "")');
  });

  it('prints the prompt with the INPUT_PROMPT tag', () => {
    expect(patchInputCode('id')).toContain(
      `print(f'${MessageTag.INPUT_PROMPT}{prompt}')`,
    );
  });
});
