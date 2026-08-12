// The enum model (specs/ENUMS.md step 1).
//
// An enum is an authoring construct: a named set of string choices, which the
// edit surface turns into a dropdown and generated code never mentions. These
// pin down what a reference to one means and how a parameter carries it.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';
import {
  allEnums,
  BUTTON_ENUM,
  duplicateEnumNames,
  enumByRef,
  enumOptions,
  enumParamType,
  enumRef,
  enumRefOfParamType,
  KEY_ENUM,
  registerProjectEnums,
  type EnumMeta,
} from '../enums';
import {refreshProjectDropdowns} from '../projectDropdowns';
import {parseRuleMeta} from '../ruleMeta';

const GUSTS: EnumMeta = {
  owner: 'Wind',
  name: 'Gusts',
  options: [
    ['breeze', 'breeze'],
    ['gale', 'gale'],
  ],
};

describe('enum references', () => {
  afterEach(() => registerProjectEnums([]));

  it('names an enum by its owner and name', () => {
    // The same shape a member reference has, and for the same reason: a rule
    // can be renamed or moved and what a block stored still resolves.
    expect(enumRef(KEY_ENUM)).toBe('Engine#Key');
    expect(enumByRef('Engine#Key')).toBe(KEY_ENUM);
  });

  it('resolves a project enum once the project declares it', () => {
    expect(enumByRef('Wind#Gusts')).toBeUndefined();

    registerProjectEnums([GUSTS]);

    expect(enumByRef('Wind#Gusts')).toBe(GUSTS);
    expect(allEnums()).toEqual([KEY_ENUM, BUTTON_ENUM, GUSTS]);
  });

  it('gives an unknown reference no options rather than throwing', () => {
    // A block may name an enum from a rule the learner is halfway through
    // writing; a half-written project still has to render.
    expect(enumOptions('Wind#Gusts')).toEqual([]);
  });
});

describe('the Key enum', () => {
  it('offers the names the engine itself compares', () => {
    // Not the DOM's names: the driver translates those away at the door
    // (`engine/core/keys`), so a key IS `space`, and the JavaScript a learner
    // reads says so. Only the letters have a label of their own, showing `A`
    // for the key whose name is `a`, because keys fold case.
    expect(enumOptions('Engine#Key')).toContainEqual(['space', 'space']);
    expect(enumOptions('Engine#Key')).toContainEqual(['up arrow', 'up arrow']);
    expect(enumOptions('Engine#Key')).toContainEqual(['A', 'a']);
  });
});

describe('enums as parameter types', () => {
  it('round-trips through a parameter type', () => {
    const type = enumParamType('Engine#Key');

    expect(enumRefOfParamType(type)).toBe('Engine#Key');
  });

  it('leaves a plain type alone', () => {
    // Everything that reads a parameter type keeps working: a `vector` is a
    // vector, and only the `enum:` prefix means otherwise.
    expect(enumRefOfParamType('vector')).toBeUndefined();
    expect(enumRefOfParamType('string')).toBeUndefined();
  });
});

describe('`define choices` in a `.rule`', () => {
  afterEach(() => registerProjectEnums([]));

  /** The options, as the stack of blocks that chains below the root. */
  const optionChain = (options: string[]) =>
    options.reduceRight<object | undefined>(
      (next, word) => ({
        type: 'world_rule_enum_option',
        fields: {NAME: word},
        ...(next ? {next: {block: next}} : {}),
      }),
      undefined,
    );

  /** A `.rule` declaring one set of choices. */
  const ruleWithChoices = (name: string, options: string[]) =>
    parseRuleMeta(
      'rules/wind',
      JSON.stringify({
        blocks: {
          blocks: [
            {type: 'world_rule', fields: {NAME: 'Wind', ABILITY: 'Has Wind'}},
            {
              type: 'world_rule_enum',
              fields: {NAME: name},
              ...(options.length > 0
                ? {next: {block: optionChain(options)}}
                : {}),
            },
          ],
        },
      }),
    )!;

  it('reads the choices off the blocks below it', () => {
    const meta = ruleWithChoices('Gusts', ['breeze', 'gale']);

    // The word IS the value: what a learner reads and what the block emits are
    // one string, so there is no table to keep in step.
    expect(meta.enums).toEqual([
      {
        owner: 'Wind',
        name: 'Gusts',
        options: [
          ['breeze', 'breeze'],
          ['gale', 'gale'],
        ],
      },
    ]);
  });

  it('drops a repeated word rather than offering it twice', () => {
    const meta = ruleWithChoices('Gusts', ['gale', 'gale']);

    expect(meta.enums[0].options).toEqual([['gale', 'gale']]);
  });

  it('keeps a set with no choices yet', () => {
    // A learner names the set before filling it, and a set that vanished
    // between keystrokes would take the dropdowns using it with it.
    expect(ruleWithChoices('Gusts', []).enums[0].options).toEqual([]);
  });

  it('reports two sets named the same, rather than silently picking', () => {
    // One name is one reference, so the second set's words appear nowhere —
    // which a learner would otherwise experience as choices that do nothing.
    // The same bargain two rules with one name get (`duplicateRuleNames`).
    const meta = parseRuleMeta(
      'rules/wind',
      JSON.stringify({
        blocks: {
          blocks: [
            {type: 'world_rule', fields: {NAME: 'Wind', ABILITY: 'Has Wind'}},
            {
              type: 'world_rule_enum',
              fields: {NAME: 'Gusts'},
              next: {block: optionChain(['breeze'])},
            },
            {
              type: 'world_rule_enum',
              fields: {NAME: 'Gusts'},
              next: {block: optionChain(['gale'])},
            },
          ],
        },
      }),
    )!;
    registerProjectEnums(meta.enums);

    // Both are read — the file says what it says …
    expect(meta.enums).toHaveLength(2);
    // … the reference answers with the first …
    expect(enumOptions('Wind#Gusts')).toEqual([['breeze', 'breeze']]);
    // … and the collision is named.
    expect(duplicateEnumNames()).toEqual(['Wind#Gusts']);

    // One block for one reference: registering a type twice does not fail, it
    // silently replaces, so the palette must not offer the chance.
    const {blocks} = buildDomainPalette([meta]);
    expect(
      blocks.filter(block => block.type === 'world_choice_Wind_Gusts'),
    ).toHaveLength(1);
  });

  it('is resolvable, and offers a chip, once the project registers it', () => {
    const meta = ruleWithChoices('Gusts', ['breeze', 'gale']);
    registerProjectEnums(meta.enums);

    expect(enumByRef('Wind#Gusts')).toEqual(meta.enums[0]);
    // The chip is the only way to name one of these choices outside a socket
    // prepared for them, so it is in the rule's own category.
    const {blocks, toolbox} = buildDomainPalette([meta]);
    expect(blocks.map(block => block.type)).toContain(
      'world_choice_Wind_Gusts',
    );
    expect(
      (toolbox as Array<{name: string; blocks: string[]}>).find(
        category => category.name === 'Wind',
      )?.blocks,
    ).toContain('world_choice_Wind_Gusts');
  });
});

describe('what the editor says about a collision', () => {
  afterEach(() => registerProjectEnums([]));

  /** A `.rule` file declaring two sets of choices under one name. */
  const ambiguous = JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_rule', fields: {NAME: 'Wind', ABILITY: 'Has Wind'}},
        {
          type: 'world_rule_enum',
          fields: {NAME: 'Gusts'},
          next: {
            block: {type: 'world_rule_enum_option', fields: {NAME: 'breeze'}},
          },
        },
        {
          type: 'world_rule_enum',
          fields: {NAME: 'Gusts'},
          next: {
            block: {type: 'world_rule_enum_option', fields: {NAME: 'gale'}},
          },
        },
      ],
    },
  });

  it('warns, the way it warns about two rules with one name', () => {
    // A project with nothing wrong in it first: what has been warned about is
    // remembered across refreshes, which the next test is about.
    refreshProjectDropdowns({});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    refreshProjectDropdowns({'rules/wind.rule': ambiguous});

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('more than one set of choices is named'),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Wind \u25b8 Gusts'),
    );
    warn.mockRestore();
  });

  it('says it once, not on every keystroke that refreshes the project', () => {
    refreshProjectDropdowns({});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    refreshProjectDropdowns({'rules/wind.rule': ambiguous});
    refreshProjectDropdowns({'rules/wind.rule': ambiguous});

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
