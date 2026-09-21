// Clicking something that has been turned.
//
// A box test only works in the BOX's own frame. Comparing screen distances
// against half the width is right for an actor square on and wrong for every
// other one: a button turned forty-five degrees kept a hit box square to the
// SCREEN, so it answered clicks outside itself and ignored clicks on its own
// corners (`rules/pointing`).
//
// A WIDE button is what makes this visible at all. Turn a square one and the
// wrong box and the right box are nearly the same; turn a 120-by-32 one a
// quarter and they barely overlap.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {Vector} from '../../engine/core/Vector';
import {
  IntrinsicSizeProperty,
  RotationProperty,
} from '../../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** One wide Button in the middle, and a Label that records the clicks. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/button'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {ACTOR: me(), X: number(160), Y: number(160)},
                  next: {
                    block: {
                      type: 'world_set_Boxed_WidthProperty',
                      inputs: {ACTOR: me(), VALUE: number(120)},
                      next: {
                        block: {
                          type: 'world_set_Boxed_HeightProperty',
                          inputs: {ACTOR: me(), VALUE: number(32)},
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

const play = async () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('button')!,
  ).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const {world, modules} = await compileProject(
    projectFiles({
      ...source,
      files: {...source.files, [main.id]: {...main, contents: WORLD}},
    }),
  );
  world.tick(1 / 60);
  const button = [...world.actors].find(
    one => one.type === 'actors/button',
  )!;
  // HOW BIG IT IS DRAWN is what the hit test measures (`rules/pointing`,
  // `halfSize`), and a headless world has rasterized nothing — so the size a
  // driver would have measured is said here instead. 120 by 32: wide enough
  // that a quarter turn moves the box somewhere clearly different.
  button.set(IntrinsicSizeProperty, new Vector(120, 32));
  world.tick(1 / 60);
  let clicks = 0;
  button.on(modules['rules/mouse'].IsClickedWithEvent as never, () => {
    clicks += 1;
  });
  return {
    world,
    button,
    clicks: () => clicks,
    turn: (degrees: number) => {
      button.set(RotationProperty, degrees);
      world.tick(1 / 60);
    },
    tapAt: (x: number, y: number) => {
      world.setPointer({x, y}, ['left']);
      world.tick(1 / 60);
      world.setPointer({x, y}, []);
      world.tick(1 / 60);
    },
  };
};

describe('a button that has been turned', () => {
  it('still answers a click on its middle', async () => {
    const {turn, tapAt, clicks} = await play();
    turn(45);
    tapAt(160, 160);
    expect(clicks()).toBe(1);
  });

  it('answers along the way it is now facing', async () => {
    // Turned a quarter, a 120-wide button is 120 TALL on the screen. Fifty
    // above its middle is inside it, and was outside the square-on box.
    const {turn, tapAt, clicks} = await play();
    turn(90);
    tapAt(160, 110);
    expect(clicks()).toBe(1);
  });

  it('stops answering where it no longer is', async () => {
    // …and fifty to the SIDE is now past its end, though the square-on box
    // said it was well inside.
    const {turn, tapAt, clicks} = await play();
    turn(90);
    tapAt(210, 160);
    expect(clicks()).toBe(0);
  });

  it('is unchanged for an actor nobody turned', async () => {
    const {tapAt, clicks} = await play();
    tapAt(210, 160);
    expect(clicks()).toBe(1);
    tapAt(160, 110);
    expect(clicks()).toBe(1);
  });

  it('moves the corners round with it', async () => {
    // The far end of a wide button, turned half a turn, is on the other side.
    const {turn, tapAt, clicks} = await play();
    turn(180);
    tapAt(105, 160);
    expect(clicks()).toBe(1);
  });
});
