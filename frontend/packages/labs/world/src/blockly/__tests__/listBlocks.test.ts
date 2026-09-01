// The blocks that make a list usable (specs/LISTS.md).
//
// Step one gave the language somewhere to keep two numbers; these are what put
// one in. Three of them are Blockly's own, reworded rather than rebuilt — the
// literal for its mutator, the count for being one word — and the rest are this
// lab's, in the voice the actor lists already speak.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS, DOMAIN_TOOLBOX} from '../domainBlocks';

/** A block definition by type. */
const blockOf = (type: string) => {
  const found = DOMAIN_BLOCKS.find(block => block.type === type);
  if (!found) {
    throw new Error(`no domain block '${type}'`);
  }
  return found as {
    type: string;
    message0: string;
    args0?: Array<{type: string; name: string; check?: string}>;
    output?: string;
    generator: {
      javascript: (block: unknown, generator: unknown, env: unknown) => unknown;
    };
  };
};

/** Generate a block's code with stand-ins for its fields and sockets. */
const codeOf = (
  type: string,
  fields: Record<string, string>,
  values: Record<string, string>,
  body = '',
) =>
  blockOf(type).generator.javascript(
    {
      getFieldValue: (name: string) => fields[name] ?? '',
    } as never,
    {
      getVariableName: (id: string) => id,
      valueToCode: (_block: unknown, name: string) => values[name] ?? '',
      statementToCode: () => body,
    } as never,
    {} as never,
  );

describe('adding to a list', () => {
  it('assigns rather than pushes, so an unset variable becomes a list', () => {
    // `scores.push(5)` throws on a variable that has never been set, which is
    // the state every variable starts in; the helper answers with a list of one
    // and the assignment keeps it.
    expect(codeOf('world_list_add', {LIST: 'scores'}, {ITEM: '5'})).toBe(
      'scores = WorldLab.addTo(scores, 5);\n',
    );
  });

  it('takes anything, because what a list holds is the list’s business', () => {
    const item = blockOf('world_list_add').args0?.find(
      argument => argument.name === 'ITEM',
    );

    expect(item?.type).toBe('input_value');
    expect(item?.check).toBeUndefined();
  });
});

describe('emptying a list', () => {
  it('is a new list rather than a length of zero', () => {
    // `scores.length = 0` would empty the list every OTHER variable naming it
    // is holding, which is a surprise `add` deliberately does have and this
    // does not need.
    expect(codeOf('world_list_empty', {LIST: 'scores'}, {})).toBe(
      'scores = [];\n',
    );
  });
});

describe('asking what a list holds', () => {
  it('compares by value, which `includes` does not for places', () => {
    const [code] = codeOf(
      'world_list_has',
      {},
      {
        LIST: 'places',
        ITEM: 'here',
      },
    ) as [string, number];

    expect(code).toBe('WorldLab.listHas(places, here)');
  });

  it('reads as a question', () => {
    expect(blockOf('world_list_has').output).toBe('Boolean');
    expect(blockOf('world_list_has').message0).toBe('%1 has %2');
  });
});

describe('walking a list', () => {
  it('is one block per kind of thing, beside the one that walks actors', () => {
    // Three rather than one with a dropdown: what a dropdown would choose is
    // the TYPE of the variable it binds, and a variable's type is fixed once it
    // is made.
    for (const kind of ['number', 'word', 'place']) {
      expect(blockOf(`world_for_each_${kind}`).message0).toBe(
        `for each ${kind} %1 in %2`,
      );
    }
  });

  it('walks nothing when the list is not one', () => {
    expect(
      codeOf(
        'world_for_each_number',
        {VAR: 'score'},
        {LIST: 'scores'},
        '  say(score);\n',
      ),
    ).toBe('for (const score of WorldLab.items(scores)) {\n  say(score);\n}\n');
  });
});

describe('the Lists drawer', () => {
  const lists = (
    DOMAIN_TOOLBOX as Array<{name: string; blocks: unknown[]}>
  ).find(category => category.name === 'Lists')?.blocks;

  it('opens with the literal, seeded with three sockets', () => {
    // Blockly's own, kept for its mutator and reworded to "make a list of"
    // (`colorMessages`). Three, as its stock toolbox seeds it: a list of one is
    // rarely what anybody means.
    expect(lists?.[0]).toEqual({
      kind: 'block',
      type: 'lists_create_with',
      extraState: {itemCount: 3},
    });
  });

  it('offers the six ways to use one, and the variable to keep it in', () => {
    expect(lists?.slice(1)).toEqual([
      'lists_create_empty',
      'world_list_add',
      'world_list_empty',
      'lists_length',
      'world_list_has',
      'world_for_each_number',
      'world_for_each_word',
      'world_for_each_place',
      'variables_get_List',
      'variables_set_List',
    ]);
  });
});
