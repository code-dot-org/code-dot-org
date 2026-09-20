// Notes, PLAYED: the six pieces of specs/APPS.md crossing each other.
//
// Every one of them has a test of its own. What none of those can show is a
// seam — the field is on the screen that `go back` is about to unload, the
// keyboard goes on over the form and has to come off with it, and the thing
// that gets saved is a property of the world rather than of anything on
// screen. This is the first test where all of that is true at once.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import type {Actor, World} from '../../engine';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

/** A browser's `localStorage`, as much of it as the world asks for. */
const memory = () => {
  const held = new Map<string, string>();
  return {
    held,
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => void held.set(key, value),
    removeItem: (key: string) => void held.delete(key),
  };
};

const ofKind = (world: World, kind: string): Actor[] =>
  [...world.actors].filter(actor => actor.type === kind);

/**
 * Start the app, with a storage lent as a driver lends one.
 *
 * `held` is carried between runs on purpose: a reload is a NEW WORLD over the
 * SAME storage, which is the only way to test that anything was really saved.
 */
const play = async (held?: Map<string, string>) => {
  const store = memory();
  if (held) {
    for (const [key, value] of held) {
      store.held.set(key, value);
    }
  }
  const {world, modules} = await compileProject(
    projectFiles(WORLD_SCENARIOS.app.source),
  );
  world.useStorage(store);
  world.tick(1 / 60);

  const text = modules['actors/label'].TextProperty;
  const items = modules['actors/list'].ItemsProperty;
  const at = (actor: Actor) => {
    const state = world.renderSnapshot().find(entry => entry.actor === actor)!;
    return {x: state.x, y: state.y};
  };
  const tap = (actor: Actor) => {
    const point = at(actor);
    world.setPointer(point, ['left']);
    world.tick(1 / 60);
    world.setPointer(point, []);
    world.tick(1 / 60);
    // …and one more, because what a key types is read by the frame after the
    // handler that typed it (`World.type`).
    world.tick(1 / 60);
  };
  return {
    world,
    store,
    at,
    tap,
    /** A placement by the id its map gave it. */
    named: (id: string) => [...world.actors].find(actor => actor.id === id),
    field: () => ofKind(world, 'actors/textInput')[0],
    /** Every form on screen — one, unless a screen behind opened another. */
    fields: () => ofKind(world, 'actors/textInput'),
    list: () => ofKind(world, 'actors/list')[0],
    says: (actor: Actor) => actor.get(text as never) as unknown as string,
    listed: () => (
      world.actors,
      ofKind(world, 'actors/list')[0]?.get(items as never) as unknown
    ),
    /** Tap a run of keys on the on-screen keyboard, by their map ids. */
    typeOnScreen: (letters: string) => {
      for (const letter of letters) {
        const id = letter === ' ' ? 'Key space' : `Key ${letter.toUpperCase()}`;
        const key = [...world.actors].find(actor => actor.id === id)!;
        tap(key);
      }
    },
  };
};

describe('Notes, the app', () => {
  it('opens on the home screen, with nothing written yet', async () => {
    const {named, listed, list} = await play();
    expect(named('Header')).toBeTruthy();
    expect(named('Notes')).toBeTruthy();
    expect(list()).toBeTruthy();
    expect(listed()).toEqual([]);
  });

  it('goes to the form, and brings a keyboard with it', async () => {
    const {named, tap, field} = await play();
    expect(field()).toBeFalsy();

    tap(named('New')!);
    // The form, and the keyboard over it.
    expect(field()).toBeTruthy();
    expect(named('Key A')).toBeTruthy();
    expect(named('Keyboard')).toBeTruthy();
  });

  it('types with the on-screen keyboard and keeps what was written', async () => {
    const {named, tap, field, typeOnScreen, says, listed} = await play();
    tap(named('New')!);
    tap(field());
    typeOnScreen('milk');
    expect(says(field())).toBe('milk');

    tap(named('Save')!);
    // Filed by its day. The date is exact rather than approximate because a
    // world nobody lent a clock sits at one fixed moment — which is the whole
    // reason the headless default is fixed (specs/CLOCK_PLAN.md).
    expect(listed()).toEqual(['2000-01-01  milk']);
  });

  it('takes the form AND the keyboard away on the way back', async () => {
    const {named, tap, field, typeOnScreen} = await play();
    tap(named('New')!);
    tap(field());
    typeOnScreen('milk');
    tap(named('Save')!);

    expect(named('Key A')).toBeFalsy();
    expect(named('Keyboard')).toBeFalsy();
    expect(field()).toBeFalsy();
    // …and home is still underneath, never having been unloaded.
    expect(named('Header')).toBeTruthy();
  });

  it('keeps nothing when the form is cancelled', async () => {
    const {named, tap, field, typeOnScreen, listed} = await play();
    tap(named('New')!);
    tap(field());
    typeOnScreen('milk');
    tap(named('Cancel')!);

    expect(listed()).toEqual([]);
    expect(named('Key A')).toBeFalsy();
  });

  it('gives the screen in front the clicks, and the one behind none', async () => {
    const {named, tap, field, fields, says, listed} = await play();
    tap(named('New')!);

    // `Key B` is the middle of the keyboard's third row, which sits exactly
    // over NEW NOTE at the foot of the home screen. Both are under the
    // pointer; only the one on the screen in front may have it.
    tap(named('Key B')!);
    expect(says(field())).toBe('b');
    // …and no second form opened behind the first, which is what this did
    // before a map could say it was a screen (specs/MODALITY_PLAN.md).
    expect(fields()).toHaveLength(1);
    expect(listed()).toEqual([]);
  });

  it('keeps the keyboard working, which is above the screen and not one', async () => {
    const {named, tap, field, typeOnScreen, says} = await play();
    tap(named('New')!);
    tap(field());
    // The keyboard is loaded OVER the form and is NOT modal, so the form it
    // types into is still reachable — the key case for measuring from the
    // topmost modal load rather than from the top of the stack.
    typeOnScreen('hi');
    expect(says(field())).toBe('hi');
    tap(named('Save')!);
    expect(named('Entry')).toBeFalsy();
  });

  it('is still there after a reload', async () => {
    const first = await play();
    first.tap(first.named('New')!);
    first.tap(first.field());
    first.typeOnScreen('milk');
    first.tap(first.named('Save')!);
    expect(first.listed()).toEqual(['2000-01-01  milk']);

    // A NEW WORLD over the same storage, which is what a reload is. The date
    // comes back with the note because a moment is a NUMBER turned into words
    // at the moment it is written — there is nothing extra to save.
    const again = await play(first.store.held);
    expect(again.listed()).toEqual(['2000-01-01  milk']);
  });

  it('starts empty on a browser that remembers nothing', async () => {
    const {listed} = await play();
    expect(listed()).toEqual([]);
  });
});
