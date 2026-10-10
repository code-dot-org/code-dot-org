jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  FIELD_COSTUME_TYPE: 'field_spritelab2_costume',
  FIELD_BLOCK_IMAGE_TYPE: 'field_spritelab2_block_image',
}));

import beginsBehavior, {
  BEHAVIOR_OPTIONS,
  FLOAT_CYCLE_TICKS,
  FLOAT_SWAY_X_PX,
  FLOAT_SWAY_Y_PX,
  FLOAT_X_RATE,
  FLOAT_Y_RATE,
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
      'addBehaviorSimple({costume: "Sprite 1"}, wanderingOnBlocks());\n'
    );
  });
});

describe('floating', () => {
  // Runs the shipped ES5 source with stubbed commands; y is the lab's
  // up-positive y, as getProp and setProp read and write it.
  function float(startX: number, startY: number, phaseRoll = 0) {
    const props: {[key: string]: number | undefined} = {x: startX, y: startY};
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
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < FLOAT_CYCLE_TICKS; i++) {
      made.func({id: 1});
      xs.push(props.x as number);
      ys.push(props.y as number);
    }
    return {name: made.name, xs, ys};
  }

  it('drifts sideways and bobs about where it started, each on its own beat', () => {
    const {name, xs, ys} = float(100, 200);
    expect(name).toBe('floating');
    expect(Math.max(...xs)).toBeCloseTo(100 + FLOAT_SWAY_X_PX, 0);
    expect(Math.min(...xs)).toBeCloseTo(100 - FLOAT_SWAY_X_PX, 0);
    expect(Math.max(...ys)).toBeCloseTo(200 + FLOAT_SWAY_Y_PX, 0);
    expect(Math.min(...ys)).toBeCloseTo(200 - FLOAT_SWAY_Y_PX, 0);
    // The drift repeats twice a cycle, the bob six times; one cycle on,
    // both are back where they began.
    expect(xs[FLOAT_CYCLE_TICKS / FLOAT_X_RATE]).toBeCloseTo(xs[0], 5);
    expect(ys[FLOAT_CYCLE_TICKS / FLOAT_Y_RATE]).toBeCloseTo(ys[0], 5);
    expect(xs[0]).toBeCloseTo(100, 5);
    expect(ys[0]).toBeCloseTo(200, 5);
    // A bob is quicker than a drift.
    expect(FLOAT_Y_RATE).toBeGreaterThan(FLOAT_X_RATE);
  });

  it('starts each sprite at its own point in the wave', () => {
    const a = float(100, 200, 0);
    const b = float(100, 200, 0.25);
    expect(a.xs[1]).not.toBeCloseTo(b.xs[1], 1);
  });
});
