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
  it('offers the three walkers and floating in one dropdown', () => {
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
    ]);
  });

  it('generates the begins call with the chosen behaviour', () => {
    const block = {
      getFieldValue: (name: string) =>
        name === 'SPRITE' ? '"Sprite 1"' : 'wanderingOnBlocks',
    };
    expect(beginsBehavior.generator(block as never, null as never)).toBe(
      'removeAllBehaviors({costume: "Sprite 1"});\n' +
        'addBehaviorSimple({costume: "Sprite 1"}, wanderingOnBlocks());\n'
    );
  });
});

describe('floating', () => {
  // Runs the shipped ES5 source with stubbed commands; y is the lab's
  // up-positive y, as getProp and setProp read and write it.
  function float(startY: number, phaseRoll = 0, nudgeAt?: number) {
    const props: {[key: string]: number | undefined} = {y: startY};
    let passes = 0;
    const commands = {
      getProp: (id: unknown, prop: string) => props[prop],
      setProp: (id: unknown, prop: string, value: number | undefined) => {
        if (value !== undefined) props[prop] = value;
      },
      changePropBy: (id: unknown, prop: string, delta: number) => {
        props[prop] = (props[prop] as number) + delta;
      },
      randomNumber: (low: number, high: number) =>
        low + Math.round(phaseRoll * (high - low)),
      passThroughWalls: () => passes++,
    };
    const made = new Function(
      'getProp',
      'setProp',
      'changePropBy',
      'randomNumber',
      'passThroughWalls',
      `${beginsBehavior.helperCode}\nreturn floating();`
    )(
      commands.getProp,
      commands.setProp,
      commands.changePropBy,
      commands.randomNumber,
      commands.passThroughWalls
    );
    const ys: number[] = [];
    for (let i = 0; i < FLOAT_PERIOD_TICKS * 2; i++) {
      if (i === nudgeAt) {
        props.y = (props.y as number) + 50;
      }
      made.func({id: 1});
      ys.push(props.y as number);
    }
    return {name: made.name, ys, passes};
  }

  it('bobs about its resting height by the swing, once per period, passing through the blocks', () => {
    const {name, ys, passes} = float(200);
    expect(name).toBe('floating');
    expect(Math.max(...ys)).toBeCloseTo(200 + FLOAT_SWING_PX, 0);
    expect(Math.min(...ys)).toBeCloseTo(200 - FLOAT_SWING_PX, 0);
    // One period on, it is back where it was.
    expect(ys[FLOAT_PERIOD_TICKS]).toBeCloseTo(ys[0], 5);
    expect(ys[0]).toBeCloseTo(200, 5);
    // Marked every tick: the mark lasts one frame.
    expect(passes).toBe(ys.length);
  });

  it('keeps bobbing about a new height when something else moves it', () => {
    const {ys} = float(200, 0, FLOAT_PERIOD_TICKS);
    const after = ys.slice(FLOAT_PERIOD_TICKS);
    expect(Math.max(...after)).toBeCloseTo(250 + FLOAT_SWING_PX, 0);
    expect(Math.min(...after)).toBeCloseTo(250 - FLOAT_SWING_PX, 0);
  });

  it('starts each sprite at its own point in the wave', () => {
    const a = float(200, 0).ys[1];
    const b = float(200, 0.25).ys[1];
    expect(a).not.toBeCloseTo(b, 1);
  });
});
