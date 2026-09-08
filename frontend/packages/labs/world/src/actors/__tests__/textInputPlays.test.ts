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
import type {Actor} from '../../engine';
import {keyName} from '../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {importStockRule} from '../../rules/importStockRule';
import {TAB_NAVIGATION} from '../../rules/stock';
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

/**
 * Six pixels a character at twelve, which is a font nobody has.
 *
 * A driver lends the World a real one built from the painter's own font
 * (`runtime/driver/textMetrics`); a test lends it arithmetic, so what the
 * caret does can be asserted exactly without a canvas anywhere.
 */
const sixPerCharacter = (words: string, size: number) =>
  words.length * (size / 2);

const play = async (measure?: (words: string, size: number) => number) => {
  // The rule the field elects a trait from, imported by hand: it is not on the
  // shelf, so naming it in `requires` would resolve to nothing and the field
  // would compile perfectly and hear no keyboard (`fixtures/interfaceKit`).
  const source = importStockActor(
    importStockRule(WORLD_SCENARIOS.empty.source, TAB_NAVIGATION).source,
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
  // Lent BEFORE anything is drawn, as a driver lends it at set-up. Without
  // one the world measures zero and the caret sits at the left margin, which
  // is the headless case and is asserted below too.
  if (measure) {
    world.useTextMetrics(measure);
  }
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
     * The player tabs onto the game, which is not a Tab press.
     *
     * The Tab that carried them here was pressed while the page still had the
     * keyboard, so the driver reports the arrival itself and the rule brings
     * the focus to the first control (`World.gainedKeyboard`).
     */
    arrive: () => {
      world.gainedKeyboard();
      world.tick(1 / 60);
    },
    /** Let `seconds` pass at sixty frames to the second. */
    wait: (seconds: number) => {
      for (let frame = 0; frame < Math.round(seconds * 60); frame += 1) {
        world.tick(1 / 60);
      }
    },
    /**
     * Where one field's caret is, or nothing when it is not drawn.
     *
     * The bar is the only two-pixel-wide rectangle in the picture — the panel
     * is the width of the whole actor — so it is found by that rather than by
     * counting commands, which would break the day a field grows a decoration.
     */
    caretOf: (one: Actor) => {
      const state = [...world.renderSnapshot()].find(
        entry => entry.actor === one,
      );
      const bar = state?.drawing?.commands.find(
        command => command.op === 'rectangle' && command.width === 2,
      );
      return bar?.op === 'rectangle' ? bar.x : undefined;
    },
    /** Where the words start, which slides left to keep the caret in view. */
    wordsOf: (one: Actor) => {
      const state = [...world.renderSnapshot()].find(
        entry => entry.actor === one,
      );
      const line = state?.drawing?.commands.find(
        command => command.op === 'text',
      );
      return line?.op === 'text' ? line.x : undefined;
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

  it('keeps the typing when the click lands on neither', async () => {
    // IT USED TO LET GO, and it deliberately does not now. Clicking the
    // background blurred because the field heard every press and cleared
    // itself; the focus is the rule's now, and one block moves it. Escape is
    // the release, everywhere — it is what hands Tab back to the page as well
    // (`rules/tabNavigation`, specs/UI_ACTORS.md).
    //
    // A field that also blurred on any press would raise a loss and a gain
    // every time the FOCUSED field was clicked, which is the churn the rule's
    // idempotence guard exists to prevent.
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.clickAt(300, 300);
    it_.type(['x']);

    expect(it_.says(it_.top)).toBe('x');
  });

  it('lets go on Escape, which is the one way out', async () => {
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.type(['a']);

    it_.press('Escape');
    it_.type(['b']);

    expect(it_.says(it_.top)).toBe('a');
  });

  it('is reachable by the keyboard alone', async () => {
    // THE WHOLE POINT OF THE MIGRATION. A field nobody can click is a field a
    // keyboard user cannot fill in, and no arrangement of mouse handlers was
    // ever going to fix that — tabbing between two fields is not a thing
    // either field can work out.
    const it_ = await play();

    it_.arrive();
    it_.type(['h', 'i']);
    expect(it_.says(it_.top)).toBe('hi');

    it_.press('Tab');
    it_.type(['t', 'w', 'o']);
    expect(it_.says(it_.bottom)).toBe('two');
    // …and the first one kept what was put in it.
    expect(it_.says(it_.top)).toBe('hi');
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

describe('its caret', () => {
  // WHY THERE CAN BE ONE AT ALL. A caret belongs after the last letter, and
  // where that is is a fact about the font — which the engine deliberately has
  // none of (specs/DRAWING.md). The World is lent a measuring tape by whatever
  // is driving it (`World.useTextMetrics`), and `width of ⟨text⟩ at size ⟨n⟩`
  // is what borrows it. These play the field with a toy tape so the pixels can
  // be asserted rather than eyeballed.

  it('is drawn only in the field that is being typed at', async () => {
    const it_ = await play(sixPerCharacter);
    it_.clickAt(80, 60);

    expect(it_.caretOf(it_.top)).toBeDefined();
    // The other field is not merely unfocused, it has no bar at all: two
    // carets on a screen is two fields claiming the keyboard.
    expect(it_.caretOf(it_.bottom)).toBeUndefined();
  });

  it('stands after the last letter, measured rather than guessed', async () => {
    const it_ = await play(sixPerCharacter);
    it_.clickAt(80, 60);
    it_.type(['h', 'i']);

    // Eight pixels of inset, then two letters at six: the arithmetic is the
    // measurer's, which is the point. A caret placed by character COUNT would
    // agree with this test and disagree with every real font.
    expect(it_.caretOf(it_.top)).toBe(8 + 12);

    it_.type(['!']);
    expect(it_.caretOf(it_.top)).toBe(8 + 18);
  });

  it('sits at the margin when nothing can measure', async () => {
    // The headless case, and it is a real one: `runtime/playCheck` runs a
    // world with no canvas anywhere. Zero is visibly nothing rather than
    // invisibly wrong, which is what a guess from a character count would be.
    const it_ = await play();
    it_.clickAt(80, 60);
    it_.type(['h', 'i']);

    expect(it_.caretOf(it_.top)).toBe(8);
  });

  it('blinks, on the world’s clock', async () => {
    const it_ = await play(sixPerCharacter);
    it_.clickAt(80, 60);

    // A caret that does not blink reads as a picture of a caret. Half of every
    // second, off the world's own time — so every field on a screen blinks
    // together rather than from its own timer.
    expect(it_.caretOf(it_.top)).toBeDefined();
    it_.wait(0.5);
    expect(it_.caretOf(it_.top)).toBeUndefined();
    it_.wait(0.5);
    expect(it_.caretOf(it_.top)).toBeDefined();
  });

  it('slides the words so the caret stays in the box', async () => {
    // A field is 96 wide with 8 of inset either side, so 80 pixels of room.
    // Twenty characters at six is 120, which is 40 too many.
    const it_ = await play(sixPerCharacter);
    it_.clickAt(80, 60);
    it_.type('abcdefghijklmnopqrst'.split(''));
    // One more frame, because the slide is worked out by a step and the
    // picture is drawn from what the step left.
    it_.wait(1 / 60);

    expect(it_.wordsOf(it_.top)).toBe(8 - 40);
    // …and the caret lands on the right-hand inset, which is what "in the box"
    // means: 8 − 40 + 120.
    expect(it_.caretOf(it_.top)).toBe(96 - 8);
  });

  it('does not slide while what is typed still fits', async () => {
    const it_ = await play(sixPerCharacter);
    it_.clickAt(80, 60);
    it_.type(['h', 'i']);
    it_.wait(1 / 60);

    expect(it_.wordsOf(it_.top)).toBe(8);
  });
});
