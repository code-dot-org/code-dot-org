// The on-screen keyboard, TAPPED: a field fills from buttons on a map.
//
// The whole point is that nothing here is wired to the field. Every key raises
// what the player's keyboard raises, so what is pinned is that a Text Input
// which has never heard of this map fills from it — and that tapping a key
// does not take the keyboard away from the field it was meant for, which is
// what made a keyboard of plain Buttons useless (specs/KEYBOARD_PLAN.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import type {Actor} from '../../engine';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockMap} from '../importStockMap';
import {stockMapById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** One field, well above the keyboard, and the keyboard itself. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/textInput'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {ACTOR: me(), X: number(80), Y: number(60)},
                },
              },
            },
            next: {
              block: {type: 'world_load_map', fields: {MAP: 'maps/keyboard'}},
            },
          },
        },
      },
    ],
  },
});

const play = async () => {
  const withField = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('textInput')!,
  ).source;
  const source = importStockMap(withField, stockMapById('keyboard')!).source;
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

  const text = modules['actors/label'].TextProperty;
  const focused = modules['rules/tabNavigation'].FocusedProperty;
  const field = [...world.actors].find(
    actor => actor.type === 'actors/textInput',
  )!;
  /** Where an actor is on screen — a key's own position is its parent's. */
  const at = (actor: Actor) => {
    const state = world.renderSnapshot().find(entry => entry.actor === actor)!;
    return {x: state.x, y: state.y};
  };
  return {
    world,
    field,
    modules,
    /** A key by the id the map gave it — `Key A`, `Key backspace`. */
    key: (id: string) => [...world.actors].find(actor => actor.id === id)!,
    /** A press and the frame that reads it, then the release. */
    tap: (actor: Actor) => {
      const point = at(actor);
      world.setPointer(point, ['left']);
      world.tick(1 / 60);
      world.setPointer(point, []);
      world.tick(1 / 60);
      // …and one more, because what a key types is read by the frame AFTER
      // the handler that typed it (`World.type`).
      world.tick(1 / 60);
    },
    says: () => field.get(text as never) as unknown as string,
    hasFocus: (actor: Actor) => actor.get(focused as never) as unknown,
  };
};

describe('the on-screen keyboard', () => {
  it('types into whatever has the focus, and leaves it there', async () => {
    const {field, key, tap, says, hasFocus} = await play();
    tap(field);
    expect(hasFocus(field)).toBe(true);

    tap(key('Key H'));
    tap(key('Key I'));
    expect(says()).toBe('hi');
    expect(hasFocus(field)).toBe(true);
    expect(hasFocus(key('Key I'))).toBe(false);
  });

  it('backspaces, which is a key and not a character', async () => {
    const {field, key, tap, says} = await play();
    tap(field);
    tap(key('Key A'));
    tap(key('Key B'));
    expect(says()).toBe('ab');

    tap(key('Key backspace'));
    expect(says()).toBe('a');
  });

  it('types a space, a digit and a full stop', async () => {
    const {field, key, tap, says} = await play();
    tap(field);
    tap(key('Key A'));
    tap(key('Key space'));
    tap(key('Key 1'));
    tap(key('Key dot'));
    expect(says()).toBe('a 1.');
  });

  it('says the field is done when enter is tapped', async () => {
    const {field, key, tap, modules} = await play();
    tap(field);
    let done = 0;
    field.on(modules['actors/textInput'].IsDoneEvent as never, () => {
      done += 1;
    });
    tap(key('Key enter'));
    expect(done).toBe(1);
  });

  it('types nothing while nothing has the focus', async () => {
    const {key, tap, says} = await play();
    tap(key('Key A'));
    expect(says()).toBe('');
  });
});
