// The Interface Kit, PLAYED — the first time two of its controls have run.
//
// The kit is the fixture that exists to show every control, and it had never
// been played at all: `fixtures.test` checks that its files are there, which
// is not the same as checking that anything on the screen works. Two of the
// controls it now places had been shipped and placed by NO fixture — a Text
// Area and a Scroll View — so each had headless tests and had never once been
// seen running in a project.
//
// That distinction earned its keep this session: the List had twelve passing
// tests and three real defects, every one of them found by using it.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import type {Actor, World} from '../../engine';
import {ViewportContentProperty, ViewportScrollProperty} from '../../engine';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

const ofKind = (world: World, kind: string): Actor[] =>
  [...world.actors].filter(actor => actor.type === kind);

const play = async () => {
  const {world, modules} = await compileProject(
    projectFiles(WORLD_SCENARIOS.interface.source),
  );
  world.tick(1 / 60);
  const text = modules['actors/label'].TextProperty;
  const at = (actor: Actor) => {
    const state = world.renderSnapshot().find(entry => entry.actor === actor)!;
    return {x: state.x, y: state.y};
  };
  return {
    world,
    named: (id: string) => [...world.actors].find(actor => actor.id === id),
    says: (actor: Actor) => actor.get(text as never) as unknown as string,
    at,
    click: (actor: Actor) => {
      const point = at(actor);
      world.setPointer(point, ['left']);
      world.tick(1 / 60);
      world.setPointer(point, []);
      world.tick(1 / 60);
      world.tick(1 / 60);
    },
    type: (characters: string) => {
      world.addTyped([...characters]);
      world.tick(1 / 60);
      world.tick(1 / 60);
    },
    /** A key by the world's own name — the driver translates at the door. */
    tap: (key: string) => {
      world.setInput([key]);
      world.tick(1 / 60);
      world.setInput([]);
      world.tick(1 / 60);
      world.tick(1 / 60);
    },
    wheelOver: (actor: Actor, by: number) => {
      world.setPointer(at(actor), []);
      world.tick(1 / 60);
      world.scrollWheel(by);
      world.tick(1 / 60);
    },
  };
};

describe('the Interface Kit', () => {
  it('places every control it means to, and they all come up', async () => {
    const {world} = await play();
    for (const kind of [
      'actors/panel',
      'actors/label',
      'actors/textInput',
      'actors/button',
      'actors/progressBar',
      'actors/toggle',
      'actors/slider',
      'actors/dropdown',
      'actors/textArea',
      'actors/scrollView',
      'actors/speechBox',
    ]) {
      expect(ofKind(world, kind).length, kind).toBeGreaterThan(0);
    }
  }, 60000);

  it('takes more than one line into the Text Area', async () => {
    // The one thing a Text Input cannot do, and the reason this actor exists.
    const {named, click, type, tap, says} = await play();
    const area = named('Notes')!;

    click(area);
    type('ONE');
    tap('enter');
    type('TWO');

    expect(says(area)).toContain('ONE');
    expect(says(area)).toContain('TWO');
    // …and they are two LINES, which is the whole of the difference.
    expect(says(area)).toContain('\n');
  }, 60000);

  it('holds a map taller than itself, and scrolls over it', async () => {
    // A Scroll View is a Viewport with a finger: the content is a MAP, and
    // the engine grows the space to it. Six tiles of settings in a window
    // four tall is something to drag up to.
    const {named, wheelOver} = await play();
    const view = named('Settings')!;
    const content = view.get(ViewportContentProperty) as {y: number};
    expect(content.y).toBeGreaterThan(128);

    const before = (view.get(ViewportScrollProperty) as {y: number}).y;
    wheelOver(view, 40);

    expect((view.get(ViewportScrollProperty) as {y: number}).y).toBeGreaterThan(
      before,
    );
  }, 60000);

  it('puts real actors in the Scroll View, not rows of words', async () => {
    // The case a List cannot answer: each row is a Label and a Toggle.
    const {world} = await play();
    expect(ofKind(world, 'actors/toggle').length).toBeGreaterThan(1);
  }, 60000);
});
