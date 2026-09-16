// The Toggle, played: a click flips it and says which way it went.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {
  type Actor,
  PositionProperty,
  type Property,
  Vector,
} from '../../engine';
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

/** A world with a Toggle and a Label, the Label saying what the Toggle did. */
const project = (): MultiFileSource => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, stockActorById('toggle')!).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const says = (what: string) => ({
    type: 'world_set_ActorsLabel_TextProperty',
    inputs: {
      ACTOR: kind('actors/label'),
      VALUE: {block: {type: 'text', fields: {TEXT: what}}},
    },
  });
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Switch'},
          next: {
            block: chain([
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/toggle'},
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
          type: 'world_on_ActorsToggle_TurnedOnEvent',
          inputs: {ACTOR: kind('actors/toggle')},
          next: {block: says('ON')},
        },
        {
          type: 'world_on_ActorsToggle_TurnedOffEvent',
          inputs: {ACTOR: kind('actors/toggle')},
          next: {block: says('OFF')},
        },
      ],
    },
  });
  return {
    ...source,
    files: {...source.files, [main.id]: {...main, contents: world}},
  };
};

describe('a Toggle', () => {
  it('flips on a click, and says so', async () => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const actors = [...world.actors] as Actor[];
    const toggle = actors.find(actor => actor.type === 'actors/toggle')!;
    const label = actors.find(actor => actor.type === 'actors/label')!;
    const on = modules['actors/toggle'].OnProperty as Property<boolean>;
    const text = modules['actors/label'].TextProperty as Property<string>;
    const click = () => {
      world.setPointer({x: 100, y: 100}, ['left']);
      world.tick(1 / 60);
      world.setPointer({x: 100, y: 100}, []);
      world.tick(1 / 60);
      world.tick(1 / 60);
    };
    expect(toggle.get(on)).toBe(false);
    expect(toggle.get(PositionProperty)).toEqual(new Vector(100, 100));
    click();
    expect(toggle.get(on)).toBe(true);
    expect(label.get(text)).toBe('ON');
    click();
    expect(toggle.get(on)).toBe(false);
    expect(label.get(text)).toBe('OFF');
  }, 60000);

  it('draws its knob at the end `on` says', async () => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const toggle = ([...world.actors] as Actor[]).find(
      actor => actor.type === 'actors/toggle',
    )!;
    const knob = () => {
      const state = world.renderSnapshot().find(one => one.actor === toggle)!;
      return state.drawing!.commands.find(
        command => command.op === 'circle',
      ) as {x: number} | undefined;
    };
    const off = knob()!.x;
    toggle.set(modules['actors/toggle'].OnProperty as Property<boolean>, true);
    expect(knob()!.x).toBeGreaterThan(off);
  }, 60000);
});
