// `width of ⟨text⟩ at size ⟨n⟩`, compiled and run.
//
// The one question about a picture that is not arithmetic on numbers the
// project stated. How wide a letter is is a fact about a FONT, and the engine
// has neither font nor canvas on purpose (specs/DRAWING.md) — `draw paragraph`
// hands its column down and lets the painter break the lines precisely so this
// never had to be asked.
//
// A caret is what forced it, and a caret cannot wait a frame: placing one by
// clicking into a word is a mouse handler's question, asked in the frame it is
// asked in. So the World is lent a measuring tape by whatever drives it
// (`World.useTextMetrics`) and this block borrows it.
//
// TWO PLACES IT HAS TO WORK, and they bind `world` differently. A drawing's
// BODY always had one — that is what makes a health bar a picture that asks.
// A drawing's SIZE sockets did not: they compiled to `actor => …`, so a box
// asked to fit its own words was a ReferenceError rather than a box.

import {describe, expect, it} from 'vitest';

import {compileProject} from './support/compileProject';

/** Six pixels a character at twelve, which is a font nobody has. */
const sixPerCharacter = (words: string, size: number) =>
  words.length * (size / 2);

/** `width of ⟨"hello"⟩ at size ⟨12⟩`. */
const measured = (text: string) => ({
  block: {
    type: 'world_text_width',
    inputs: {
      TEXT: {block: {type: 'text', fields: {TEXT: text}}},
      SIZE: {block: {type: 'math_number', fields: {NUM: 12}}},
    },
  },
});

/** A Sign as wide as the word it draws, plus a margin either side. */
const SIGN = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Sign'},
        next: {
          block: {
            type: 'world_define_drawing',
            inputs: {
              WIDTH: {
                block: {
                  type: 'math_arithmetic',
                  fields: {OP: 'ADD'},
                  inputs: {
                    A: measured('hello'),
                    B: {shadow: {type: 'math_number', fields: {NUM: 8}}},
                  },
                },
              },
              HEIGHT: {block: {type: 'math_number', fields: {NUM: 16}}},
              DO: {
                block: {
                  type: 'world_draw_rectangle',
                  inputs: {
                    X: measured('hello'),
                    Y: {block: {type: 'math_number', fields: {NUM: 0}}},
                    WIDTH: {block: {type: 'math_number', fields: {NUM: 2}}},
                    HEIGHT: {block: {type: 'math_number', fields: {NUM: 16}}},
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/sign'}},
        },
      },
    ],
  },
});

const play = async (measure?: (words: string, size: number) => number) => {
  const {world} = await compileProject({
    'actors/sign.actor': SIGN,
    'worlds/main.world': WORLD,
  });
  if (measure) {
    world.useTextMetrics(measure);
  }
  const [state] = [...world.renderSnapshot()];
  return state;
};

describe('measuring text from blocks', () => {
  it('sizes a drawing from what it says', async () => {
    // `hello` is five characters at twelve, so thirty, plus the eight of
    // margin. Before the size closures were handed a world this was a throw.
    const state = await play(sixPerCharacter);

    expect(state.drawing?.width).toBe(38);
    expect(state.drawing?.height).toBe(16);
  });

  it('answers inside the drawing’s body too', async () => {
    const state = await play(sixPerCharacter);
    const bar = state.drawing?.commands.find(
      command => command.op === 'rectangle',
    );

    expect(bar?.op === 'rectangle' && bar.x).toBe(30);
  });

  it('measures nothing when the world was lent no tape', async () => {
    // The headless case — `runtime/playCheck` runs one — and the answer is
    // zero rather than an estimate from a character count, which would be off
    // by a little at one text size and by a word at another.
    const state = await play();

    expect(state.drawing?.width).toBe(8);
    const bar = state.drawing?.commands.find(
      command => command.op === 'rectangle',
    );
    expect(bar?.op === 'rectangle' && bar.x).toBe(0);
  });
});
