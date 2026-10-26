// The Image, PLAYED: a picture drawn into a box.
//
// It is drawn (specs/ACTORS_AS_DATA_PLAN.md, step 4): its drawing is the size
// of the box and draws its `picture` into it, fitted or stretched. The fit is
// worked out where the picture is painted (`paintDrawing.placeInBox`, tested
// there); what is pinned here is what the Image asks to be drawn.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {ScaleProperty} from '../../engine/rules/spatial';
import {EMPTY_WORLD_PROJECT} from '../../fixtures/scenarios';
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
    EMPTY_WORLD_PROJECT,
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
  const own = modules['actors/image'];
  return {
    world,
    picture,
    show: (file: string) =>
      picture.set(own.PictureProperty as never, file as never),
    stretch: (on: boolean) =>
      picture.set(own.StretchesProperty as never, on as never),
    /** What it asks to be drawn, now. */
    drawn: () =>
      world.renderSnapshot().find(state => state.actor === picture)!.drawing,
    scale: () => picture.get(ScaleProperty) as {x: number; y: number},
  };
};

describe('an Image drawing its picture', () => {
  it('draws its picture into its box, fitted', async () => {
    const {drawn} = await play();
    expect(drawn()).toMatchObject({width: 100, height: 50});
    expect(drawn()!.commands).toEqual([
      {op: 'image', sprite: 'player.png', x: 0, y: 0, width: 100, height: 50},
    ]);
  });

  it('fills the box when told to stretch', async () => {
    const {drawn, stretch} = await play();
    stretch(true);
    expect(drawn()!.commands).toEqual([
      {
        op: 'image',
        sprite: 'player.png',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        stretch: true,
      },
    ]);
  });

  it('follows the picture when it is swapped for another', async () => {
    const {drawn, show} = await play();
    show('coin.png');
    expect(drawn()!.commands[0]).toMatchObject({sprite: 'coin.png'});
  });

  it('draws nothing with no picture', async () => {
    const {drawn, show} = await play();
    show('');
    expect(drawn()!.commands).toEqual([]);
  });

  it('leaves its own scale alone, which a placement may use', async () => {
    const {world, scale} = await play();
    world.tick(1 / 60);
    expect(scale()).toEqual({x: 1, y: 1});
  });
});
