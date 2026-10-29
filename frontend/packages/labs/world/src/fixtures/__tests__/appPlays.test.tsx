// Notes, PLAYED: the six pieces of specs/APPS.md crossing each other.
//
// Every one of them has a test of its own. What none of those can show is a
// seam — the field is on the screen that `go back` is about to take off, and
// the thing that gets saved is a property of the game rather than of anything
// on screen. This is the first test where all of that is true at once.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import type {Actor, World} from '../../engine';
import {NO_CLOCK} from '../../engine/core/clock';
import {PositionProperty} from '../../engine/rules/spatial';
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
    /** Type a run of letters, as the real keyboard does. */
    typeIn: (letters: string) => {
      world.type(letters);
      world.tick(1 / 60);
      world.tick(1 / 60);
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

  it('holds NEW NOTE at the foot of the window, not in the middle of it', async () => {
    // THE WINDOW IS SIZED BY THE WORLD'S BODY, which runs AFTER the main map
    // is loaded (specs/MAP_BEFORE_ROWS_PLAN.md). So the anchors were measured
    // against the default 320x320 window and never measured again: the button
    // sat at y=264, which is the middle of the 576-tall window the body then
    // asked for (`World.reanchor`).
    const {world, named} = await play();
    const view = world.viewSize();
    expect(view).toMatchObject({x: 320, y: 576});

    // Where the map drew it: 56 up from the bottom of a 576-tall map. The
    // window is that shape, so the anchor should have moved it nowhere.
    expect(named('New')!.get(PositionProperty)).toMatchObject({x: 160, y: 520});
    // …and the header is still its own distance from the top.
    expect(named('Header')!.get(PositionProperty)).toMatchObject({
      x: 160,
      y: 48,
    });
  });

  it('goes to the form, a screen of its own over home', async () => {
    const {world, named, tap, field} = await play();
    expect(field()).toBeFalsy();

    tap(named('New')!);
    expect(field()).toBeTruthy();
    expect(world.screens()).toHaveLength(2);
  });

  it('types into the form and keeps what was written', async () => {
    const {named, tap, field, typeIn, says, listed} = await play();
    tap(named('New')!);
    tap(field());
    typeIn('milk');
    expect(says(field())).toBe('milk');

    tap(named('Save')!);
    // Filed by its day. The date is exact rather than approximate because a
    // world nobody lent a clock sits at one fixed moment — which is the whole
    // reason the headless default is fixed (specs/CLOCK_PLAN.md).
    expect(listed()).toEqual(['2000-01-01  milk']);
  });

  it('takes the form away on the way back', async () => {
    const {world, named, tap, field, typeIn} = await play();
    tap(named('New')!);
    tap(field());
    typeIn('milk');
    tap(named('Save')!);

    expect(field()).toBeFalsy();
    expect(world.screens()).toHaveLength(1);
    // …and home is still underneath, never having been unloaded.
    expect(named('Header')).toBeTruthy();
  });

  it('keeps nothing when the form is cancelled', async () => {
    const {named, tap, field, typeIn, listed} = await play();
    tap(named('New')!);
    tap(field());
    typeIn('milk');
    tap(named('Cancel')!);

    expect(listed()).toEqual([]);
    expect(named('Entry')).toBeFalsy();
  });

  it('gives the screen in front the clicks, and the one behind none', async () => {
    const {world, named, tap, fields, listed} = await play();
    tap(named('New')!);

    // NEW NOTE is under the write screen now, and only the top screen takes
    // a tap: no second form opens (specs/SCREEN_STACK_PLAN.md).
    tap(named('New')!);
    expect(fields()).toHaveLength(1);
    expect(world.screens()).toHaveLength(2);
    expect(listed()).toEqual([]);
  });

  it('keeps a note as a RECORD, with its fields apart', async () => {
    // The row on screen still reads `2000-01-01  milk`, and that is now a
    // VIEW: the date is a number on the record and the words are a field
    // beside it, joined at the moment the list is built. Before records there
    // was one string doing both jobs (specs/RECORDS_PLAN.md).
    const {world, named, tap, field, typeIn} = await play();
    tap(named('New')!);
    tap(field());
    typeIn('milk');
    tap(named('Save')!);

    const notes = [...world.actors].filter(one => one.type === 'actors/note');
    expect(notes).toHaveLength(1);
    const kept = Object.fromEntries(
      notes[0].ownProperties().map(one => [one.id, notes[0].get(one)]),
    );
    expect(kept).toEqual({text: 'milk', at: NO_CLOCK});
  });

  it('keeps its records nowhere, so they are not on the screen', async () => {
    // `is data`: a record has fields and no place. Fifty notes are not fifty
    // things drawn behind the list showing them.
    const {world, named, tap, field, typeIn} = await play();
    tap(named('New')!);
    tap(field());
    typeIn('milk');
    tap(named('Save')!);

    const drawn = world.renderSnapshot().map(state => state.actor.type);
    expect(drawn).not.toContain('actors/note');
    expect([...world.actors].some(one => one.type === 'actors/note')).toBe(
      true,
    );
  });

  it('is still there after a reload', async () => {
    const first = await play();
    first.tap(first.named('New')!);
    first.tap(first.field());
    first.typeIn('milk');
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
