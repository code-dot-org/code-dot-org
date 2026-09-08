// The Text Input, PLAYED: typed at, backspaced, and told to let go.
//
// It is the first actor that takes something other than a press, and every
// part of that is behavior: what it holds is what was TYPED, backspace is a
// KEY because it makes no character, and which of two fields is listening is
// decided by a clear and a set in one frame (specs/UI_ACTORS.md).
//
// TWO OF THEM, because one field cannot show that the focus goes anywhere. A
// field that simply took every character would pass every test a single field
// can be given, and would put both halves of a form into whichever one was
// placed last.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {keyName} from '../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import type {StockActor} from '../stock';
import {textInputActor} from '../stock/textInput';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** `add actor ⟨Text Input⟩ do set position …` */
const place = (x: number, y: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/textInput'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {ACTOR: me(), X: number(x), Y: number(y)},
      },
    },
  },
});

/** Two fields, well apart, so a click can only be on one of them. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {block: {...place(80, 60), next: {block: place(80, 200)}}},
      },
    ],
  },
});

/**
 * The shelf entry this actor WOULD have, written here because it has none yet.
 *
 * It is finished and it is not shipped: every stock actor has to be granted by
 * a progression tile (`progression/__tests__/layout`, "covers every stock
 * actor"), a tile needs a lesson, and a lesson that teaches typing needs a
 * check that can TYPE — which the trace format has no step for. All of that is
 * curriculum rather than code, so the actor waits for it here rather than
 * arriving on a shelf a learner cannot be sent to (specs/UI_ACTORS.md).
 */
const TEXT_INPUT: StockActor = {
  id: 'textInput',
  name: 'Text Input',
  description: 'A line you can type into.',
  requires: ['Input', 'Mouse'],
  actors: ['label'],
  contents: textInputActor,
};

const play = async () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    TEXT_INPUT,
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
  const [top, bottom] = [...world.actors];
  return {
    world,
    top,
    bottom,
    says: (one: typeof world.actors extends Iterable<infer T> ? T : never) =>
      one.get(text as never) as unknown as string,
    /** A click at a point, which is a press and then the frame that reads it. */
    clickAt: (x: number, y: number) => {
      world.setPointer({x, y}, ['left']);
      world.tick(1 / 60);
      world.setPointer({x, y}, []);
      world.tick(1 / 60);
    },
    type: (characters: string[]) => {
      world.addTyped(characters);
      world.tick(1 / 60);
    },
    /**
     * A key, named as the BROWSER names it and translated at the door.
     *
     * `keyName` is what the driver calls on the way in, and going round it is
     * how this test came to pass while backspace did not work at all: the
     * table had no `Backspace`, so the real driver produced `Backspace` where
     * the field listened for `backspace`, and a test that handed the engine
     * the engine's own name never met the gap (`engine/core/keys`).
     */
    press: (domKey: string) => {
      world.setInput([keyName(domKey)]);
      world.tick(1 / 60);
      world.setInput([]);
      world.tick(1 / 60);
    },
  };
};

describe('a Text Input', () => {
  it('keeps nothing until it is clicked', async () => {
    // A field nobody has chosen is not the field the typing goes to. It ships
    // empty as well, where a Label ships saying "Label": words nobody typed
    // are words whose first keystroke has to delete them.
    const it_ = await play();
    it_.type(['n', 'o']);

    expect(it_.says(it_.top)).toBe('');
    expect(it_.says(it_.bottom)).toBe('');
  });

  it('takes what is typed at the one that was clicked', async () => {
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.type(['h', 'i']);

    expect(it_.says(it_.top)).toBe('hi');
    // …AND ONLY THAT ONE. A field that took every character would pass every
    // test one field can be given and put a whole form into the last one
    // placed.
    expect(it_.says(it_.bottom)).toBe('');
  });

  it('hands the typing over when the other one is clicked', async () => {
    // The clear and the set, in one frame: `presses mouse button` reaches
    // every field wherever the pointer is, and `is clicked with` reaches the
    // one under it — announced afterwards (`rules/mouse`).
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.type(['a']);
    it_.clickAt(80, 200);
    it_.type(['b']);

    expect(it_.says(it_.top)).toBe('a');
    expect(it_.says(it_.bottom)).toBe('b');
  });

  it('lets go when the click lands on neither', async () => {
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.clickAt(300, 300);
    it_.type(['x']);

    expect(it_.says(it_.top)).toBe('');
  });

  it('backspaces, which is a key and not a character', async () => {
    // Backspace makes no character, so it never arrives as one: it is heard as
    // a KEY, which is the division that keeps either event from pretending
    // about the other.
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.type(['a', 'b', 'c']);
    it_.press('Backspace');

    expect(it_.says(it_.top)).toBe('ab');

    // …and an empty field backspaced is still an empty field.
    it_.press('Backspace');
    it_.press('Backspace');
    it_.press('Backspace');
    expect(it_.says(it_.top)).toBe('');
  });
});
