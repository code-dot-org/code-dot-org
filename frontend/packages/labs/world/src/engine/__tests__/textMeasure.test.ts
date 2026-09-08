// The measuring tape the World is lent, and what it answers without one.
//
// This is the one fact about a picture the engine cannot work out for itself.
// Everything else is arithmetic on numbers the project stated; how wide a
// letter is is a fact about a FONT, and this half has neither font nor canvas
// on purpose (specs/DRAWING.md). `draw paragraph` sidesteps the question by
// handing its column down and letting the painter break the lines.
//
// A CARET IS WHAT COULD NOT BE SIDESTEPPED. It belongs after the last letter,
// and it moves on a click — which is a handler, not a paint, so a measurement
// published by the last frame's drawing arrives too late to place it. So the
// tape is lent the other way: a driver that has a canvas hands one over, and
// the blocks borrow it through here.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../index';

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

/** Six pixels a character, which is a font nobody has but everybody can read. */
const sixPerCharacter = (words: string, size: number) =>
  words.length * (size / 2);

describe('measuring text', () => {
  it('answers zero when nobody has lent a tape', () => {
    // THE HONEST ANSWER, not a failure. A world with no canvas behind it — the
    // headless check runner is one — puts a caret at the left margin, which is
    // visibly nothing. Guessing from a character count would be off by a
    // little at one text size and by a word at another, and would be wrong in
    // the one place nobody looks.
    expect(makeWorld().textWidth('hello', 12)).toBe(0);
  });

  it('asks whatever it was lent, at the size it was asked about', () => {
    const world = makeWorld();
    world.useTextMetrics(sixPerCharacter);

    expect(world.textWidth('hello', 12)).toBe(30);
    // The size is not a scale factor applied afterwards: it goes to the
    // measurer, because a font's letters are not all the same shape at every
    // size and only the thing holding the font knows that.
    expect(world.textWidth('hello', 24)).toBe(60);
  });

  it('says a list as the sentence it would be drawn as', () => {
    // `the words in ⟨…⟩` hands back a list, and a Label draws one as a
    // sentence joined by spaces (`core/textValue`). Measuring `String(list)`
    // would measure the commas, which are not drawn.
    //
    // Asserted on what the MEASURER was handed rather than on the number that
    // came back: a comma and a space are the same one character wide to any
    // toy measurer, so a width comparison would pass whichever of the two the
    // world sent.
    const asked: string[] = [];
    const world = makeWorld();
    world.useTextMetrics(sentence => {
      asked.push(sentence);
      return 0;
    });
    world.textWidth(['red', 'blue'], 12);
    world.textWidth(7, 12);

    expect(asked).toEqual(['red blue', '7']);
  });

  it('measures nothing at a size that is not a size', () => {
    // A socket left empty reads as zero and a typo reads as a negative. There
    // is no text at zero pixels, so neither is worth handing to a canvas.
    const world = makeWorld();
    world.useTextMetrics(sixPerCharacter);

    expect(world.textWidth('hello', 0)).toBe(0);
    expect(world.textWidth('hello', -12)).toBe(0);
    expect(world.textWidth('hello', Number.NaN)).toBe(0);
    expect(world.textWidth('', 12)).toBe(0);
  });
});

describe('a drawing’s size', () => {
  it('is handed the world, so a box can fit its own words', () => {
    // The size closures used to take the actor alone, which made
    // `⟨width of ⟨what it says⟩ at size ⟨12⟩⟩` in a size socket a
    // ReferenceError at runtime rather than a box that fits.
    const world = makeWorld();
    world.useTextMetrics(sixPerCharacter);
    const kind = new ActorBuilder({id: 'sign', name: 'Sign'}).defineDrawing(
      (_actor, itsWorld) => itsWorld.textWidth('hello', 12) + 8,
      16,
      () => {},
    );

    expect(kind.ownDrawing!.size({}, world)).toEqual({width: 38, height: 16});
  });
});
