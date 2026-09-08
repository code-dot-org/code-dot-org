// A drawing whose size is read off the actor.
//
// It was two numbers typed into `define drawing`, one pair per KIND — so five
// Labels of one kind were five boxes of one size, and "make this button wider"
// was not a thing that could be said. That is the first thing somebody
// arranging a dialog reaches for (specs/UI_ACTORS.md), and it is what every
// interface actor after the Progress Bar needs.
//
// THE SIZE IS NOT JUST THE PICTURE. A declared canvas is also the actor's
// `intrinsic size`, which is what the click box, the collision box and "Stays
// in the Map" all read — so a per-instance size that only reached the texture
// would be a wider button that still missed the click. Both halves are checked
// here, and the second is the one that would have been forgotten.

import {describe, expect, it} from 'vitest';

import {IntrinsicSizeProperty} from '../engine/rules/spatial';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** `⟨width⟩ of ⟨this actor⟩` — the Plate's own property, read by its picture. */
const own = (name: string) => ({
  block: {
    type: `world_get_ActorsPlate_${name}Property`,
    inputs: {ACTOR: me()},
  },
});

/** A kind that is as big as it says it is. */
const PLATE = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Plate'},
        next: {
          block: {
            type: 'world_rule_property',
            fields: {
              TYPE: 'number',
              ACCESS: 'writable',
              NAME: 'width',
              DEFAULT: '40',
            },
            next: {
              block: {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'number',
                  ACCESS: 'writable',
                  NAME: 'height',
                  DEFAULT: '12',
                },
                next: {
                  block: {
                    type: 'world_define_drawing',
                    inputs: {
                      WIDTH: own('Width'),
                      HEIGHT: own('Height'),
                      DO: {
                        block: {
                          type: 'world_draw_rectangle',
                          inputs: {
                            X: number(0),
                            Y: number(0),
                            WIDTH: own('Width'),
                            HEIGHT: own('Height'),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});

/** `add actor ⟨Plate⟩ do set width of ⟨this actor⟩ to ⟨w⟩`. */
const place = (width: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/plate'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_ActorsPlate_WidthProperty',
        inputs: {ACTOR: me(), VALUE: number(width)},
      },
    },
  },
});

/** Two Plates of one kind, made two different widths. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {...place(100), next: {block: place(20)}},
        },
      },
    ],
  },
});

const project = {'actors/plate.actor': PLATE, 'worlds/main.world': WORLD};

const sizes = (world: {actors: Iterable<unknown>}) =>
  [...world.actors].map(actor => {
    const size = (actor as {get(p: unknown): {x: number; y: number}}).get(
      IntrinsicSizeProperty,
    );
    return [size.x, size.y];
  });

describe('a drawing sized from the actor', () => {
  it('gives two of one kind two sizes', async () => {
    // The whole point. One `define drawing`, two Plates, two boxes — where
    // before there was one pair of numbers on the kind and no way to differ.
    const {world} = await compileProject(project);

    // AFTER A FRAME, and the reason is worth knowing. `add actor ⟨Plate⟩ do
    // set width …` places the actor and THEN runs the body, so at the instant
    // of placement its width is still the declared default and that is what
    // `World.place` reads. The size is asked again wherever the drawing runs,
    // so it is right from the first frame — a map placement's overrides are
    // applied before the actor is placed at all and never lag even that far.
    expect(sizes(world)).toEqual([
      [40, 12],
      [40, 12],
    ]);
    world.renderSnapshot();

    expect(sizes(world)).toEqual([
      [100, 12],
      [20, 12],
    ]);
  });

  it('paints each at its own size', async () => {
    // The canvas follows too, not only the property: a picture drawn at the
    // kind's size and stretched would be the same texture twice.
    const {world} = await compileProject(project);
    const painted = world
      .renderSnapshot()
      .map(state => (state as {drawing?: {width: number}}).drawing?.width);

    expect(painted).toEqual([100, 20]);
  });

  it('follows a size that changes, click box and all', async () => {
    // A Button made wider mid-game draws wider AND is clickable across its new
    // width. The two must not drift — everything that asks how big an actor is
    // reads `intrinsic size`, and the picture is what declares it.
    const {world, modules} = await compileProject(project);
    const widthOf = modules['actors/plate'].WidthProperty;
    const plate = [...world.actors][0];

    plate.set(widthOf as never, 64 as never);
    world.renderSnapshot();

    expect(plate.get(IntrinsicSizeProperty)).toEqual(
      expect.objectContaining({x: 64, y: 12}),
    );
  });

  it('still takes a plain number, which is most drawings', async () => {
    // A Coin is 16 by 16 and always will be. The socket holds a shadow, so a
    // fixed size is the block a learner has always dragged out.
    const fixed = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_actor',
            fields: {NAME: 'Chip'},
            next: {
              block: {
                type: 'world_define_drawing',
                inputs: {
                  WIDTH: {shadow: {type: 'math_number', fields: {NUM: 16}}},
                  HEIGHT: {shadow: {type: 'math_number', fields: {NUM: 8}}},
                  DO: {
                    block: {
                      type: 'world_draw_rectangle',
                      inputs: {
                        X: number(0),
                        Y: number(0),
                        WIDTH: number(16),
                        HEIGHT: number(8),
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    });
    const {world} = await compileProject({
      'actors/chip.actor': fixed,
      'worlds/main.world': JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_world',
              fields: {NAME: 'My World'},
              next: {
                block: {
                  type: 'world_add_actor',
                  fields: {ACTOR: 'actors/chip'},
                },
              },
            },
          ],
        },
      }),
    });

    expect(sizes(world)).toEqual([[16, 8]]);
  });
});
