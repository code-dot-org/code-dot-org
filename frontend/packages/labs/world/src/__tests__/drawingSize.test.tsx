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

import {actorDocument} from '../actors/actorDocument';
import {IntrinsicSizeProperty} from '../engine/rules/spatial';

import {compileProject} from './support/compileProject';
import {levelScreen} from './support/levelScreen';

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
const PLATE = actorDocument({
  name: 'Plate',
  properties: [
    {name: 'width', type: 'number', access: 'writable', value: '40'},
    {name: 'height', type: 'number', access: 'writable', value: '12'},
  ],
  drawing: {
    width: own('Width'),
    height: own('Height'),
    body: {
      type: 'world_draw_rectangle',
      inputs: {
        X: number(0),
        Y: number(0),
        WIDTH: own('Width'),
        HEIGHT: own('Height'),
      },
    },
  },
});

/** A Plate placed on the screen, its width set on the placement. */
const placed = (id: string, width: number) => ({
  type: 'actors/plate',
  id,
  properties: {Plate: {width}},
});

/** Two Plates of one kind, made two different widths. */
const SCREEN = levelScreen(
  {},
  {actors: [placed('plate', 100), placed('plate2', 20)]},
);

const project = {'actors/plate.actor': PLATE, 'screens/main.screen': SCREEN};

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

    // FROM THE START. A placement's overrides are applied before the actor
    // is placed, so its size never lags. The size is asked again wherever the
    // drawing runs, as well.
    expect(sizes(world)).toEqual([
      [100, 12],
      [20, 12],
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
    const fixed = actorDocument({
      name: 'Chip',
      drawing: {
        width: {shadow: {type: 'math_number', fields: {NUM: 16}}},
        height: {shadow: {type: 'math_number', fields: {NUM: 8}}},
        body: {
          type: 'world_draw_rectangle',
          inputs: {
            X: number(0),
            Y: number(0),
            WIDTH: number(16),
            HEIGHT: number(8),
          },
        },
      },
    });
    const {world} = await compileProject({
      'actors/chip.actor': fixed,
      'screens/main.screen': levelScreen({
        blocks: {
          blocks: [
            {
              type: 'world_on_screen_loads',
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
