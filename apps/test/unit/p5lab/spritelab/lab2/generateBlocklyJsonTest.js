import {generateBlocklyJson} from '@cdo/apps/p5lab/spritelab/lab2/blockly/generateBlocklyJson';

describe('SpriteLab2 generateBlocklyJson', () => {
  it('produces a when_run root hat', () => {
    const result = generateBlocklyJson('when_run');
    expect(result.blocks.blocks).toHaveLength(1);
    expect(result.blocks.blocks[0].type).toBe('when_run');
  });

  it('chains a repeat off when_run with a math_number TIMES input', () => {
    const result = generateBlocklyJson('when_run\n  repeat 3');
    const root = result.blocks.blocks[0];
    const repeat = root.next.block;
    expect(repeat.type).toBe('controls_repeat_ext');
    expect(repeat.inputs.TIMES.block.type).toBe('math_number');
    expect(repeat.inputs.TIMES.block.fields.NUM).toBe(3);
  });

  it('nests indented statements inside the repeat body (DO input)', () => {
    const result = generateBlocklyJson('when_run\n  repeat 2\n    repeat 5');
    const outerRepeat = result.blocks.blocks[0].next.block;
    const innerRepeat = outerRepeat.inputs.DO.block;
    expect(innerRepeat.type).toBe('controls_repeat_ext');
    expect(innerRepeat.inputs.TIMES.block.fields.NUM).toBe(5);
  });

  it('chains sibling statements at the same indentation via next', () => {
    const result = generateBlocklyJson('when_run\n  repeat 1\n  repeat 2');
    const first = result.blocks.blocks[0].next.block;
    const second = first.next.block;
    expect(first.inputs.TIMES.block.fields.NUM).toBe(1);
    expect(second.inputs.TIMES.block.fields.NUM).toBe(2);
  });

  it('throws if a when_run command is mis-placed (indented)', () => {
    expect(() => generateBlocklyJson('  when_run')).toThrow();
  });

  it('skips unsupported commands leniently', () => {
    const result = generateBlocklyJson('when_run\n  fly_to_the_moon');
    // Unknown command is dropped; the root hat is still produced with no body.
    expect(result.blocks.blocks[0].type).toBe('when_run');
    expect(result.blocks.blocks[0].next).toBeUndefined();
  });
});
