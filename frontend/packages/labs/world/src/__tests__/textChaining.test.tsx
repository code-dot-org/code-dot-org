// Words joined by chaining them, and a line break that chains too.
//
// Concatenation was `text_join`: a mutator, a bubble to open and two sockets
// to count, and a block whose shape is edited rather than read. A `text` block
// with somewhere for the next thing to go says the same thing in the order it
// is read, and `new line` is that same block with a break in it — which is
// what lets a Label hold a paragraph a learner actually wrote
// (specs/UI_ACTORS.md).
//
// COMPILED AND RUN, because what is being checked is the STRING that comes
// out. A chain that generated `"a" + 1 + 2` rather than stringifying each link
// reads correctly in the file and says "a12" for one arrangement and "a3" for
// another, which is the bug this shape exists to make impossible.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});

/** `⟨words⟩` with `next` chained into its trailing socket. */
const text = (words: string, add?: object) => ({
  block: {
    type: 'text',
    fields: {TEXT: words},
    ...(add ? {inputs: {ADD: add}} : {}),
  },
});

/** `new line`, with whatever follows it. */
const newLine = (add?: object) => ({
  block: {
    type: 'world_new_line',
    ...(add ? {inputs: {ADD: add}} : {}),
  },
});

/** `“ ⟨value⟩ ”` — a value said as words, with whatever follows it. */
const asText = (value: object, add?: object) => ({
  block: {
    type: 'world_as_text',
    inputs: {VALUE: value, ...(add ? {ADD: add} : {})},
  },
});

const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

const worldSaying = (value: object) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/label'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_Writing_TextProperty',
                    inputs: {ACTOR: me(), VALUE: value},
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

/** The stock Label, placed and told to say `value`. */
const said = async (value: object) => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('label')!,
  ).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const {world, modules} = await compileProject(
    projectFiles({
      ...source,
      files: {
        ...source.files,
        [main.id]: {...main, contents: worldSaying(value)},
      },
    }),
  );
  return [...world.actors][0].get(
    modules['rules/writing'].TextProperty as never,
  ) as unknown as string;
};

describe('chaining text', () => {
  it('says one block on its own, exactly as it always did', async () => {
    // The socket is empty on every string shadow in the lab, so this is the
    // case that must not have changed at all.
    expect(await said(text('Hello'))).toBe('Hello');
  });

  it('says what is chained onto it, in reading order', async () => {
    expect(await said(text('Score: ', text('over ', text('9000'))))).toBe(
      'Score: over 9000',
    );
  });

  it('takes a value through `as text`, and says it as words', async () => {
    // The door into a chain for everything that is not already words. It is a
    // BLOCK rather than a socket that takes anything, because `"n = " + 1 + 2`
    // is "n = 12" and `1 + 2 + " left"` is "3 left" — the same three links,
    // joined in the order they are read, meaning two different things.
    expect(await said(text('n = ', asText(number(1))))).toBe('n = 1');
    // TWO NUMBERS IN A ROW is the case that says the stringifying is real. A
    // link that handed its value on bare would generate `1 + 2` here, which is
    // arithmetic — the chain would say "3" where it reads "1" then "2". Every
    // other arrangement has a string somewhere in it and hides the difference.
    expect(await said(asText(number(1), asText(number(2))))).toBe('12');
  });

  it('breaks a line, and goes on chaining after it', async () => {
    // Which is the whole of what a paragraph needs: `draw paragraph` splits on
    // this, so a Label given it draws two lines.
    expect(await said(text('Press', newLine(text('SPACE'))))).toBe(
      'Press\nSPACE',
    );
    expect(await said(newLine())).toBe('\n');
  });
});
