// The words on a block, in the reader's language.
//
// Two claims, and the second is the one that decides whether this can work at
// all: a translation may put a block's arguments in a different ORDER, and
// nothing about the block's identity may move when it does.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import {buildDomainPalette} from '../domainBlocks';
import {localizeBlocks, localizeText, localizeToolbox} from '../localizeBlocks';
import {parseRuleMeta} from '../ruleMeta';

import {isPseudo, pseudo, spanish, SPANISH_BAD} from './fixtures/locales';

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

  it('calls a live dropdown the way Blockly calls it', () => {
    // Blockly invokes an options generator as a METHOD of the field, and this
    // lab's generators read the field to know where they are: which enum a
    // choice belongs to, whose phases to offer, which rule to leave out of a
    // `use rule` list. The first version of this wrapper was an arrow function
    // calling `options()` — no `this`, no argument — so every one of them
    // answered as if it were nowhere. An empty list is a dropdown with no
    // text, which draws as a bare arrow with no block around it.
    const seen: unknown[] = [];
    function options(this: unknown, field?: unknown) {
      seen.push({field, self: this});
      return field ? [['from the field', 'v']] : [];
    }
    const [out] = localizeBlocks(
      [{type: 'x', message0: '%1', args0: [{name: 'D', options}]}],
      shout,
    ) as Definition[];

    const wrapped = out.args0?.[0]?.options as (
      this: unknown,
      field?: unknown,
    ) => Array<[string, string]>;
    const field = {id: 'the field'};

    expect(wrapped.call(field, field)).toEqual([['«from the field»', 'v']]);
    expect(seen).toEqual([{field, self: field}]);
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

describe('a translation Blockly would refuse', () => {
  // A LABEL AND ITS ARGUMENTS ARE ONE THING, and Blockly checks that when the
  // block is DEFINED: `Message index %3 out of range`, `Message index %1
  // duplicated`, `Message does not reference all 2 arg(s)`. A definition that
  // throws is not one bad block — it is the editor failing to load, in that
  // language and no other. So the English stands instead.
  const args = (n: number) =>
    Array.from({length: n}, (_, i) => ({name: `A${i}`}));

  it.each([
    ['drops an argument', 'set %1 to %2', 2],
    ['repeats an argument', 'give %1 to %2', 2],
    ['invents an argument', 'count %1', 1],
  ])('keeps the English when a translation %s', (_what, message0, count) => {
    const [out] = localizeBlocks(
      [{type: 'x', message0, args0: args(count)}],
      spanish,
    ) as Definition[];

    expect(SPANISH_BAD).toContain(message0);
    expect(out.message0).toBe(message0);
  });

  it('takes a translation that only moves the arguments', () => {
    // The refusal must not be so broad that it refuses the point. Spanish puts
    // the manner first here, and that is a translation, not a mistake.
    const [out] = localizeBlocks(
      [
        {
          type: 'world_do_SolidBodies_PushOutOfSidewaysAction',
          message0: 'push %1 out of %2 sideways',
          args0: [{name: 'BODY'}, {name: 'SOLID'}],
        },
      ],
      spanish,
    ) as Definition[];

    expect(out.message0).toBe('empujar lateralmente %2 fuera de %1');
  });

  it('counts an escaped per-cent as words, not as an argument', () => {
    // `%%` is how a label says `%`, and the digits after one are prose. Read
    // as `%` + `100` they are an argument index, and then a translation that
    // says a different NUMBER looks like a translation that moved an argument
    // — so it is refused, and a label mentioning a percentage silently never
    // translates in any language. No stock block says `%%` yet; the first one
    // that does would find this out quietly.
    const [out] = localizeBlocks(
      [
        {
          type: 'x',
          message0: 'slow %1 to %%100 of normal',
          args0: [{name: 'WHO'}],
        },
      ],
      text => text.replace('to %%100 of normal', 'al %%50 de lo normal'),
    ) as Definition[];

    expect(out.message0).toBe('slow %1 al %%50 de lo normal');
  });

  it('lets no translation reach Blockly with the wrong arguments', () => {
    // Over the REAL palette, under a translator that mangles every label the
    // three ways at once. Whatever comes out, each message references its own
    // arguments exactly once — which is the whole of what Blockly asks.
    const mangle = (text: string) => text.replace(/%(\d+)/, '%9 %9');
    const after = localizeBlocks(palette(), mangle) as Definition[];

    for (const block of after) {
      const message = block.message0;
      const count = block.args0?.length ?? 0;
      if (typeof message !== 'string') {
        continue;
      }
      const used = [...message.matchAll(/%(%|\d+)/g)]
        .map(([, digits]) => digits)
        .filter(digits => digits !== '%')
        .map(Number);
      expect(new Set(used).size).toBe(used.length);
      expect(used.length).toBe(count);
      expect(used.every(n => n >= 1 && n <= count)).toBe(true);
    }
  });
});

describe('what the seam reaches, over the whole palette', () => {
  // The pseudo-locale exists for this: every string it returns is marked, so
  // "was this translated?" becomes something a test can sweep for rather than
  // something a person has to notice missing.
  it('translates every message and every tooltip', () => {
    const after = localizeBlocks(palette(), pseudo) as Definition[];
    const missed = after.filter(
      block =>
        (typeof block.message0 === 'string' && !isPseudo(block.message0)) ||
        (typeof block.tooltip === 'string' && !isPseudo(block.tooltip)),
    );

    expect(missed.map(block => block.type)).toEqual([]);
  });

  it('translates every dropdown label a block is defined with', () => {
    const after = localizeBlocks(palette(), pseudo) as Definition[];
    const labels = after.flatMap(block =>
      (block.args0 ?? []).flatMap(arg =>
        Array.isArray(arg.options)
          ? (arg.options as Array<[unknown, string]>).map(option => option[0])
          : [],
      ),
    );

    expect(labels.length).toBeGreaterThan(0);
    expect(
      labels.filter(label => typeof label === 'string' && !isPseudo(label)),
    ).toEqual([]);
  });

  it('leaves the interpolations alone while it marks the words', () => {
    // The pseudo-locale has to be a translation the lab could actually draw,
    // or a sweep run under it proves nothing about the real one.
    expect(pseudo('push %1 out of %2 sideways')).toBe(
      '«púšh %1 óút óf %2 šídéwáýš»',
    );
  });
});

describe('the drawers, which nothing else would translate', () => {
  // The toolbox is inside the `notranslate` container with the workspace, so
  // if this seam does not take it, "Actor" and "Drawing" and "Rule" stay
  // English in every language.
  const toolbox = () => {
    const metas = STOCK_RULES.map(rule =>
      parseRuleMeta(`rules/${rule.id}`, rule.contents),
    ).filter(Boolean);
    return buildDomainPalette(metas as never, {fileKind: 'rule'} as never)
      .toolbox;
  };

  it('translates every drawer name', () => {
    const after = localizeToolbox(toolbox(), pseudo) as Array<{name?: string}>;

    expect(after.length).toBeGreaterThan(10);
    expect(
      after.filter(cat => typeof cat.name === 'string' && !isPseudo(cat.name)),
    ).toEqual([]);
  });

  it('leaves the block types in a drawer alone', () => {
    // `blocks` holds identifiers. Translating one would offer a block that
    // does not exist, and the drawer would come up empty.
    const before = toolbox() as Array<{blocks?: unknown[]}>;
    const after = localizeToolbox(before, pseudo) as Array<{
      blocks?: unknown[];
    }>;

    const types = (cats: Array<{blocks?: unknown[]}>) =>
      cats.flatMap(cat =>
        (cat.blocks ?? []).filter(entry => typeof entry === 'string'),
      );

    expect(types(after)).toEqual(types(before));
    expect(types(before).length).toBeGreaterThan(50);
  });

  it('translates a button’s words and keeps what it calls', () => {
    // The "How this works" link at the top of a rule's drawer is a flyout
    // button — `{kind, text, callbackkey}` — and only the `text` is words.
    const [out] = localizeToolbox(
      [
        {
          name: 'Gravity',
          blocks: [
            {
              kind: 'button',
              text: 'How this works: Falling',
              callbackkey: 'world_lesson_fall',
            },
            'world_do_Gravity_FallAction',
          ],
        },
      ],
      pseudo,
    ) as Array<{name: string; blocks: Array<Record<string, string>>}>;

    expect(out.name).toBe('«Grávítý»');
    expect(out.blocks[0].text).toBe('«Hów thíš wórkš: Fállíñg»');
    expect(out.blocks[0].callbackkey).toBe('world_lesson_fall');
    expect(out.blocks[1]).toBe('world_do_Gravity_FallAction');
  });

  it('does not touch the toolbox it was given', () => {
    const original = [{name: 'Actor', blocks: ['world_actor']}];

    localizeToolbox(original, pseudo);

    expect(original[0].name).toBe('Actor');
  });
});

describe('the words the editor composes itself', () => {
  it('puts the name where the translation wants it', () => {
    // `translate` takes a string and gives a string, so a warning with a
    // member's name in it is interpolated here — with Blockly's own `%n`, so
    // that a language may put the name somewhere English does not.
    const german = (text: string) =>
      text === 'Two of this rule’s members are both called “%1”.'
        ? '“%1” heißen zwei Mitglieder dieser Regel.'
        : text;

    expect(
      localizeText(
        'Two of this rule’s members are both called “%1”.',
        ['slowed by'],
        german,
      ),
    ).toBe('“slowed by” heißen zwei Mitglieder dieser Regel.');
  });

  it('keeps the English when a translation loses the name', () => {
    // Otherwise the warning names nothing, which is worse than English.
    const lossy = () => 'Zwei Mitglieder heißen gleich.';

    expect(
      localizeText('Two members are called “%1”.', ['slowed by'], lossy),
    ).toBe('Two members are called “slowed by”.');
  });
});
