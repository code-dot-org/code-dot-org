// @vitest-environment node
//
// What the JavaScript panel says, for the states a file can be in. The
// generation itself is not exercised here — it needs a mounted headless Blockly
// (`blockly/BlocklyGenerator`), and what this is about is the decision made
// around it.

import {describe, expect, it, vi} from 'vitest';

import {generatedCodeFor} from '../generatedCode';

describe('what the JavaScript panel shows', () => {
  it('shows the module a Blockly file generates', () => {
    const generate = vi.fn(() => 'export default actor;\n');
    expect(generatedCodeFor('actors/label.actor', '{}', generate)).toEqual({
      kind: 'code',
      code: 'export default actor;\n',
    });
    // The PATH goes with the contents, and a `.rule` needs it: its module path
    // names where its own members are imported from.
    expect(generate).toHaveBeenCalledWith('{}', 'actors/label.actor');
  });

  it('says so, and why, when the file will not generate', () => {
    // The state a learner can reach and cannot see today: a file that throws
    // takes the whole project down with it, and the failure is reported
    // against the compile rather than against the file.
    const generate = vi.fn(() => {
      throw new Error(
        'The block "world_rule_block" is missing a DO connection',
      );
    });
    expect(generatedCodeFor('rules/falls.rule', '{}', generate)).toEqual({
      kind: 'error',
      message: 'The block "world_rule_block" is missing a DO connection',
    });
  });

  it('survives something being thrown that is not an Error', () => {
    const generate = vi.fn((): string => {
      throw 'nope';
    });
    expect(generatedCodeFor('rules/falls.rule', '{}', generate)).toMatchObject({
      kind: 'error',
      message: 'nope',
    });
  });

  it('does not generate a file that is not made from blocks', () => {
    // A `.js` in a World project is already the code; showing a copy of it
    // beside itself says nothing. Asked of the path, from the same reader the
    // compiler uses (`blockly/fileKind`).
    const generate = vi.fn(() => 'unreachable');
    const view = generatedCodeFor('helpers.js', 'const x = 1;', generate);
    expect(view.kind).toBe('none');
    expect(generate).not.toHaveBeenCalled();
  });

  it('knows every Blockly kind, and a map is one of them', () => {
    const generate = vi.fn(() => 'code');
    for (const path of [
      'actors/label.actor',
      'rules/falls.rule',
      'worlds/main.world',
      'maps/level1.map',
    ]) {
      expect(generatedCodeFor(path, '{}', generate).kind).toBe('code');
    }
  });

  it('has something to say with no file open', () => {
    const generate = vi.fn(() => 'unreachable');
    expect(generatedCodeFor(undefined, undefined, generate).kind).toBe('none');
    expect(generate).not.toHaveBeenCalled();
  });

  it('does not generate a file whose path the project has lost', () => {
    // `filePath` answers undefined for an id the source no longer holds, which
    // is a moment that happens: a file is deleted while its editor is open.
    const generate = vi.fn(() => 'unreachable');
    expect(generatedCodeFor(undefined, '{}', generate).kind).toBe('none');
    expect(generate).not.toHaveBeenCalled();
  });
});
