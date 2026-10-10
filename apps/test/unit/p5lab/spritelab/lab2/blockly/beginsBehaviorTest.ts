jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));

import beginsBehavior, {
  BEHAVIOR_OPTIONS,
  FLOAT_PERIOD_TICKS,
  FLOAT_SWING_PX,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/beginsBehavior';

describe('beginsBehavior block', () => {
  it('offers the walkers, floating and the story movements in one dropdown', () => {
    const {definition} = beginsBehavior;
    expect(definition.message0).toBe('%1 begins %2');
    expect(definition.args0?.[0]).toMatchObject({
      type: 'field_spritelab2_costume',
      name: 'SPRITE',
    });
    expect(definition.args0?.[1]).toMatchObject({
      type: 'field_dropdown',
      name: 'BEHAVIOR',
      options: BEHAVIOR_OPTIONS,
    });
    expect(BEHAVIOR_OPTIONS.map(([, value]) => value)).toEqual([
      'patrollingOnBlocks',
      'wanderingOnBlocks',
      'followingPlayerOnBlocks',
      'floating',
      'movingLeft',
      'patrollingLeftRight',
    ]);
  });

  it('generates the begins call with the chosen behaviour', () => {
    const block = {
      getFieldValue: (name: string) =>
        name === 'SPRITE' ? '"Sprite 1"' : 'wanderingOnBlocks',
    };
    expect(beginsBehavior.generator(block as never, null as never)).toBe(
      'addBehaviorSimple({costume: "Sprite 1"}, wanderingOnBlocks());\n'
    );
  });
});

describe('floating', () => {
  // Runs the shipped ES5 source with stubbed commands; y is the lab's
  // up-positive y, as getProp and setProp read and write it.
  function float(startY: number, phaseRoll = 0) {
    const props: {[key: string]: number | undefined} = {y: startY};
    const commands = {
      getProp: (id: unknown, prop: string) => props[prop],
      setProp: (id: unknown, prop: string, value: number | undefined) => {
        if (value !== undefined) props[prop] = value;
      },
      randomNumber: (low: number, high: number) =>
        low + Math.round(phaseRoll * (high - low)),
    };
    const made = new Function(
      'getProp',
      'setProp',
      'randomNumber',
      `${beginsBehavior.helperCode}\nreturn floating();`
    )(commands.getProp, commands.setProp, commands.randomNumber);
    const ys: number[] = [];
    for (let i = 0; i < FLOAT_PERIOD_TICKS * 2; i++) {
      made.func({id: 1});
      ys.push(props.y as number);
    }
    return {name: made.name, ys};
  }

  it('bobs about its resting height by the swing, once per period', () => {
    const {name, ys} = float(200);
    expect(name).toBe('floating');
    expect(Math.max(...ys)).toBeCloseTo(200 + FLOAT_SWING_PX, 0);
    expect(Math.min(...ys)).toBeCloseTo(200 - FLOAT_SWING_PX, 0);
    // One period on, it is back where it was.
    expect(ys[FLOAT_PERIOD_TICKS]).toBeCloseTo(ys[0], 5);
    expect(ys[0]).toBeCloseTo(200, 5);
  });

  it('starts each sprite at its own point in the wave', () => {
    const a = float(200, 0).ys[0];
    const b = float(200, 0.25).ys[0];
    expect(a).not.toBeCloseTo(b, 1);
  });
});
