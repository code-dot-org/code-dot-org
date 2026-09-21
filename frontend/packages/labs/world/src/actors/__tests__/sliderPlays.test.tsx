// The Slider, played: a press jumps it, a drag follows the pointer, letting
// go stops it, and it says when it moved.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {type Actor, type Property} from '../../engine';
import {Vector} from '../../engine/core/Vector';
import {
  IntrinsicSizeProperty,
  RotationProperty,
} from '../../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});
const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const chain = (rows: object[]) =>
  rows.reduceRight((next, row) => ({...row, next: {block: next}}));

/** A Slider at (100, 100), 96 wide, and a Label that counts its changes. */
const project = (): MultiFileSource => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, stockActorById('slider')!).source;
  source = importStockActor(source, stockActorById('label')!).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Volume'},
          next: {
            block: chain([
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/slider'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(100), Y: number(100)},
                    },
                  },
                },
              },
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/label'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(100), Y: number(200)},
                    },
                  },
                },
              },
            ]),
          },
        },
        {
          type: 'world_on_ActorsSlider_ChangedEvent',
          inputs: {ACTOR: kind('actors/slider')},
          next: {
            block: {
              type: 'world_set_ActorsLabel_TextProperty',
              inputs: {
                ACTOR: kind('actors/label'),
                VALUE: {block: {type: 'text', fields: {TEXT: 'MOVED'}}},
              },
            },
          },
        },
      ],
    },
  });
  return {
    ...source,
    files: {...source.files, [main.id]: {...main, contents: world}},
  };
};

describe('a Slider', () => {
  const open = async () => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const actors = [...world.actors] as Actor[];
    const slider = actors.find(actor => actor.type === 'actors/slider')!;
    const label = actors.find(actor => actor.type === 'actors/label')!;
    const fraction = modules['actors/progressBar']
      .FractionProperty as Property<number>;
    const text = modules['actors/label'].TextProperty as Property<string>;
    return {
      world,
      slider,
      label,
      at: () => slider.get(fraction),
      said: () => label.get(text),
      press: (x: number) => {
        world.setPointer({x, y: 100}, ['left']);
        world.tick(1 / 60);
        world.tick(1 / 60);
      },
      drag: (x: number) => {
        world.setPointer({x, y: 100}, ['left']);
        world.tick(1 / 60);
      },
      release: () => {
        world.setPointer({x: 100, y: 100}, []);
        world.tick(1 / 60);
      },
    };
  };

  it('starts halfway, and jumps to a press', async () => {
    const s = await open();
    expect(s.at()).toBe(0.5);
    expect(s.said()).toBe('Label');
    // The slider spans 52 to 148; a press at 124 is three quarters along.
    s.press(124);
    expect(s.at()).toBeCloseTo(0.75, 5);
    s.world.tick(1 / 60);
    expect(s.said()).toBe('MOVED');
  }, 60000);

  it('nudges by a tenth on the arrow keys once it holds the focus', async () => {
    const s = await open();
    // A press brings the keyboard here (and jumps the slider to the press).
    s.press(100);
    s.release();
    expect(s.at()).toBeCloseTo(0.5, 5);
    const tap = (key: string) => {
      // The world's own key names (`engine/core/keys`).
      s.world.setInput([key]);
      s.world.tick(1 / 60);
      s.world.setInput([]);
      s.world.tick(1 / 60);
      s.world.tick(1 / 60);
    };
    tap('right arrow');
    expect(s.at()).toBeCloseTo(0.6, 5);
    tap('left arrow');
    tap('left arrow');
    expect(s.at()).toBeCloseTo(0.4, 5);
  }, 60000);

  it('follows the pointer while held, past either end, and lets go', async () => {
    const s = await open();
    s.press(124);
    s.drag(76);
    expect(s.at()).toBeCloseTo(0.25, 5);
    // Past the end is the end.
    s.drag(0);
    expect(s.at()).toBe(0);
    s.release();
    // Not held: the button going down somewhere else, and the pointer
    // wandering along the slider's line, move nothing. (A press ON the
    // slider would be a new click, and a jump.)
    s.world.setPointer({x: 148, y: 300}, ['left']);
    s.world.tick(1 / 60);
    s.world.setPointer({x: 148, y: 100}, ['left']);
    s.world.tick(1 / 60);
    expect(s.at()).toBe(0);
  }, 60000);
});

// A Slider stood on end, which is the ordinary reason to turn one: a volume
// fader runs up and down, not left to right.
//
// Before, the pointer's distance was measured on the SCREEN's x axis, so a
// vertical slider could only be dragged sideways — along an axis it no longer
// had (`actors/stock/slider`, `alongX`).
describe('a Slider that has been turned', () => {
  /** The one in `project()`: 96 wide, 24 tall, middle at (100, 100). */
  const WIDE = 96;
  const MIDDLE = {x: 100, y: 100};

  const upright = async (degrees: number) => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const slider = [...world.actors].find(
      actor => actor.type === 'actors/slider',
    )!;
    const fraction = modules['actors/progressBar']
      .FractionProperty as Property<number>;
    slider.set(RotationProperty, degrees);
    // The hit test measures what was DRAWN, and a headless world has
    // rasterized nothing — so the size a driver would have measured is said
    // here (`rules/pointing`, `halfSize`).
    slider.set(IntrinsicSizeProperty, new Vector(WIDE, 24));
    world.tick(1 / 60);
    return {
      at: () => slider.get(fraction),
      press: (x: number, y: number) => {
        world.setPointer({x, y}, ['left']);
        world.tick(1 / 60);
        world.tick(1 / 60);
      },
    };
  };

  it('follows the pointer ALONG it when it is stood on end', async () => {
    // Turned a quarter clockwise, the slider's own "along" runs down the
    // screen: a third of the way past the middle is a third down.
    const {at, press} = await upright(90);
    press(MIDDLE.x, MIDDLE.y + WIDE / 4);
    expect(at()).toBeCloseTo(0.75, 2);

    press(MIDDLE.x, MIDDLE.y - WIDE / 4);
    expect(at()).toBeCloseTo(0.25, 2);
  });

  it('does not answer a sideways press any more', async () => {
    // Along the screen's x is ACROSS a vertical slider — twelve pixels of it
    // and then nothing, so this misses the actor altogether.
    const {at, press} = await upright(90);
    press(MIDDLE.x + WIDE / 2, MIDDLE.y);
    expect(at()).toBe(0.5);
  });

  it('runs the other way when it is upside down', async () => {
    // Half a turn makes the cosine negative, so the far end is on the left —
    // which is what the thing on screen looks like it should do.
    const {at, press} = await upright(180);
    press(MIDDLE.x - WIDE / 4, MIDDLE.y);
    expect(at()).toBeCloseTo(0.75, 2);
  });

  it('is unchanged lying flat', async () => {
    const {at, press} = await upright(0);
    press(MIDDLE.x + WIDE / 4, MIDDLE.y);
    expect(at()).toBeCloseTo(0.75, 2);
  });
});
