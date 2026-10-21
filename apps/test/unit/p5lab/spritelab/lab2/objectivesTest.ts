import {
  BlockState,
  checkObjective,
  EMPTY_RUNTIME,
  fieldValue,
  ObjectiveCheck,
  ObjectiveInputs,
  realBlocks,
  runtimeNeeds,
} from '@cdo/apps/p5lab/spritelab/lab2/objectives';
import {WorldCell} from '@cdo/apps/p5lab/spritelab/lab2/world';

const hero: WorldCell = {image: 'Sprite 1', kind: 'sprite'};
const block: WorldCell = {image: 'Block 1', kind: 'block'};

function grid(cells: [number, number, WorldCell][]) {
  const rows: (WorldCell | null)[][] = Array.from({length: 10}, () =>
    Array(10).fill(null)
  );
  cells.forEach(([r, c, cell]) => (rows[r][c] = cell));
  return rows;
}

// when run > [shadow placeholder | say "Hello!"] ; at 3 seconds > shadow only
const source = {
  blocks: {
    blocks: [
      {
        type: 'spritelab2_whenRun',
        next: {
          shadow: {type: 'spritelab2_placeholder'},
          block: {
            type: 'gamelab_spriteSay',
            fields: {SPEECH: 'Hello!'},
            inputs: {
              SPRITE: {
                shadow: {
                  type: 'gamelab_allSpritesWithAnimation',
                  fields: {
                    ANIMATION: '<field name="ANIMATION">"Sprite 1"</field>',
                  },
                },
              },
            },
            next: {
              block: {
                type: 'gamelab_addBehaviorSimple',
                inputs: {
                  BEHAVIOR: {block: {type: 'spritelab2_patrollingOnBlocks'}},
                },
              },
            },
          },
        },
      },
      {
        type: 'gamelab_atTime',
        data: 'at-3',
        next: {shadow: {type: 'gamelab_spriteSay'}},
      },
      {
        type: 'gamelab_spriteSay',
        disabledReasons: ['ORPHANED'],
        fields: {SPEECH: 'stray'},
      },
    ] as BlockState[],
  },
};

function inputs(over: Partial<ObjectiveInputs> = {}): ObjectiveInputs {
  return {
    images: {sprite: 0, background: 0, block: 0},
    grid: undefined,
    baselineGrid: undefined,
    imageForRole: {hero: 'Sprite 1', treasure: 'Sprite 3'},
    source,
    activeTab: 'Code',
    everPlayed: false,
    runtime: EMPTY_RUNTIME,
    ...over,
  };
}

describe('fieldValue', () => {
  it('reads the legacy XML form, quoted or not, and the bare value', () => {
    expect(fieldValue('<field name="POSITION">left</field>')).toBe('left');
    expect(fieldValue('<field name="ANIMATION_NAME">"Sprite 1"</field>')).toBe(
      'Sprite 1'
    );
    expect(fieldValue('right')).toBe('right');
    expect(fieldValue(3)).toBe('3');
    expect(fieldValue(undefined)).toBeUndefined();
  });
});

describe('realBlocks', () => {
  it('walks the chain and the inputs but never a shadow', () => {
    const types = [...realBlocks(source.blocks.blocks[0])].map(b => b.type);
    expect(types).toEqual([
      'spritelab2_whenRun',
      'gamelab_spriteSay',
      'gamelab_addBehaviorSimple',
      'spritelab2_patrollingOnBlocks',
    ]);
  });
});

describe('checkObjective', () => {
  it('counts images of a type made on the level', () => {
    const made = inputs({images: {sprite: 1, background: 0, block: 0}});
    expect(checkObjective({kind: 'image', imageType: 'sprite'}, made)).toBe(
      true
    );
    expect(checkObjective({kind: 'image', imageType: 'background'}, made)).toBe(
      false
    );
    expect(
      checkObjective({kind: 'image', imageType: 'sprite', count: 2}, made)
    ).toBe(false);
  });

  it('finds a real block under a hat, not a shadow or a stray', () => {
    const say = {kind: 'block', type: 'gamelab_spriteSay'} as const;
    expect(
      checkObjective({...say, under: 'spritelab2_whenRun'}, inputs())
    ).toBe(true);
    // Under at-3 there is only the placeholder shadow.
    expect(checkObjective({...say, data: 'at-3'}, inputs())).toBe(false);
    expect(checkObjective({...say, under: 'gamelab_atTime'}, inputs())).toBe(
      false
    );
    // The orphaned say is disabled.
    expect(checkObjective({...say, fields: {SPEECH: 'stray'}}, inputs())).toBe(
      false
    );
  });

  it('accepts any of several block types', () => {
    const either: ObjectiveCheck = {
      kind: 'block',
      type: ['spritelab2_restartScene', 'gamelab_spriteSay'],
      under: 'spritelab2_whenRun',
    };
    expect(checkObjective(either, inputs())).toBe(true);
    expect(
      checkObjective({...either, type: ['spritelab2_restartScene']}, inputs())
    ).toBe(false);
  });

  it('matches field values in either saved form', () => {
    expect(
      checkObjective(
        {kind: 'block', type: 'gamelab_spriteSay', fields: {SPEECH: 'Hello!'}},
        inputs()
      )
    ).toBe(true);
    expect(
      checkObjective(
        {kind: 'block', type: 'gamelab_spriteSay', fields: {SPEECH: 'Bye'}},
        inputs()
      )
    ).toBe(false);
  });

  it('requires a contained block when asked', () => {
    const behavior = {
      kind: 'block',
      type: 'gamelab_addBehaviorSimple',
    } as const;
    expect(
      checkObjective(
        {...behavior, contains: 'spritelab2_patrollingOnBlocks'},
        inputs()
      )
    ).toBe(true);
    expect(
      checkObjective({...behavior, contains: 'spritelab2_movingLeft'}, inputs())
    ).toBe(false);
  });

  it('reads the world by role, by kind and count, and by change', () => {
    const placed = grid([
      [7, 4, hero],
      [8, 0, block],
      [8, 1, block],
    ]);
    const base = inputs({grid: placed, baselineGrid: placed});
    expect(checkObjective({kind: 'world', role: 'hero'}, base)).toBe(true);
    expect(checkObjective({kind: 'world', role: 'treasure'}, base)).toBe(false);
    expect(
      checkObjective({kind: 'world', cellKind: 'block', count: 2}, base)
    ).toBe(true);
    expect(
      checkObjective({kind: 'world', cellKind: 'sprite', count: 2}, base)
    ).toBe(false);
    expect(checkObjective({kind: 'world', changed: true}, base)).toBe(false);
    const edited = inputs({
      grid: grid([[7, 4, hero]]),
      baselineGrid: placed,
    });
    expect(checkObjective({kind: 'world', changed: true}, edited)).toBe(true);
    // No saved world and an empty grid are the same world.
    const fresh = inputs({grid: grid([]), baselineGrid: undefined});
    expect(checkObjective({kind: 'world', changed: true}, fresh)).toBe(false);
  });

  it('reads play, run length, touches, height, scenes and the tab', () => {
    const runtime = {
      longestRunSeconds: 4,
      touched: new Set(['Sprite 3']),
      highest: 0.8,
      scenesLanded: new Set(['platform-scene']),
    };
    const played = inputs({everPlayed: true, runtime, activeTab: 'Play'});
    expect(checkObjective({kind: 'play'}, played)).toBe(true);
    expect(checkObjective({kind: 'play'}, inputs())).toBe(false);
    expect(checkObjective({kind: 'play', seconds: 3}, played)).toBe(true);
    expect(checkObjective({kind: 'play', seconds: 6}, played)).toBe(false);
    expect(checkObjective({kind: 'reach', role: 'treasure'}, played)).toBe(
      true
    );
    expect(checkObjective({kind: 'reach', role: 'hero'}, played)).toBe(false);
    expect(checkObjective({kind: 'reach', height: 0.75}, played)).toBe(true);
    expect(checkObjective({kind: 'reach', height: 0.9}, played)).toBe(false);
    expect(checkObjective({kind: 'scene', id: 'platform-scene'}, played)).toBe(
      true
    );
    expect(checkObjective({kind: 'scene', id: 'story-scene'}, played)).toBe(
      false
    );
    expect(checkObjective({kind: 'tab', name: 'Play'}, played)).toBe(true);
    expect(checkObjective({kind: 'tab', name: 'World'}, played)).toBe(false);
  });

  it('never matches a role the project has no image for', () => {
    const none = inputs({imageForRole: {}, grid: grid([[7, 4, hero]])});
    expect(checkObjective({kind: 'world', role: 'hero'}, none)).toBe(false);
    expect(checkObjective({kind: 'reach', role: 'hero'}, none)).toBe(false);
  });
});

describe('runtimeNeeds', () => {
  it('names the reports the checklist reads', () => {
    expect(runtimeNeeds(undefined)).toEqual({
      seconds: false,
      touch: false,
      height: false,
    });
    expect(
      runtimeNeeds({
        items: [
          {text: '', check: {kind: 'play'}},
          {text: '', check: {kind: 'reach', role: 'treasure'}},
        ],
      })
    ).toEqual({seconds: false, touch: true, height: false});
    expect(
      runtimeNeeds({
        items: [
          {text: '', check: {kind: 'play', seconds: 5}},
          {text: '', check: {kind: 'reach', height: 0.7}},
        ],
      })
    ).toEqual({seconds: true, touch: false, height: true});
  });
});
