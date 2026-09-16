// The Slider, played: a press jumps it, a drag follows the pointer, letting
// go stops it, and it says when it moved.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {type Actor, type Property} from '../../engine';
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
