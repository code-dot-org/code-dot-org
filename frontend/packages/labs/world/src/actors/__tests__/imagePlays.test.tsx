// The Image, PLAYED: a picture made to sit in a box.
//
// The fitting is arithmetic over two numbers the engine supplies — how big the
// picture is and how big the box is — so what is pinned is the arithmetic and
// the one case it has to refuse: a box with no picture in it
// (specs/UI_ACTORS.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {Vector} from '../../engine/core/Vector';
import {IntrinsicSizeProperty, ScaleProperty} from '../../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** One Image, in a box 100 wide and 50 tall. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/image'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_Boxed_WidthProperty',
                  inputs: {ACTOR: me(), VALUE: number(100)},
                  next: {
                    block: {
                      type: 'world_set_Boxed_HeightProperty',
                      inputs: {ACTOR: me(), VALUE: number(50)},
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
    stockActorById('image')!,
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
  const picture = [...world.actors].find(
    actor => actor.type === 'actors/image',
  )!;
  const stretches = modules['actors/image'].StretchesProperty;
  return {
    world,
    picture,
    /** Say how big the file is, which is what a loaded picture reports. */
    sized: (w: number, h: number) => {
      picture.set(IntrinsicSizeProperty, new Vector(w, h));
      world.tick(1 / 60);
    },
    stretch: (on: boolean) => picture.set(stretches as never, on as never),
    scale: () => picture.get(ScaleProperty) as {x: number; y: number},
  };
};

describe('an Image fitting its box', () => {
  it('leaves a picture alone until there is one', async () => {
    // No sprite means an intrinsic size of zero, and a box divided by zero is
    // an infinite scale — which draws nothing and looks exactly like a missing
    // picture, so the cause would be invisible.
    const {world, scale} = await play();
    world.tick(1 / 60);
    expect(scale()).toEqual({x: 1, y: 1});
  });

  it('fits a wide picture by its width', async () => {
    // 200 by 40 into 100 by 50: width wants a half, height wants 1.25, and the
    // whole picture only fits at the smaller of the two.
    const {sized, scale} = await play();
    sized(200, 40);
    expect(scale()).toEqual({x: 0.5, y: 0.5});
  });

  it('fits a tall picture by its height', async () => {
    // 50 by 200 into 100 by 50: height wants a quarter, width wants two.
    const {sized, scale} = await play();
    sized(50, 200);
    expect(scale()).toEqual({x: 0.25, y: 0.25});
  });

  it('keeps the picture’s shape, so both axes scale together', async () => {
    const {sized, scale} = await play();
    sized(300, 300);
    const at = scale();
    expect(at.x).toBe(at.y);
  });

  it('fills the box exactly when told to stretch', async () => {
    const {sized, stretch, scale, world} = await play();
    sized(200, 200);
    stretch(true);
    world.tick(1 / 60);
    // Each axis takes its own ratio: 100/200 across and 50/200 down.
    expect(scale()).toEqual({x: 0.5, y: 0.25});
  });

  it('follows the picture when it is swapped for another', async () => {
    const {sized, scale} = await play();
    sized(200, 40);
    expect(scale().x).toBe(0.5);
    sized(400, 80);
    expect(scale().x).toBe(0.25);
  });
});
