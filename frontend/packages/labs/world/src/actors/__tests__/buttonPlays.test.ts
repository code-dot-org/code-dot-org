// A Button, PRESSED — with the mouse, and without one.
//
// A control you can only reach with a pointer is a control half the people who
// meet it cannot use. So a Button takes the focus when it is clicked, draws a
// ring while it has it, and answers Enter — and what Enter does is raise the
// CLICK, which is what every button on every platform does.
//
// THE ONE HANDLER IS THE POINT. `when ⟨Start⟩ is clicked` has to fire for the
// mouse and for the keyboard, or a project has to write the same thing twice
// and every project that forgot has a button the keyboard cannot press. So
// what is asserted here is not "Enter does something" but "Enter does the same
// thing" (specs/UI_ACTORS.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {keyName} from '../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** `add actor ⟨Button⟩ do set position ⟨x, y⟩`. */
const place = (x: number, y: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/button'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {ACTOR: me(), X: number(x), Y: number(y)},
      },
    },
  },
});

/**
 * Two buttons well apart, and ONE handler that answers a click on either.
 *
 * `when any ⟨Button⟩ is clicked` — the handler a project actually writes. What
 * it says is which button was pressed, so a keyboard press that reached the
 * wrong one would be visible rather than merely absent.
 */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {block: {...place(80, 60), next: {block: place(80, 200)}}},
      },
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {
          ACTOR: {
            block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/button'}},
          },
        },
        next: {
          block: {
            type: 'world_print',
            inputs: {
              VALUE: {
                block: {
                  type: 'world_get_ActorsLabel_TextProperty',
                  // `this actor` inside an actor-scoped hat is the one the
                  // event was about. `event actor` is for an event that CARRIES
                  // one, and this one carries a mouse button.
                  inputs: {ACTOR: me()},
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
    stockActorById('button')!,
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
  const text = modules['actors/label'].TextProperty;
  const focused = modules['rules/tabNavigation'].FocusedProperty;
  const [top, bottom] = [...world.actors];
  // Told apart by what they SAY, since both are Buttons and the handler prints
  // the word on the one that was pressed.
  top.set(text as never, 'top' as never);
  bottom.set(text as never, 'bottom' as never);

  const said: string[] = [];
  const real = console.log;
  console.log = (...args: unknown[]) => said.push(args.map(String).join(' '));
  const done = () => {
    console.log = real;
  };

  return {
    world,
    top,
    bottom,
    said,
    done,
    holder: () =>
      [top, bottom].findIndex(one => one.get(focused as never) === true),
    /** The ring drawn on one button, or nothing — the yellow inset rectangle. */
    ringOn: (one: unknown) => {
      const state = [...world.renderSnapshot()].find(
        entry => entry.actor === one,
      );
      const ring = state?.drawing?.commands.find(
        command => command.op === 'rectangle' && command.stroke === '#ffd45e',
      );
      return ring?.op === 'rectangle' ? ring : undefined;
    },
    clickAt: (x: number, y: number) => {
      world.setPointer({x, y}, ['left']);
      world.tick(1 / 60);
      world.setPointer({x, y}, []);
      world.tick(1 / 60);
    },
    press: (domKey: string) => {
      world.setInput([keyName(domKey)]);
      world.tick(1 / 60);
      world.setInput([]);
      // Twice: the emit is queued by the handler and delivered on the tick
      // after it (`core/EventQueue`).
      world.tick(1 / 60);
      world.tick(1 / 60);
    },
    arrive: () => {
      world.gainedKeyboard();
      world.tick(1 / 60);
      world.tick(1 / 60);
    },
  };
};

describe('a Button', () => {
  it('takes the keyboard when it is clicked', async () => {
    const it_ = await play();
    it_.clickAt(80, 200);
    it_.done();

    expect(it_.holder()).toBe(1);
  });

  it('shows which one the keyboard is on', async () => {
    // A focus nobody can see is a focus nobody can use. The ring is drawn
    // INSIDE the face, because the canvas is exactly the actor's size and
    // anything outside it is clipped away.
    const it_ = await play();
    it_.arrive();
    it_.done();

    expect(it_.ringOn(it_.top)).toBeDefined();
    expect(it_.ringOn(it_.bottom)).toBeUndefined();
    // AN OUTLINE AND NOTHING ELSE. The pen is still carrying the word's fill
    // when the ring is drawn, so a ring that did not clear it would be a
    // rectangle painted over the word — which looks like the button going
    // blank rather than like it being chosen.
    expect(it_.ringOn(it_.top)?.fill).toBeUndefined();
    // …and it is inside the face, since the canvas is the actor's size and
    // anything outside it is clipped away.
    const ring = it_.ringOn(it_.top)!;
    expect(ring.x).toBeGreaterThan(0);
    expect(ring.x + ring.width).toBeLessThan(96);
  });

  it('is pressed by Enter, through the handler a click uses', async () => {
    // THE CLAIM. Not that Enter does something — that it does the same thing,
    // so `when ⟨Start⟩ is clicked` is the whole of what a project writes.
    const it_ = await play();
    it_.arrive();
    it_.press('Enter');
    it_.done();

    expect(it_.said).toEqual(['top']);
  });

  it('presses only the one the keyboard is on', async () => {
    // Every Button hears every key — that is what the trait means — so without
    // the guard one press would click every button on the screen.
    const it_ = await play();
    it_.arrive();
    it_.press('Tab');
    it_.press('Enter');
    it_.done();

    expect(it_.said).toEqual(['bottom']);
  });

  it('is not pressed by Enter while nothing is focused', async () => {
    const it_ = await play();
    it_.press('Enter');
    it_.done();

    expect(it_.said).toEqual([]);
  });

  it('still answers the mouse, and says so once', async () => {
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.done();

    expect(it_.said).toEqual(['top']);
  });
});
