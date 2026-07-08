import {generateBlocklyJson} from '@cdo/apps/p5lab/spritelab/lab2/blockly/generateBlocklyJson';

describe('SpriteLab2 generateBlocklyJson', () => {
  it('produces a when_run root hat', () => {
    const result = generateBlocklyJson('when_run\n  repeat 2');
    expect(result.blocks.blocks).toHaveLength(1);
    expect(result.blocks.blocks[0].type).toBe('when_run');
  });

  it('throws on an empty program instead of silently loading nothing', () => {
    expect(() => generateBlocklyJson('when_run')).toThrow(/usable commands/);
    expect(() => generateBlocklyJson('when_run\n  fly_to_the_moon')).toThrow(
      /usable commands/
    );
  });

  it('strips markdown fences and prose before the program', () => {
    const result = generateBlocklyJson(
      'Here is your program:\n```\nwhen_run\n  repeat 2\n```'
    );
    const repeat = result.blocks.blocks[0].next.block;
    expect(repeat.type).toBe('controls_repeat_ext');
  });

  it('throws when the reply has no when_run at all', () => {
    expect(() => generateBlocklyJson('sorry, I cannot do that')).toThrow(
      /didn't contain a program/
    );
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
    const result = generateBlocklyJson(
      'when_run\n  fly_to_the_moon\n  repeat 2'
    );
    // The unknown command is dropped; the rest of the program still loads.
    const root = result.blocks.blocks[0];
    expect(root.type).toBe('when_run');
    expect(root.next.block.type).toBe('controls_repeat_ext');
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

  it('maps make_grid to gamelab_makeSpritesGrid with an XML-wrapped grid', () => {
    const result = generateBlocklyJson(
      'when_run\n  make_grid block 10 011 000'
    );
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('gamelab_makeSpritesGrid');
    expect(block.fields.ANIMATION_NAME).toBe('"block"');
    // The bitmap field round-trips through XML hooks; short rows are
    // zero-padded to the widest row.
    expect(block.fields.GRID).toBe(
      '<field name="GRID">[[1,0,0],[0,1,1],[0,0,0]]</field>'
    );
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

  it('starts a new top-level hat for when_key, placed below when_run', () => {
    const result = generateBlocklyJson(
      'when_run\n  say owl hi\nwhen_key space\n  say owl pressed'
    );
    const roots = result.blocks.blocks;
    expect(roots).toHaveLength(2);
    expect(roots[0].type).toBe('when_run');
    expect(roots[1].type).toBe('gamelab_whenKey');
    expect(roots[1].fields.KEY).toBe('"space"');
    expect(roots[1].y).toBeGreaterThan(roots[0].y);
    expect(roots[0].next.block.fields.SPEECH).toBe('hi');
    expect(roots[1].next.block.fields.SPEECH).toBe('pressed');
  });

  it('maps while_key to gamelab_whileKey with its body in the DO input', () => {
    const result = generateBlocklyJson(
      'when_run\nwhile_key right\n  move hero 4 right\n  move hero 1 up'
    );
    const hat = result.blocks.blocks[1];
    expect(hat.type).toBe('gamelab_whileKey');
    expect(hat.fields.KEY).toBe('"right"');
    // Loop-style hat: no next chain off the hat itself.
    expect(hat.next).toBeUndefined();
    const move = hat.inputs.DO.block;
    expect(move.type).toBe('gamelab_moveInDirection');
    expect(move.fields.DIRECTION).toBe('"East"');
    expect(move.inputs.DISTANCE.block.fields.NUM).toBe(4);
    expect(move.inputs.SPRITE.block.fields.ANIMATION).toBe('"hero"');
    // Siblings inside the body chain via next as usual.
    expect(move.next.block.fields.DIRECTION).toBe('"North"');
  });

  it('maps when_touching to gamelab_whenTouching with two sprite inputs', () => {
    const result = generateBlocklyJson(
      'when_run\nwhen_touching hero gem\n  say hero You win!'
    );
    const hat = result.blocks.blocks[1];
    expect(hat.type).toBe('gamelab_whenTouching');
    expect(hat.inputs.SPRITE1.block.fields.ANIMATION).toBe('"hero"');
    expect(hat.inputs.SPRITE2.block.fields.ANIMATION).toBe('"gem"');
    expect(hat.next.block.type).toBe('gamelab_spriteSay');
  });

  it('maps jump strengths to GameDev_playerJump dropdown values', () => {
    const result = generateBlocklyJson('when_run\nwhen_key space\n  jump big');
    const jump = result.blocks.blocks[1].next.block;
    expect(jump.type).toBe('GameDev_playerJump');
    expect(jump.fields.STRENGTH).toBe('17');
  });

  it('maps behavior names to predefined behavior blocks, ignoring spacing', () => {
    const result = generateBlocklyJson(
      'when_run\n  behavior owl moving left\n  behavior owl patrolling up and down\n  behavior owl moving with arrow keys'
    );
    const first = result.blocks.blocks[0].next.block;
    const second = first.next.block;
    const third = second.next.block;
    expect(first.type).toBe('gamelab_addBehaviorSimple');
    expect(first.inputs.BEHAVIOR.block.type).toBe('spritelab2_movingLeft');
    expect(second.inputs.BEHAVIOR.block.type).toBe('gamelab_patrollingUpDown');
    expect(third.inputs.BEHAVIOR.block.type).toBe(
      'spritelab2_movingWithArrowKeys'
    );
  });

  it('resolves go_to_scene names to ids via sceneIdByName', () => {
    const result = generateBlocklyJson('when_run\n  go_to_scene Maker Cave', {
      sceneIdByName: {'maker cave': 'scene-2'},
    });
    const block = result.blocks.blocks[0].next.block;
    expect(block.type).toBe('spritelab2_goToScene');
    expect(block.fields.SCENE).toBe('scene-2');
  });

  it('throws on an unknown scene name or a missing scene map', () => {
    expect(() =>
      generateBlocklyJson('when_run\n  go_to_scene Nowhere', {
        sceneIdByName: {'maker cave': 'scene-2'},
      })
    ).toThrow();
    expect(() =>
      generateBlocklyJson('when_run\n  go_to_scene Maker Cave')
    ).toThrow();
  });

  it('validates image names against the project lists when provided', () => {
    const options = {
      costumeNames: ['Hero Cat', 'block'],
      backgroundNames: ['hills'],
    };
    // Valid names load, rewritten to canonical casing; multi-word names match
    // via longest token-prefix.
    const ok = generateBlocklyJson(
      'when_run\n  set_background HILLS\n  make_sprite hero cat 200 100\n  say hero cat hello there',
      options
    );
    const background = ok.blocks.blocks[0].next.block;
    expect(background.fields.IMG).toBe('"hills"');
    const sprite = background.next.block;
    expect(sprite.fields.ANIMATION_NAME).toBe('"Hero Cat"');
    expect(JSON.parse(sprite.inputs.LOCATION.block.fields.LOCATION)).toEqual({
      x: 200,
      y: 100,
    });
    const say = sprite.next.block;
    expect(say.inputs.SPRITE.block.fields.ANIMATION).toBe('"Hero Cat"');
    expect(say.fields.SPEECH).toBe('hello there');
    // Invented names throw instead of half-loading.
    expect(() =>
      generateBlocklyJson('when_run\n  set_background sunset', options)
    ).toThrow(/isn't one of this project's background/);
    expect(() =>
      generateBlocklyJson('when_run\n  say ghost boo', options)
    ).toThrow(/isn't one of this project's image/);
    // A costume used as a background is rejected too.
    expect(() =>
      generateBlocklyJson('when_run\n  set_background block', options)
    ).toThrow();
    // Without lists, validation is off (backwards compatible).
    expect(() =>
      generateBlocklyJson('when_run\n  say ghost boo')
    ).not.toThrow();
  });

  it('throws on an indented hat or a bad key', () => {
    expect(() => generateBlocklyJson('when_run\n  when_key space')).toThrow();
    expect(() => generateBlocklyJson('when_run\nwhen_key q')).toThrow();
    expect(() => generateBlocklyJson('when_run\nwhen_touching hero')).toThrow();
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
    expect(() =>
      generateBlocklyJson('when_run\n  move hero fast up')
    ).toThrow();
    expect(() => generateBlocklyJson('when_run\n  jump huge')).toThrow();
    expect(() =>
      generateBlocklyJson('when_run\n  behavior owl flying')
    ).toThrow();
  });
});
