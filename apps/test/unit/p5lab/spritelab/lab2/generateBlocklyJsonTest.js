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

  it('maps set_background to gamelab_setBackgroundImageAs with a quoted name', () => {
    const result = generateBlocklyJson('when_run\n  set_background hills');
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_setBackgroundImageAs');
    expect(block.fields.IMG).toBe('"hills"');
  });

  it('maps make_sprite to gamelab_makeNewSpriteAnon with a location picker', () => {
    const result = generateBlocklyJson('when_run\n  make_sprite owl 200 150');
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_makeNewSpriteAnon');
    expect(block.fields.ANIMATION_NAME).toBe('"owl"');
    const location = block.inputs.LOCATION.block;
    expect(location.type).toBe('gamelab_location_picker');
    expect(JSON.parse(location.fields.LOCATION)).toEqual({x: 200, y: 150});
  });

  it('maps make_grid to gamelab_makeSpritesGrid with a rectangular 0/1 grid', () => {
    const result = generateBlocklyJson(
      'when_run\n  make_grid block 10 011 000'
    );
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_makeSpritesGrid');
    expect(block.fields.ANIMATION_NAME).toBe('"block"');
    // Short rows are zero-padded to the widest row.
    expect(block.fields.GRID).toEqual([
      [1, 0, 0],
      [0, 1, 1],
      [0, 0, 0],
    ]);
  });

  it('maps gravity strengths to GameDev_gravity dropdown values', () => {
    const result = generateBlocklyJson('when_run\n  gravity hero high');
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('GameDev_gravity');
    expect(block.fields.VELOCITY).toBe('-1');
    const sprite = block.inputs.SPRITE.block;
    expect(sprite.type).toBe('gamelab_allSpritesWithAnimation');
    expect(sprite.fields.ANIMATION).toBe('"hero"');
  });

  it('maps set_type to GameDev_setGroup group values', () => {
    const result = generateBlocklyJson(
      'when_run\n  set_type block environment\n  set_type hero player'
    );
    const environment = result.blocks.blocks[0].next.block;
    const player = environment.next.block;
    expect(environment.type).toBe('GameDev_setGroup');
    expect(environment.fields.GROUP).toBe('"walls"');
    expect(player.fields.GROUP).toBe('"players"');
  });

  it('maps set_size to gamelab_setProp scale with a math_number value', () => {
    const result = generateBlocklyJson('when_run\n  set_size owl 300');
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_setProp');
    expect(block.fields.PROPERTY).toBe('"scale"');
    expect(block.inputs.VAL.block.type).toBe('math_number');
    expect(block.inputs.VAL.block.fields.NUM).toBe(300);
  });

  it('maps say to gamelab_spriteSay, joining multi-word text', () => {
    const result = generateBlocklyJson('when_run\n  say owl Hello there!');
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_spriteSay');
    expect(block.fields.SPEECH).toBe('Hello there!');
    expect(block.inputs.SPRITE.block.fields.ANIMATION).toBe('"owl"');
  });

  it('nests new commands inside repeat and resumes chaining after dedent', () => {
    const result = generateBlocklyJson(
      'when_run\n  repeat 2\n    say owl hi\n  set_background hills'
    );
    const repeat = result.blocks.blocks[0].next.block;
    expect(repeat.inputs.DO.block.type).toBe('gamelab_spriteSay');
    expect(repeat.next.block.type).toBe('gamelab_setBackgroundImageAs');
  });

  it('throws on malformed arguments', () => {
    expect(() => generateBlocklyJson('when_run\n  make_sprite owl')).toThrow();
    expect(() =>
      generateBlocklyJson('when_run\n  gravity hero huge')
    ).toThrow();
    expect(() =>
      generateBlocklyJson('when_run\n  set_type hero wall')
    ).toThrow();
    expect(() => generateBlocklyJson('when_run\n  set_size owl big')).toThrow();
    expect(() => generateBlocklyJson('when_run\n  say owl')).toThrow();
  });
});
