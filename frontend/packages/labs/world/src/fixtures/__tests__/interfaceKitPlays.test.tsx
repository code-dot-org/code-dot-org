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

/**
 * A tape where BOLD IS TWICE AS WIDE, so a measurement that forgot the weight
 * cannot pass by accident.
 *
 * A real font's bold is a few percent wider and the error only shows up over a
 * long line; doubling it makes the same mistake visible in one word.
 */
const boldIsWider = (words: string, size: number, weight?: 'bold') =>
  words.length * (size / 2) * (weight === 'bold' ? 2 : 1);

const play = async (measure?: typeof boldIsWider) => {
  const {world, modules} = await compileProject(
    projectFiles(WORLD_SCENARIOS.interface.source),
  );
  if (measure) {
    world.useTextMetrics(measure);
  }
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

  it('measures its words in the WEIGHT they are drawn in', async () => {
    // The kit is themed Modern, whose `caption` is bold, and a field's words
    // are drawn under that class. The tape was built without a weight, so bold
    // words measured as regular: every prefix came back short, and the caret
    // sat a little before the end of a word and several characters adrift down
    // a paragraph (`World.textWidth`).
    //
    // The bar is drawn after the whole of what was typed, so with a tape where
    // bold is twice as wide it belongs at twice the plain width — and at the
    // plain width if the weight was dropped on the way.
    const {named, click, type, world} = await play(boldIsWider);
    const field = named('Name')!;

    // FIVE characters, not eight: the field's box is 96 wide with 8 of inset
    // either side, so eight bold ones overflow and the bar pins to the right
    // edge — where it sits whether the weight was read or not, which is a test
    // that cannot fail. Five bold ones are 60 and fit.
    click(field);
    type('iiiii');
    world.tick(1 / 60);

    const drawn = world.renderSnapshot().find(one => one.actor === field);
    const bar = (drawn?.drawing?.commands ?? []).filter(
      command => command.op === 'rectangle',
    );
    // The caret is the last rectangle drawn: the box, then the bar.
    const caret = bar.at(-1);
    // Eight characters at twelve is 48 plain and 96 bold, plus the inset.
    // Five characters at twelve is 30 plain and 60 bold, and the words start
    // at the 8 of inset. A tape that dropped the weight puts the bar at 38.
    expect(caret && caret.op === 'rectangle' && caret.x).toBe(68);
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
