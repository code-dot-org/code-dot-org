// The words on a block, in the reader's language.
//
// Two claims, and the second is the one that decides whether this can work at
// all: a translation may put a block's arguments in a different ORDER, and
// nothing about the block's identity may move when it does.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import {buildDomainPalette} from '../domainBlocks';
import {localizeBlocks} from '../localizeBlocks';
import {parseRuleMeta} from '../ruleMeta';

/** A stand-in translator: every string comes back marked and reversed in order. */
const shout = (text: string): string => `«${text}»`;

/** The real palette, which is what this has to survive. */
const palette = () => {
  const metas = STOCK_RULES.map(rule =>
    parseRuleMeta(`rules/${rule.id}`, rule.contents),
  ).filter(Boolean);
  return buildDomainPalette(metas as never, {fileKind: 'rule'} as never).blocks;
};

interface Definition {
  type?: string;
  message0?: string;
  args0?: Array<{name?: string; options?: unknown}>;
  tooltip?: string;
}

describe('what a translation may change', () => {
  it('translates the words a learner reads', () => {
    const [out] = localizeBlocks(
      [{type: 'x', message0: 'push %1 out of %2', tooltip: 'Pushes it.'}],
      shout,
    ) as Definition[];

    expect(out.message0).toBe('«push %1 out of %2»');
    expect(out.tooltip).toBe('«Pushes it.»');
  });

  it('lets a translation reorder the arguments', () => {
    // THE CLAIM THE WHOLE THING RESTS ON. Blockly binds `%n` to `args0[n - 1]`
    // wherever it appears, so a language that puts the object before the verb
    // is a different `message0` and the same block — same inputs, same names,
    // same sockets. Nothing here has to understand grammar.
    const german = (text: string) =>
      text === 'push %1 out of %2 sideways'
        ? '%2 seitlich aus %1 herausdrücken'
        : text;

    const [out] = localizeBlocks(
      [
        {
          type: 'world_do_SolidBodies_PushOutOfSidewaysAction',
          message0: 'push %1 out of %2 sideways',
          args0: [{name: 'BODY'}, {name: 'SOLID'}],
        },
      ],
      german,
    ) as Definition[];

    expect(out.message0).toBe('%2 seitlich aus %1 herausdrücken');
    // The arguments did not move: `%2` still means `args0[1]`, which is still
    // the solid, under the same name the generator reads it by.
    expect(out.args0?.map(arg => arg.name)).toEqual(['BODY', 'SOLID']);
  });

  it('reads a dropdown’s labels and keeps what it stores', () => {
    // An option is `[what is read, what is stored]`. Translating the second
    // would write another language into the saved file.
    const [out] = localizeBlocks(
      [
        {
          type: 'x',
          message0: '%1',
          args0: [
            {
              name: 'PHASE',
              options: [
                ['before everything', 'sense'],
                ['after everything', 'settle'],
              ],
            },
          ],
        },
      ],
      shout,
    ) as Definition[];

    expect(out.args0?.[0]?.options).toEqual([
      ['«before everything»', 'sense'],
      ['«after everything»', 'settle'],
    ]);
  });

  it('reads the alt of a picture and leaves the picture', () => {
    // An actor's dropdown DRAWS the actor: the label is `{src, width, height,
    // alt}` and the only words in it are the `alt`. The first draft handed the
    // whole object to `translate`, which walks an object it does not know
    // field by field — `width: 24` came back `{}`, Blockly refused the option,
    // and the editor came up as "an error occurred while loading the lab".
    const [out] = localizeBlocks(
      [
        {
          type: 'x',
          message0: '%1',
          args0: [
            {
              name: 'ACTOR',
              options: [
                [
                  {src: '/p.png', width: 24, height: 24, alt: 'player'},
                  'actors/player',
                ],
              ],
            },
          ],
        },
      ],
      shout,
    ) as Definition[];

    expect((out.args0?.[0]?.options as unknown[][])[0][0]).toEqual({
      src: '/p.png',
      width: 24,
      height: 24,
      alt: '«player»',
    });
  });

  it('translates a live dropdown when it is opened, not before', () => {
    // A live dropdown lists things that may not exist yet at definition time —
    // an enum written a minute ago — so the options are a function, and the
    // translation has to happen inside it.
    let asked = 0;
    const options = () => {
      asked += 1;
      return [['a key', 'Engine#Key']] as Array<[string, string]>;
    };
    const [out] = localizeBlocks(
      [{type: 'x', message0: '%1', args0: [{name: 'ENUM', options}]}],
      shout,
    ) as Definition[];

    expect(asked).toBe(0);
    const live = out.args0?.[0]?.options as () => Array<[string, string]>;
    expect(live()).toEqual([['«a key»', 'Engine#Key']]);
    expect(asked).toBe(1);
  });
});

describe('what a translation must never change', () => {
  it('leaves every block type exactly as it was', () => {
    // A type is identity: it is what a saved file holds and what one rule
    // calls another rule's block by. If these moved, translating the lab would
    // stop every project in it from loading.
    const before = palette() as Definition[];
    const after = localizeBlocks(before, shout) as Definition[];

    expect(after.map(block => block.type)).toEqual(
      before.map(block => block.type),
    );
  });

  it('leaves every argument name exactly as it was', () => {
    // The generator finds a value by its input's name.
    const before = palette() as Definition[];
    const after = localizeBlocks(before, shout) as Definition[];

    const names = (blocks: Definition[]) =>
      blocks.flatMap(block => (block.args0 ?? []).map(arg => arg.name));

    expect(names(after)).toEqual(names(before));
  });

  it('does not touch the definitions it was given', () => {
    // They are registered by identity, so a mutated one is a definition
    // already in use, changed underneath Blockly.
    const original = {type: 'x', message0: 'hello %1', tooltip: 'Hi.'};

    localizeBlocks([original], shout);

    expect(original.message0).toBe('hello %1');
    expect(original.tooltip).toBe('Hi.');
  });

  it('is identity when nothing is translating', () => {
    // Which is every host that has not loaded LocalizeJS, and every test.
    const before = palette() as Definition[];
    const after = localizeBlocks(before, text => text) as Definition[];

    expect(after.map(b => b.message0)).toEqual(before.map(b => b.message0));
  });
});
